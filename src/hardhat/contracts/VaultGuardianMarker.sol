// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VaultGuardianMarker is ERC721, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant BACKUP_USER = keccak256("BACKUP_USER");

    //events
    event VaultCreated(address indexed sender, address indexed deployment);
    event VaultTokenBurned(address[] guardians, uint tokenId);
    event VaultUpdated(address indexed sender, address indexed deployment, Status status);

    //status enum
    //0 (default) untouched
    //1 prepared
    //2 vaulted
    //3 Used
    enum Status {
        Untouched,
        Prepared,
        Vaulted,
        Used
    }

    Status public status;

    //config struct
    struct VaultConfig {
        address backupUser;
        address[] guardianList;
        Status status;
    }

    VaultConfig public thisVault;

    constructor(address _backupUser, address[] memory _guardianList) ERC721("Guardian Marker", "GRDN") {
        _grantRole(BACKUP_USER, msg.sender);
        thisVault = VaultConfig(_backupUser, _guardianList, Status.Prepared);
        emit VaultCreated(_backupUser, address(this));
    }

    function getBackupUser() public view returns(address) {
        return thisVault.backupUser;
    }

    function getGuardianList() public view returns(address[] memory) {
        return thisVault.guardianList;
    }

    function bindSecretandMint(bytes32[] memory shards) external {
        //@todo shards as NFT metadata?
        uint members = thisVault.guardianList.length;
        for(uint i = 0; i < members; i++) {
            //Should emit standard event
            _mint(thisVault.guardianList[i], _tokenIds.current());
            _tokenIds.increment();
        }
    }

    function recoverWithGuardians() public onlyRole(BACKUP_USER) {}

    function setNewGuardians() public onlyRole(BACKUP_USER) {}

    //@notice Tokens are non-transferrable (soulbound). Can only be burned.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721)
    {
        if (from == address(0) || to == address(0) ) {
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
            return false;
        }
    }

    //Overrides.
    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
        thisVault.status = Status.Used;
        emit VaultUpdated(thisVault.backupUser, address(this), thisVault.status);
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