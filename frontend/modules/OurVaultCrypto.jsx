//import secrets from 'secrets.js-grempe/secrets.js';
import { utils, Wallet } from 'ethers'
import * as EthSigUtil from '@metamask/eth-sig-util'
import { Buffer } from 'buffer';

const secrets = window.secrets;
const OurVaultCrypto = {
  shardTheSecret(secret, numShares, numRequiredShares) {
    const key = secrets.random(512);
    const shares = secrets.share(key, numShares, numRequiredShares);
    const comb = secrets.combine(shares);
    console.log(comb, key);
    return shares;
  },
  encryptShareWithGuardian(share, privateKey) {
    //var without0x = guardianAddress.slice(2);
    //const publicKey = utils.computePublicKey(privateKey);
    console.log("privkey no 0x", privateKey.slice(2));
    const publicKey = EthSigUtil.getEncryptionPublicKey(privateKey.slice(2));
    console.log("pubkey was:", publicKey);
    if (!publicKey) throw new Error('no public key');
    try {
      //var publicKeyBase64 = utils.base64.encode(publicKey);
      const encryptedEOAMessage = EthSigUtil.encrypt({
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
  }
}

export default OurVaultCrypto;