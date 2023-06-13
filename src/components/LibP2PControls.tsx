

import React, { useState, useEffect } from 'react';

import { createLibp2p } from 'libp2p'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { identifyService } from 'libp2p/identify'
import { kadDHT } from '@libp2p/kad-dht'
import { webSockets } from '@libp2p/websockets'
import * as filters from "@libp2p/websockets/filters"
import { webTransport } from '@libp2p/webtransport'
import { webRTCDirect, webRTC } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import type { Message, SignedMessage } from '@libp2p/interface-pubsub'
import { sha256 } from 'multiformats/hashes/sha2'
import _ from 'lodash'
import { Checkbox } from '@nextui-org/react'


function LibP2PControls({ libP2P, setLibP2P, defaults }) {// peerRouting, contentRouting, dht, pubsub, peerStore, config, options, modules,}){

  var inits = localStorage.getItem('debug');
  var initDebug = _.isString(inits)

  console.log('init debug', initDebug);
  const [debug, setDebug] = useState(initDebug);

  useEffect(() => {
    if (debug) {

      localStorage.setItem('debug', 'libp2p:*');
      //'libp2p:websockets,libp2p:webtransport,libp2p:kad-dht,libp2p:dialer';

    } else {
      localStorage.removeItem('debug');
    }
  }, [debug]);
  const protocolNames = 'webrtc ws'.split(' ');

  const transportNameLibMap = {
    webSockets,
    webTransport,
    webRTCDirect,
    webRTC,
    circuitRelayTransport
  };

  var transportNames = _.keys(transportNameLibMap);

  const selectionOptions = {
    addresses: {
      listen: protocolNames,
      announce: protocolNames
    },
    transports: []
  };
  /* 
    availableAddresses = {
      listen: protocols
    };
  
    const buildFns = {
      addresses: {
        listen: [],
        announce: []
      },
      transports: []
    };
  
    const [options, setOptions] = useState({
      addresses, transports, connectionManager, connectionEncryption, streamMuxers, peerDiscovery, services, connectionGater, eventListenerHandlers
    });

  const [transports, setTransports] = useState(transports);
   */

  useEffect(() => {
    (async () => {
      setLibP2P(libP2P);
    })();
    return () => {
      (async () => {
        // more elegant shutdown opportunity
        if (libP2P && libP2P.stop) {
          libP2P.stop();
        }
      })();
    }
  }, [libP2P]);

  useEffect(() => {

  }, [libP2P]);

  return (
    <div>
      <h4>libP2P Controls</h4>
      <div>
        {/*}
        <label htmlFor='addresses.listen'>
          listen addresses
        </label>
        <select
          id='addresses.listen'
          multiple={true}
          value={protocolNames}
          onChange={(event) => { console.log(event); }} >

        </select>


        <label htmlFor='addresses.announce'>
          announce addresses
        </label>
        <select id='addresses.announce' multiple={true} value={protocolNames}
          onChange={(event) => { console.log('announce address change', event); }}>

        </select>



        <label >transports
        </label>
        <Checkbox.Group
          style={{ color: 'white', border: '1px solid lime' }}
          defaultValue={defaults.transportNames}
          label="Select cities"
          onChange={(event) => {
            console.log('checkbox group change', event);
          }}
        >
          {transportNames.map((transportName) => {
            return (
              <label key={transportName}>{transportName}
                <Checkbox key={transportName} aria-label={transportName}
                  value={transportName}>
                </Checkbox>
              </label>);
          })}
        </Checkbox.Group>
        {*/}

        <Checkbox aria-label='debug' value={debug} onChange={(value) => {
          setDebug(value);
        }} defaultSelected={debug}>
          debug
        </Checkbox>


      </div>
    </div >
  );
}

export default LibP2PControls