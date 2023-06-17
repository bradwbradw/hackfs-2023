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

    //@todo might not need roles if we can check VaultInstanceConfig for certain actions
    bytes32 public constant REQUESTOR_ROLE = keccak256("REQUESTOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    //Events
    event VaultInstanceCreated(uint indexed vaultInstanceId, address requestor);
    event VaultInstanceBurned(uint indexed vaultInstanceId, address[] guardians);
    event VaultInstanceUpdated(uint indexed vaultInstanceId, address[] guardians);
    event RoomThresholdUpdated(address indexed deployed, uint threshold);

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
    Status public status;
    uint public threshold;
    mapping(uint => VaultInstanceConfig) public vaultInstances;

    //config struct
    struct VaultInstanceConfig {
        uint vaultInstanceId;
        address requestor;
        address[] guardiansList;
        Status status;
    }

    constructor(uint _threshold) ERC721("Guardian Marker", "GRDN") {
        threshold = _threshold;
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
    //3. secret shards, one per guardian

    function createVaultInstance(address[] memory _guardiansList, bytes32[] memory _shards) external {
        //@todo use shards as NFT metadata

        //Requestor is msg.sender

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

        //Increment counter for next instance
        vaultInstanceCounter.increment();
    }

    //@todo Anyone of requestor or guardians may call
    function recoverWithGuardians(uint _vaultInstanceId) public {
        require(vaultInstances[_vaultInstanceId].requestor == msg.sender, 
        "Sender was neither requestor nor guardian for this instance");
    }

    function setNewGuardians(uint _vaultInstanceId, address[] memory _guardiansList) public {
        //load the vault instance into memory
        if (msg.sender == vaultInstances[_vaultInstanceId].requestor) {
            //update with new guardiansList totally
            vaultInstances[_vaultInstanceId].guardiansList = _guardiansList;
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
            //
            return true;
        }
        else {
            return false;
        }
    }

    //Overrides.
    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
        //@todo how to find the InstanceId from tokenId?
        //Update the Instance status if any of them get burned.
        //vaultInstances[_vaultInstanceId].status = Status.Burned;
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