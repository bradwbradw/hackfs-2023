

import React, { useEffect, useLocation } from 'react'
import Contract from '../modules/Contract'
import { Button, Input, Textarea } from '@nextui-org/react';
import WriteContractButton from '../components/WriteContractButton';
import _ from 'lodash';

import HubClient from '@anephenix/hub/lib/client';

import { useAccount } from 'wagmi'


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
          <Button >Do Backup</Button>
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