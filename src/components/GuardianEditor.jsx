
import React from 'react';
import { Button, Input, Grid } from '@nextui-org/react'
import { useState } from 'react';
import { isAddress } from 'viem'

function GuardianEditor({ guardian, updateFn, deleteFn, formData, setFormData }) {

  const [validityWarning, setValidityWarning] = useState("");

  function showWarning(value) {
    return value.length > 0 && validityWarning !== "";
  }
  function update(field) {
    return (e) => {
      var value = e.target.value;
      guardian[field] = value;
      updateFn(guardian);
    }
  }
  function validateAddress() {
    return (e) => {
      var value = e.target.value;
      if (!isAddress(value) && value.length > 0) {
        setValidityWarning("this is not a valid ethereum address")
      } else {
        setValidityWarning("")
      }
      guardian.address = value;
      updateFn(guardian);
    }
  }

  return (
    <div className='flexColumn'>

      <Button
        css={{ height: '$9', background: '$accents7', width: '30%' }}
        onPress={deleteFn}>
        Delete {guardian.name}
      </Button>
      <Input
        label="Name"
        value={guardian.name}
        onChange={update('name')}
      />

      <Input label="Address" value={guardian.address}
        onChange={validateAddress()}
        style={showWarning(guardian.address) ? { border: '1px solid red' } : {}} />
      <span style={{ color: 'red' }}>{validityWarning}</span>

      <Input label="Secret Question" value={guardian.secretQuestion}
        onChange={update('secretQuestion')}
      />
      <Input label="Secret Answer" value={guardian.secretAnswer}
        onChange={update('secretAnswer')} />

    </div>
  );
}

export default GuardianEditor;