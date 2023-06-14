
import { watchContractEvent } from '@wagmi/core'

const OurVaultContract = {
  create: ({
    guardians,
    threshold,
    address
  }) => {
    return new Promise((resolve, reject) => {
      // contract calling stuff goes here
      var t = setTimeout(resolve, 1500);

    });
  },
  encodeSecret: (secret) => {
    return new Promise((resolve, reject) => {

    });
  }
};

export default OurVaultContract;