
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
    <div style={{ border: '1px dotted grey', display: 'flex', justifyContent: 'end', alignItems: 'center', gap: '1em' }}>
      {address ? (
        <>
          Connected to {address}
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </>
      ) : <Button onClick={() => connect()}>Connect Web 3</Button>}
    </div>
  );
}


function Web3UI({ children }) {

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
      {children}
    </WagmiConfig>
  );
}
export default Web3UI;