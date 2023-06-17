
import React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@nextui-org/react'

import { WagmiConfig, createConfig, mainnet, useAccount, useConnect, useDisconnect, useNetwork, useSignMessage } from 'wagmi'

//import { SiweMessage } from 'siwe'
import { createPublicClient, http } from 'viem'
import { InjectedConnector } from 'wagmi/connectors/injected'



function MakeUI() {

  {/*}: {
  onSuccess: (args: { address: string }) => void
  onError: (args: { error: Error }) => void
}) {*/}

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork()
  const { signMessageAsync } = useSignMessage()

  const [user, setUser] = useState(null);
  const [nonce, setNonce] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const fetchNonce = async () => {
    try {
      const nonceRes = await fetch('/api/nonce');
      const nonce = await nonceRes.text();
      setNonce(nonce);
    } catch (error) {
      setError(error);
    }
  }

  useEffect(() => {
    //    fetchNonce();
  },
    []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        const user = await res.json();
        if (user.status === 'restricted') {
          console.log('user is not signed in');
          setUser(null);
        } else {
          setUser(user);
          console.log('user signed in', user);
        }
      } catch (error) {
        console.error(error);
      }
    }

    //fetchUser();
    //window.addEventListener('focus', fetchUser);

    return () => window.removeEventListener('focus', fetchUser);
  }, []);

  const signIn = async () => {
    try {
      const chainId = chain?.id
      if (!address || !chainId) return

      setLoading(true);
      // Create SIWE message with pre-fetched nonce and sign with wallet
      /*   const message = new SiweMessage({
           domain: window.location.host,
           address,
           statement: 'Sign in with Ethereum to the app.',
           uri: window.location.origin,
           version: '1',
           chainId,
           nonce,
         });*/
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })

      // Verify signature
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
      })
      if (!verifyRes.ok) throw new Error('Error verifying message')
      setLoading(false);
      alert(address);
    } catch (error) {
      setLoading(false);
      setNonce(undefined);
      alert(error);
      fetchNonce();
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: '1em', padding: '2em' }}>
      {address ? (
        <>
          Connected to {address}
          <Button onClick={() => disconnect()}>Disconnect</Button>

          {user ? <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <Button onClick={() => fetch('/api/logout')}>Logout</Button>
          </> :
            <Button disabled={!nonce || loading} onClick={signIn}>
              Sign-In with Ethereum
            </Button>
          }
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