
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

    Promise.all(encryptedShards.map(shard => {

      return fetch('api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shard })
      }).then(res => { return res.json(); });
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

      {encryptedShards.length > 1 ? <div>
        <h3>encrypted shards look like this:</h3>
        {encryptedShards.map((shard, index) => {
          return <pre height="10" key={index} label={`encrypted shard ${index + 1}`} >
            {JSON.stringify(shard, null, 2)}
          </pre>
        })}
        <div>
          <Button onPress={() => uploadShards()}>Upload the encrypted shards to IPFS</Button>
        </div>


      </div> : <></>}


      {shardIPFSHashes.length > 0 ?
        <div>
          <h3>IPFS hashes:</h3>
          {shardIPFSHashes.map((shardData, index) => {
            return (<pre key={index} label={`shard ${index + 1} hash`} >
              {JSON.stringify(shardData, null, 2)}
              <br />
              <a href={shardData.url} target="_blank">link</a>
            </pre>)
          })}

          <p>Now, each encrypted shard is safely stored in IPFS.
            And the reference to these shards is stored on-chain in the soulbound Vault NFT.
          </p>
          <p>For brevity, we omit the second layer of encryption that would be in the final product </p>

          <h4>delete one shard! We only need 2 our of three, thanks to the magic of SHAMIR</h4>
          <Button onPress={() => {
            // delete only the first shard
            setEncryptedShards(encryptedShards.slice(1));

          }}>Delete Shard 1</Button>

          <Button onPress={() => finishRecovery()}>Recover the secret!</Button>
        </div> : <></>}

      {recoveredSecret ? <div>
        <h3>Recovered Secret:</h3>
        <Textarea label="secret" value={recoveredSecret} />
      </div> : <></>}
    </div>
  );
}

export default CryptoDemo;