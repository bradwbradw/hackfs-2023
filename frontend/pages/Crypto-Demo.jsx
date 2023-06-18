
import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Textarea, Input } from '@nextui-org/react';
import OurVaultCrypto from '../modules/OurVaultCrypto';
import MockGuardians from '../fixtures/guardians';
import { Wallet } from 'ethers';

function CryptoDemo() {

  const [secret, setSecret] = useState('hotel obvious agent lecture gadget evil jealous keen fragile before damp clarify bottle pencil sunshine rampant utility crouch camping weather vehicle lamp trap viscous')
  const [shards, setShards] = useState([]);
  const [encryptedShards, setEncryptedShards] = useState([]);
  const [newGuardians, setNewGuardians] = useState([]);
  const [shardIPFSHashes, setShardIPFSHashes] = useState([]);
  const [recoveredSecret, setRecoveredSecret] = useState('');

  function makeGuardians() {
    var newG = [0, 1, 2].map(i => {
      var k = Wallet.createRandom();
      return {
        name: `Guardian ${i + 1}`,
        address: k.address,
        privateKey: k.privateKey,
      };
    });
    console.log('new guardians', newG);
    setNewGuardians(newG);
  }
  function uploadShards() {

    Promise.all([encryptedShards[0]].map(shard => {

      return fetch('api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shard })
      }).then(res => res.json());
    })).then(hashes => {
      setShardIPFSHashes(hashes);
    })
  }

  function finishRecovery() {
    // decrypt the encrypted shards using guardians' private keys
    // combine the decrypted shards using shamir
    // display the secret
    var decryptedShards = encryptedShards.map((shard, index) => {
      return OurVaultCrypto.decryptShareWithGuardian(shard, newGuardians[index].privateKey);
    });
    var recoveredSecret = OurVaultCrypto.combineShards(decryptedShards);
    setSecret(recoveredSecret);


  }
  return (<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <h2>Our Vault (cryptography demonstration)</h2>
    <Textarea label="secret" value={secret} />
    <Button onPress={() => {

      setShards(OurVaultCrypto.shardTheSecret(secret, 3, 2));
      makeGuardians();

    }}>Shard the Secret Using Shamir</Button>
    {
      shards.map((shard, index) => {
        return (
          <Input label={"shard " + (index + 1)} key={index} value={shard} />
        );
      }
      )
    }
    <hr />
    {shards.length > 2 ? <div>
      <h3>encrypt each shard with a guardian's public key</h3>

      {shards.map((shard, index) => {
        return <Input key={index} label={`guardian ${index + 1} key`} value={newGuardians[index].address} />
      })}
      <Button onPress={() => {
        setEncryptedShards(shards.map((shard, index) => {
          return OurVaultCrypto.encryptShareWithGuardian(shard, newGuardians[index].privateKey);
        }));
      }}>Encrypt the shards</Button>
    </div> : <></>}

    {encryptedShards.length > 2 ? <div>
      <h3>encrypted shards look like this:</h3>
      {encryptedShards.map((shard, index) => {
        return <Input key={index} label={`encrypted shard ${index + 1}`} value={JSON.stringify(shard)} />
      })}
      <div>
        <Button onPress={uploadShards}>Upload the encrypted shards to IPFS</Button>
      </div>


    </div> : <></>}

    {shardIPFSHashes.length > 0 ? <div>
      <h3>IPFS hashes:</h3>
      {shardIPFSHashes.map((shardData, index) => {
        return <pre key={index} label={`shard ${index + 1} hash`} style={{ width: '30%', height: '250px' }} >
          {JSON.stringify(shardData, null, 2)}
          <br />
          <a href={shardData.url} target="_blank">link</a>
        </pre>
      })}

      <p>Now, each encrypted shard shard is safely stored in IPFS.
        And the reference to these shards is stored on-chain in the soulbound Vault NFT.
      </p>
      <p>If the owner of the secret needs a recovery, they can ask one of the guardians IRL (in real life)
        to initiate the recovery process on their behalf.
      </p>
      <p>
        The dapp can facilitate tha action of each guardian signing to decrypt their shard, which is then <i>re-encrypted</i>
        and uploaded to a brand new IPFS address.</p>

      <p>The Backup User's dapp instance can download the unlocked shards. To decrypt them, the password can either be the answer to a
        security question, OR a one-time code can be generated from the Guardian's browser and sent directly to the Backup User's browser.
      </p>
      <p>Once the Backup User has the decrypted shards, they can recombine them to reveal the secret. </p>

      <Button onPress={finishRecovery()}>Recover the secret!</Button>
    </div> : <></>}
    {recoveredSecret ? <div>
      <h3>Recovered Secret:</h3>
      <Textarea label="secret" value={secret} />
    </div> : <></>}
  </div>
  );
}

export default CryptoDemo;