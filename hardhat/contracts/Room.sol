// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Room is ERC721, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter public vaultInstanceCounter;

    //Events
    event RoomThresholdUpdated(uint threshold);
    event VaultInstanceCreated(uint indexed vaultInstanceId, address requestor);
    event VaultInstanceUpdated(uint indexed vaultInstanceId, address[] guardians);
    event VaultInstanceRecoveryStarted(uint indexed vaultInstanceId, address initiator);
    event VaultInstanceBurned(uint indexed vaultInstanceId, address requestor);

    //Vault Instance status
    //0 (default) Ready
    //1 Vaulted
    //2 Recoverable
    //3 Burned
    enum Status {
        Ready,
        Vaulted,
        Recoverable,
        Burned
    }

    //Room variables
    uint public threshold;
    address public deployer;

    //VaultInstance variables
    mapping(uint => VaultInstanceConfig) public vaultInstances;
    Status public status;

    //config struct
    struct VaultInstanceConfig {
        uint vaultInstanceId;
        address requestor;
        address[] guardiansList;
        //@todo add uint numGuardians?
        Status status;
    }

    constructor(uint _threshold) ERC721("Guardian Marker", "GRDN") {
        threshold = _threshold;
        deployer = msg.sender;
    }

    function updateRoom(uint _threshold) public {
        require(msg.sender == deployer, "Only Deployer may update Room.");
        threshold = _threshold;
        emit RoomThresholdUpdated(threshold);
    }

    function getRequestor(uint _vaultInstanceId) public view returns(address) {
        return vaultInstances[_vaultInstanceId].requestor;
    }

    function getGuardiansList(uint _vaultInstanceId) public view returns(address[] memory) {
        return vaultInstances[_vaultInstanceId].guardiansList;
    }

    //Create a Vault Instance arrangement with:
    //1. a requestor
    //2. a list of guardians
    //3. encrypted shards, one per guardian

    function createVaultInstance(address[] memory _guardiansList, bytes32[] memory _shards) external {
        //@todo use shards from requestor session as NFT metadata

        //Requestor is msg.sender here

        //Get the current vault instance number for an ID.
        uint _vaultInstanceId = vaultInstanceCounter.current();

        //Populate the vaultInstance's config
        vaultInstances[_vaultInstanceId].requestor = address(msg.sender);
        vaultInstances[_vaultInstanceId].guardiansList = _guardiansList;

        //Count the guardians.
        uint members = vaultInstances[_vaultInstanceId].guardiansList.length;
        //_setupRole(REQUESTOR_ROLE, msg.sender);

        //Loop over guardiansList and mint them NFTs representing the shards.
        for(uint i = 0; i < members; i++) {
            //Should emit standard event
            _mint(vaultInstances[_vaultInstanceId].guardiansList[i], _tokenIds.current());
            _tokenIds.increment();
        }

        //Set vaultInstance status
        vaultInstances[_vaultInstanceId].status = Status.Vaulted;

        //Emit creation event
        emit VaultInstanceCreated(_vaultInstanceId, vaultInstances[_vaultInstanceId].requestor);

        //Increment counter for next instance
        vaultInstanceCounter.increment();
    }

    function recoverWithGuardians(uint _vaultInstanceId) public {

        //Flag to allow to proceed
        bool authorization = false;
        uint members = vaultInstances[_vaultInstanceId].guardiansList.length;
        
        //Check if msg.sender == requestor
        if (vaultInstances[_vaultInstanceId].requestor == msg.sender) {
            authorization = true;
        }

        //Check if msg.sender is any of guardians
        for (uint i = 0; i < members; i++) {
            //If we already have flag, moves on
            if (!authorization 
                && vaultInstances[_vaultInstanceId].guardiansList[i] == msg.sender) {
                authorization = true;
                break;
            }

        }
        //Check for flag
        require(authorization == true, 
        "Sender was neither requestor nor guardian for this instance");

        //Set recover status
        vaultInstances[_vaultInstanceId].status = Status.Recoverable;

        //Emit recover event
        emit VaultInstanceRecoveryStarted(_vaultInstanceId, msg.sender);
    }

    function setNewGuardians(uint _vaultInstanceId, address[] memory _guardiansList) public {
        //Requestor only
        if (msg.sender == vaultInstances[_vaultInstanceId].requestor) {
            //replace with new guardiansList entirely
            delete vaultInstances[_vaultInstanceId].guardiansList;
            vaultInstances[_vaultInstanceId].guardiansList = _guardiansList;
            //Emit update event
            emit VaultInstanceUpdated(_vaultInstanceId, _guardiansList);
        }
        
    }

    //@notice Tokens are non-transferrable (soulbound). Can only be burned.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721)
    {
        if (from != address(0) ) {
            revert("Token not transferable.");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function checkSignature(address signer, bytes32 hash, bytes memory signature) public view returns(bool valid) {
        if (SignatureChecker.isValidSignatureNow(signer, hash, signature)) {
            //valid signature
            return true;
        }
        else {
            //invalid signature
            return false;
        }
    }

    //Allows guardians to burn their soulbound as cleanup after
    function setVaultInstanceBurned(uint _vaultInstanceId) public {
        require(msg.sender == vaultInstances[_vaultInstanceId].requestor, "Only requestor may set Status: Burned");

        //Set status
        vaultInstances[_vaultInstanceId].status = Status.Burned;

        //Emit burn event
        emit VaultInstanceBurned(_vaultInstanceId, msg.sender);
    }

    /** Overrides **/
    function _burn(uint _vaultInstanceId) internal override(ERC721) {
         if (vaultInstances[_vaultInstanceId].status == Status.Burned) {
            //super._burn(tokenId);
         }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}