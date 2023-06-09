

import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';

import { getP2P, subscribeEvents, libp2p } from './p2p.jsx';


const Status = function () {

  var [peers, setPeers] = React.useState([]);
  var [disconnected, setDisconnected] = React.useState(0);
  var [couldNotDial, setCouldNotDial] = React.useState(0);
  var [connected, setConnected] = React.useState(0);
  var [dialing, setDialing] = React.useState(0);
  var [status, setStatus] = useState('starting libp2p...');
  var [id, setId] = useState('');

  var [start, setStart] = useState(false);

  const setupP2P = useCallback(() => {
    return getP2P(subscriptions);
  }, []);
  //
  //}, [libP2P]);

  var subscriptions = {
    discovery: (evt) => {
      const peerInfo = evt.detail
      console.log(`Found peer ${peerInfo.id.toString()}`)
      setPeers(peers => [...peers, peerInfo]);
      // dial them when we discover them

      //     libP2P.dial(peerInfo.id).catch(err => {
      //       console.log(`Could not dial ${peerInfo.id.toString()}`, err)
      //      setCouldNotDial(couldNotDial => couldNotDial + 1);
      //   })
    },
    connect: (evt) => {
      const peerId = evt.detail
      console.log(`Connected to ${peerId.toString()}`)
      setConnected(connected => connected + 1);
    },
    disconnect: (evt) => {
      const peerId = evt.detail
      console.log(`Disconnected from ${peerId.toString()}`);
      setDisconnected(disconnected => disconnected + 1);
    }
  };

  useEffect(() => {
    setupP2P()
    //    startP2P();
    return () => {

    }
  }, []);


  function dial(peer) {
    libp2p.dial(peer).catch(err => {
      console.log(`Could not dial ${peer}`, err)
      setCouldNotDial(couldNotDial => couldNotDial + 1);
    })
  }

  return (
    <>
      <h1>status</h1>

      <header>
        <h1 id="status">{status}</h1>
        <h3>ID: {id ? id : '[no id]'}</h3>
      </header>

      <main>
        <pre id="output">
          <p>disconnected: {disconnected}</p>
          <p>could not dial: {couldNotDial}</p>

        </pre>
      </main>
      <p>
        number of nodes: {peers.length}
      </p>
      <div style={{ textAlign: 'left' }}>
        <h2>peer list</h2>
        {
          peers.map((peer, i) => {
            return (
              <div key={i} style={{ marginBottom: '3em' }}>
                peer id: {peer.id.toString()}
                <ul>
                  <li>
                    addresses: <br />{peer.addresses.map(({ multiaddr, isCertified }) => {
                      return (
                        <span key={multiaddr.toString()}>
                          {multiaddr.toString()}, {isCertified ? '[CERTIFIED]' : ''}<br />
                        </span>)
                    })}

                  </li>

                  <li>
                    protocols: {peer.protocols.map((protocol, i) => {
                      return (<span key={i}>{protocol}</span>)
                    })}
                  </li>
                  <li>
                    agentVersion: {peer.agentVersion}
                  </li>
                  <li>
                    tags: <pre>{JSON.stringify(peer.tags, null, 2)}</pre>
                  </li>

                </ul>

                <button onClick={() => dial(peer)}>dial this peer</button>
              </div>);
          })
        }
      </div>
    </>
  )
}
export default Status