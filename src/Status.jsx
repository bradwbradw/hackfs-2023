

import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';

import { getP2P, subscribeEvents } from './p2p';
import LibP2PControls from './components/LibP2PControls';


const Status = function () {

  const [libP2P, setLibP2P] = useState(null);

  var [peers, setPeers] = React.useState([]);
  var [disconnected, setDisconnected] = React.useState(0);
  var [couldNotDial, setCouldNotDial] = React.useState(0);
  var [connected, setConnected] = React.useState(0);
  var [dialing, setDialing] = React.useState(0);
  var [status, setStatus] = useState('starting libp2p...');
  var [id, setId] = useState('');

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
    },
    selfUpdate: ({ detail: { peer } }) => {
      const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)

      console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
      setId(peer.id.toString());
    }
  };

  useEffect(() => {
    var lib;
    fetch('/api/peer-info').then(r => r.json()).then((data) => {
      var peerAddress = _.first(_.get(data, 'peers', []));
      getP2P(peerAddress).then(l => {
        setLibP2P(l);

        subscribeEvents(l, subscriptions);
      });
    });
    console.log('setup lib p2p');
    //    startP2P();
    return () => {
      if (lib) {
        console.log('libp2p stopped');
        lib.stop();
      }
    }
  }, []);

  function dial(peer) {
    libP2P.dial(peer.id).catch(err => {
      console.log(`Could not dial ${peer.id}`, err);
      alert(`Could not dial \n ${peer.id}: \n${err.message}`)
      setCouldNotDial(couldNotDial => couldNotDial + 1);
    })
  }
  return (
    <>
      <LibP2PControls libp2p={libP2P} setLibP2P={setLibP2P} setStopFn={() => {
        if (libP2P && libP2P.stop) {
          libP2P.stop();
        }
      }}
        defaults={{
          debug: false,
          transportNames: 'webTransport webRTC webRTCDirect circuitRelayTransport webSockets'.split(' '),

        }}
      />
      <header>
        <h2 id="status">{status}</h2>
        <h3>ID: {id ? id : '[no id]'}</h3>
      </header>

      <main>
        <pre id="output">
          <p>connected: {connected}</p>
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