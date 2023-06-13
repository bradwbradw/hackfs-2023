import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { ErrorBoundary } from './ErrorBoundary'
import { Routes } from './Routes'
import Navigation from './components/Navigation'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { NextUIProvider, createTheme } from '@nextui-org/react'

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

function Profile() {
  const { address } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (address)
    return (
      <div>
        Connected to {address}
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  return <button onClick={() => connect()}>Connect Wallet</button>
}

const container = document.getElementById('app');
const rooot = createRoot(container);
rooot.render(
  <React.StrictMode >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>

      <NextUIProvider theme={createTheme({
        type: 'dark'
      })} />
      <Navigation />

      <WagmiConfig config={wagmiConfig}>
        <Profile style={{ position: 'absolute', top: 0, right: 0 }} />
      </WagmiConfig>
      <Routes />
    </ErrorBoundary>
  </React.StrictMode >
);

