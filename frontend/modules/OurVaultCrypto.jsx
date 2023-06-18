import { utils, Wallet } from 'ethers'
import * as EthSigUtil from '@metamask/eth-sig-util'
import { Buffer } from 'buffer';

window.Buffer = Buffer;
const secrets = window.secrets;
const OurVaultCrypto = {
  shardTheSecret(secret, numShares, numRequiredShares) {
    const hexedSecret = secrets.str2hex(secret);
    const shares = secrets.share(hexedSecret, numShares, numRequiredShares, 512);
    console.log(secrets.extractShareComponents(shares[0]));
    console.log(hexedSecret, shares);
    return shares;
  },
  encryptShareWithGuardian(share, privateKey) {
    const publicKey = EthSigUtil.getEncryptionPublicKey(privateKey.slice(2));
    console.log("pubkey was:", publicKey);
    var encryptedEOAMessage = 'something went wrong';
    if (!publicKey) throw new Error('no public key');
    try {
      encryptedEOAMessage = EthSigUtil.encrypt({
        publicKey,
        data: share,
        version: 'x25519-xsalsa20-poly1305'
      }
      );
    } catch (error) {
      console.log(error);
      return "[invalid]";
    }
    return encryptedEOAMessage;
  },
  decryptShareWithGuardian(encryptedShare, privateKey) {
    const decryptedShare = EthSigUtil.decrypt({
      encryptedData: encryptedShare,
      privateKey: privateKey.slice(2)
    });

    return decryptedShare;
  },
  combineShards(shards) {
    console.log("shards: ", shards);
    return secrets.combine(shards);
  }
}

export default OurVaultCrypto;