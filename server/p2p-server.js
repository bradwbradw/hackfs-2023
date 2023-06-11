
import 'dotenv/config'

import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
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

import { bootstrap } from '@libp2p/bootstrap'

import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

var peers = [];

var libp2p;

var TOPIC = 'universal-connectivity';

function startLibp2p() {

  return createLibp2p({
    addresses: {
      // add a listen address (localhost) to accept TCP connections on a random port
      //    announce: ['/dnsaddr/our.vault/ws'],
      listen: ['/ip4/0.0.0.0/tcp/0/ws']
    },
    transports: [
      tcp(),
      webSockets(),
      webRTC(),
      circuitRelayTransport({ // allows the current node to make and accept relayed connections
        discoverRelays: 0, // how many network relays to find
        reservationConcurrency: 1 // how many relays to attempt to reserve slots on at once
      })],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    /*   peerDiscovery: [
         bootstrap({
           list: peers, // provide array of multiaddrs
         })
       ],*/
    services: {
      identify: identifyService(),
      relay: circuitRelayServer(),/*
      relay: circuitRelayServer({ // makes the node function as a relay server
        hopTimeout: 30 * 1000, // incoming relay requests must be resolved within this time limit
        advertise: true,
        reservations: {
          maxReservations: 15, // how many peers are allowed to reserve relay slots on this server
          reservationClearInterval: 300 * 1000, // how often to reclaim stale reservations
          applyDefaultLimit: true, // whether to apply default data/duration limits to each relayed connection
          defaultDurationLimit: 2 * 60 * 1000, // the default maximum amount of time a relayed connection can be open for
          defaultDataLimit: BigInt(2 << 7), // the default maximum number of bytes that can be transferred over a relayed connection
          maxInboundHopStreams: 32, // how many inbound HOP streams are allow simultaneously
          maxOutboundHopStreams: 64 // how many outbound HOP streams are allow simultaneously
        }
      }),*/
      pubsub: gossipsub({ allowPublishToZeroPeers: true }),
      ping: pingService({
        protocolPrefix: 'ipfs', // default
      }),
    },
  }).then((l) => {
    libp2p = l;

    libp2p.addEventListener('peer:discovery', (evt) => {
      console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
    })

    libp2p.addEventListener('peer:connect', (evt) => {
      console.log('Connected to', evt.detail); // Log connected peer
    })

    libp2p.services.pubsub.subscribe(TOPIC, (msg) => {
      console.log(msg);
      if (msg.topic === TOPIC) {
        // msg.data - pubsub data received
        console.log(msg.data.toString());
      }
    });

    libp2p.services.pubsub.addEventListener('message', (message) => {
      console.log(`${message.detail.topic}:`, new TextDecoder().decode(message.detail.data))
    })

    // node2 publishes "news" every second
    setInterval(() => {
      libp2p.services.pubsub.publish(TOPIC, uint8ArrayFromString('i like turtles')).then(() => {
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

        // ping peer if received multiaddr
        if (process.argv.length >= 3) {
          const ma = multiaddr(process.argv[2])
          console.log(`pinging remote peer at ${process.argv[2]}`)
          libp2p.services.ping.ping(ma)
            .then(latency => {
              console.log(`pinged ${process.argv[2]} in ${latency}ms`)
            })
        } else {
          console.log('no remote peer address given, skipping ping')
        }

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