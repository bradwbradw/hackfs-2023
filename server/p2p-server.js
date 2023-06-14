
import 'dotenv/config'

import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { webRTCDirect, webRTC } from '@libp2p/webrtc'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { circuitRelayTransport, circuitRelayServer } from 'libp2p/circuit-relay'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { multiaddr } from 'multiaddr'
import { pingService } from 'libp2p/ping'
import { identifyService } from 'libp2p/identify'
import { kadDHT } from '@libp2p/kad-dht'

import { bootstrap } from '@libp2p/bootstrap'

import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

var peers = [];

var libp2p;

var TOPIC = 'universal-connectivity';

function startLibp2p() {

  return createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0/wss',
        '/dnsaddr/our.vault/tcp/0/wss',
        '/dnsaddr/our-vault.glitch.me/tcp/0/wss'
      ]
    },
    transports: [
      webSockets({
        filter: filters.all
      })],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    services: {
      identify: identifyService(),
      relay: circuitRelayServer(),/*
      pubsub: gossipsub({ allowPublishToZeroPeers: true }),
      */
      dht: kadDHT({
        //kBucketSize: 20,
        protocolPrefix: '/our-vault',
        clientMode: false           // Whether to run the WAN DHT in client or server mode (default: client mode)
      })

    },
  }).then((l) => {
    libp2p = l;

    libp2p.addEventListener('peer:discovery', (evt) => {
      console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
    })

    libp2p.addEventListener('peer:connect', (evt) => {
      console.log('Connected to', evt.detail); // Log connected peer
    })

    libp2p.services.pubsub?.subscribe(TOPIC, (msg) => {
      console.log(msg);
      if (msg.topic === TOPIC) {
        // msg.data - pubsub data received
        console.log(msg.data.toString());
      }
    });

    libp2p.services.pubsub?.addEventListener('message', (message) => {
      console.log(`${message.detail.topic}:`, new TextDecoder().decode(message.detail.data))
    })

    // node2 publishes "news" every second
    setInterval(() => {
      libp2p.services.pubsub?.publish(TOPIC, uint8ArrayFromString('i like turtles')).then(() => {
        console.log('published');
      }).catch(err => {
        console.error(err)
      })
    }, 10000)
    // start libp2p
    return libp2p.start()
      .then(() => {

        console.log('libp2p has started')

        // print out listening addresses
        console.log('listening on addresses:')
        libp2p.getMultiaddrs().forEach((addr) => {
          console.log(addr.toString())
          peers.push(addr.toString());
          //deduplicate peers
          peers = [...new Set(peers)];
        })

        const stop = () => {
          // stop libp2p
          return libp2p.stop().then(() => {

            console.log('libp2p has stopped')
            process.exit(0)
          })
        }

        process.on('SIGTERM', stop)
        process.on('SIGINT', stop)
        return peers;
      })
  });
};

function getPeers() {
  return peers;
}

export { startLibp2p, getPeers };