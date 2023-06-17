

import React, { useEffect, useLocation } from 'react'
import Contract from '../modules/Contract'
import { Button, Input, Textarea } from '@nextui-org/react';
import WriteContractButton from '../components/WriteContractButton';
import _ from 'lodash';

import HubClient from '@anephenix/hub/lib/client';

import { useAccount } from 'wagmi'

console.log('window', window);
var wsUrl;

if (window.location.href.indexOf('localhost') > -1) {
  wsUrl = 'ws://localhost:3000';
} else {
  wsUrl = 'wss://our-vault.glitch.me';
}
console.log('websocket url', wsUrl);
const hubClient = new HubClient({ url: wsUrl });







function Room({ id }) {

  const [guardians, setGuardians] = React.useState([]);
  const [vaultRoom, setVaultRoom] = React.useState({});
  const [secret, setSecret] = React.useState('hotel obvious agent lecture gadget evil jealous keen fragile before damp clarify bottle pencil sunshine rampant utility crouch camping weather vehicle lamp trap viscous');

  const { address, isConnecting, isDisconnected } = useAccount();
  function setAddress() { };
  //  const [address, isConnected] = useAccount();

  useEffect(() => {
    Contract.getGuardians().then((guardians) => {
      setGuardians(guardians);
    });
    return () => setGuardians([]);
  }, []);

  var timeout = null;

  function makeMessage() {
    return address + ':: I like turtles ' + new Date().getTime();
  }
  useEffect(() => {
    async function subscribeToChannel() {
      await hubClient.subscribe(id);
      hubClient.addChannelMessageHandler(id, (message) => {
        //console.log('message received', message);
      }
      );

    }
    async function unsubscribeFromChannel() {
      await hubClient.unsubscribe(id);
    }

    timeout = setInterval(() => {
      hubClient.publish(id, makeMessage());
    }, 5000);

    subscribeToChannel();
    return () => {
      //      await hubClient.unsubscribe(id);
      unsubscribeFromChannel();
      clearInterval(timeout);
    }
  },
    [id, address]);

  function handleSecret() {
    var length = secret.length;
    var chunkSize = Math.ceil(length / guardians.length);
    //    var shards = 
    var chunks = _.chunk(secret, chunkSize);//_.zip(_.chunk(secret, guardians.length));
    console.log('chunks', chunks);

  }

  function recover() {

  }

  function isPresent(guardian) {
    return false;
  }
  function isAuthenticated(guardian) {
    return false;
  }
  function didSignRecovery(guardian) {
    return false;
  }

  function canStartRecovery() {
    return !!address;
  }

  return (
    <>
      <h2>Vault Room </h2>
      <h3>id: {id}</h3>

      <div style={{ width: '100vw', display: 'flex', gap: '2em', justifyContent: 'space-evenly', alignItems: 'start' }}>
        <div style={{ textAlign: 'center', width: '45%', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <h2>Backup Secret</h2>
          <Textarea
            label='your secret'
            style={{ fontFamily: 'courier', height: '10em' }}
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
            }}></Textarea>
          <br /><br />
          <pre>{secret}</pre>
          <Button onPress={() => handleSecret()}>Do Backup</Button>
        </div>

        <div style={{ textAlign: 'left' }}>
          {address}
          <h3>Guardians</h3>
          {guardians.map((guardian, i) => {
            return (
              <div key={i}>
                <h4>{guardian.name}</h4>
                <p>{guardian.address}</p>
                <ul>
                  <li>present? {isPresent(guardian) ? '✅' : '❌'}</li>
                  <li>authenticated? {isAuthenticated(guardian) ? '✅' : '❌'}</li>
                  <li>signed recovery? {didSignRecovery(guardian) ? '✅' : '❌'}</li>
                </ul>
              </div>

            );
          })}
        </div>
      </div>

      {canStartRecovery() ?
        <WriteContractButton options={Contract.optionsForRequestRecoveryTx({ address })} onSuccess={({ hash }) => { }}>
          Start recovery
        </WriteContractButton> : <>(recovery unavailable)</>}
      <Button onPress={() => { }}>Modify Vault</Button>
    </>
  )
}

export default Room