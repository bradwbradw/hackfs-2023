
import React from "react";
import { useState } from "react";
import { Link } from "wouter";

import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { Input, Button, Grid, useInput, Checkbox } from "@nextui-org/react";

import GuardianEditor from "../components/GuardianEditor";

function Create() {
  const { address, isConnecting, isDisconnected } = useAccount();

  var defaultFormData = {
    guardians: [
      {
        name: "Guardian 1",
        address: "",
        secretQuestion: "",
        secretAnswer: ""
      },
      {
        name: "Guardian 2",
        address: "",
        secretQuestion: "",
        secretAnswer: ""
      }
    ],
    threshold: 2,
    userUnderstands: false,
    address: ""
  };

  const [formData, setFormData] = useState(defaultFormData);


  function addGuardian() {
    var newGuardian = {
      name: "Guardian " + (formData.guardians.length + 1),
      address: "",
      secretQuestion: "",
      secretAnswer: ""
    };
    setFormData({ ...formData, ...{ guardians: [...formData.guardians, newGuardian] } })
  }

  function validateAddress(address) {
    return isAddress(address);
  }

  function updateGuardian(index) {
    const newGuardians = [...formData.guardians];
    return (updatedGuardian) => {
      newGuardians[index] = updatedGuardian;

      setFormData({ ...formData, guardians: newGuardians })
    }
  }

  function deleteGuardian(index) {
    return () => {
      formData.guardians.splice(index, 1);
      setFormData({ ...formData, guardians: formData.guardians });
    }
  }

  function numGuardians() {
    return formData.guardians.length;
  }

  function busNumberr() {
    return numGuardians() - formData.threshold + 1;
  }

  function validityMessage(formData) {
    if (numGuardians() < 3) {
      return "You must have at least 3 guardians";
    }
    for (var i = 0; i < formData.guardians.length; i++) {
      if (!isAddress(formData.guardians[i].address)) {
        return "All guardians must have valid ethereum addresses";
      }
    }

    if (!formData.userUnderstands) {
      return "Please ensure you understand the threshold and what it means, and indicate so my checking the box above in 'Threshold Settings'";
    }
    // check if any two guardians have the same address
    if (new Set(formData.guardians.map(g => g.address)).size !== formData.guardians.length) {
      return "All guardians must have unique addresses";
    }
    return "";
  }

  function guardiansText() {
    var busNumber = busNumberr();//numGuardians() - formData.threshold + 1;
    var text1 = `Your vault requires ${formData.threshold} out of ${numGuardians()} guardians to be able to digitally sign,
     in order to recover.`;
    var text2 = `If ${busNumber === 1 ? 'ANY ONE' : busNumber === numGuardians() ? 'all' : busNumber} of your guardians ${busNumber === 1 ? 'is' : 'are'} unavailable, 
     you will not be able to recover your secret.\n\n`;
    return (<div>
      <div>{text1}</div>
      <div style={{ fontWeight: 'bold', fontSize: 'large', width: '300px' }}>{text2}</div>
    </div>
    );
  }
  return (
    <div className="Create">
      <h1>Create</h1>
      <div>
        <div>
          {address ? (
            <form style={{ display: 'flex', flexDirection: 'column' }} className={"guardians"}>

              {formData.guardians.map((guardian, index) => {
                return (
                  <div key={index} style={{ flexDirection: 'column' }}>
                    <h4>
                      Guardian #{index + 1}
                    </h4>
                    <GuardianEditor
                      guardian={guardian}
                      updateFn={updateGuardian(index)}
                      deleteFn={deleteGuardian(index)}
                      setFormData={setFormData} />
                  </div>
                )
              })}
              <Button onPress={addGuardian}>Add Guardian</Button>


              <div style={{ border: '1px solid grey', padding: '1.5em', margin: '1em', textAlign: 'left' }}>
                <h4>Threshold Settings</h4>
                <Input
                  type="number"
                  label="Minimum number of signers"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  max={numGuardians()}
                  min={1}
                >
                </Input>
                {guardiansText()}
                <br />
                <Checkbox label="I understand what this threshold setting means" value={formData.userUnderstands} checked={true} onChange={(checked) => {
                  setFormData({ ...formData, userUnderstands: checked })
                }} />
              </div>


              <div className='flexCenter flexColumn'>
                <Button size="xl" disabled={validityMessage(formData) !== ""}>Continue</Button>
                <p style={{ color: 'lime' }}>{validityMessage(formData)}</p>
              </div>
            </form>
          ) : (<>
            please click "Connect wallet" above to connect to your Web3 browser extension
          </>)}
        </div>
      </div>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div >
  );
}

export default Create;