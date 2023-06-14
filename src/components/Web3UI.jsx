
import React from 'react';
import { Button } from '@nextui-org/react'

import { WagmiConfig, createConfig, mainnet, useAccount, useConnect, useDisconnect } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { InjectedConnector } from 'wagmi/connectors/injected'



function MakeUI() {

  const { address } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()
  return (
    address ? (
      <div>
        Connected to {address}
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </div>
    ) : <Button onClick={() => connect()}>Connect Wallet</Button>
  );
}


function Web3UI() {

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient: createPublicClient({
      chain: mainnet,
      transport: http(),
    }),
  });



  return (
    <WagmiConfig config={wagmiConfig}>
      <MakeUI />
    </WagmiConfig>
  );
}
export default Web3UI;