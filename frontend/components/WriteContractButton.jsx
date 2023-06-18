
import React from 'react';
import { Button, Input, Grid } from '@nextui-org/react'
import { usePrepareContractWrite, useContractWrite } from 'wagmi';

import _ from 'lodash';

import { Loading, Text } from '@nextui-org/react';

function WriteContractButton({ valid, options, onSuccess, children }) {

  const { config, error } = usePrepareContractWrite(options);

  const { writeAsync, isLoading, isSuccess } = useContractWrite(config);

  function status() {
    if (isLoading) {
      return <Loading />;
    } else if (error) {
      return <Text color="error">
        {error.message}
      </Text>;
    } else if (isSuccess) {
      return <Text color="success">
        Success!
      </Text>;
    } else {
      return <Text
        color="secondary"
        size="small"
        variant="caption"
      >(idle)</Text>;
    }
  }

  function tryWrite() {
    writeAsync().then((result) => {
      if (_.isFunction(onSuccess)) onSuccess(result);
    }).catch((error) => {
      //      onSuccess('fake')
      alert(error);
    });
  }

  return (
    <>
      <Button
        onPress={tryWrite}
        disabled={!valid || error || isLoading}>
        {children}
      </Button>
      <span>{status()}</span>
    </>
  );
}

export default WriteContractButton;