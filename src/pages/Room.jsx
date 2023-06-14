

import React, { useEffect } from 'react'
import Contract from '../modules/Contract'
import { Button } from '@nextui-org/react';

// initialize array with each value a boolean with 30% chance of being true
function initArray(length) {
  var arr = new Array(length);
  for (var i = 0; i < length; i++) {
    arr[i] = Math.random() > 0.7;
  }
  return arr;
}

var randomArr = initArray(30);
var n = 0;


function Room({ id }) {

  const [guardians, setGuardians] = React.useState([]);

  useEffect(() => {
    Contract.getGuardians().then((guardians) => {
      setGuardians(guardians);
    });
    return () => setGuardians([]);
  }, []);


  var unsubscribeWatcher = Contract.getWatcher((events) => {
    console.log('watch happened', events[0]);
  });

  function recover() {

  }

  function isPresent(guardian) {
    return randomArr[n++ % 29];
  }
  function isAuthenticated(guardian) {
    return randomArr[n++ % 29];
  }
  function didSignRecovery(guardian) {
    return randomArr[n++ % 29];
  }



  return (
    <>
      <h2>room for id {id}</h2>

      <div style={{ textAlign: 'left' }}>
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
      <Button onPress={recover}>Start recovery</Button>
      <Button onPress={() => { }}>Modify Vault</Button>
    </>
  )
}

export default Room