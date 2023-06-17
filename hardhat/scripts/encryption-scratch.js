/** Shamir in secrets.js for Node **/
const secrets = require("secrets.js")

// Generate a 512-bit key
const key = secrets.random(512) // => key is a hex string

// Split into 3 shares with a threshold of 2
const shares = secrets.share(key, 3, 2)

console.log(shares);

// Combine ALL shares
const comb = secrets.combine(shares)
console.log(comb === key) // => true


/** Public key encryption **/
const ethers = require('ethers');
const sigUtil = require('eth-sig-util');

//A given guardian's single share
const singleShare = shares.slice(0, 1);

// Guardian's EOA
const guardianAddr = '0x1234567890123456789012345678901234567890';

//Derive pubkey
const publicKey = ethers.utils.computePublicKey(guardianAddr);
console.log(publicKey);

// Encrypt share with guardian's public key
const encryptedEOAMessage = sigUtil.encrypt(
    publicKey,
  { data: singleShare },
  'x25519-xsalsa20-poly1305'
);

console.log(encryptedEOAMessage);

// Request decryption by Guardian using web3 provider
const decryptedSingleShare = await ethereum.request({
  method: 'eth_decrypt',
  params: [encryptedEOAMessage, publicKey],
});

//@todo Now the DApp should ask the Guardian for the decrypted result input.

/** Encrypt for recovery by password **/

//NB: better to use salts here to derive a key

//Password to use as encryption key
const password = "$ForYour85EyesOnly$"

var aesCrypto = require("crypto-js/aes");
var encoderUtf8 = require("crypto-js/enc-utf8");

// Encrypt
var ciphertext = aesCrypto.encrypt(decryptedSingleShare, password).toString();

// Decrypt
var decryptedBytes  = aesCrypto.decrypt(ciphertext, password);
var originalSingleShare = decryptedBytes.toString(encoderUtf8);

//Check
console.log(originalSingleShare === decryptedSingleShare);

//@todo next, DApp needs to deposit this on IPFS/Filecoin.