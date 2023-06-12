

import { createLibp2p } from 'libp2p'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { identifyService } from 'libp2p/identify'
import { kadDHT } from '@libp2p/kad-dht'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { webRTCDirect, webRTC } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'

var libp2p = false;

const options = {
  // transports allow us to dial peers that support certain types of addresses
  addresses: {
    listen: [
      '/webrtc'
    ],
    announce: [
      '/webrtc',
      '/ws'
    ]
  },
  transports: [
    webSockets(),
    webTransport(),
    webRTCDirect(),
    circuitRelayTransport({
      // use content routing to find a circuit relay server we can reserve a
      // slot on
      discoverRelays: 1
    }),/*
    webSockets({
      filter: filters.all,
    }),*/
    webRTC({
      rtcConfiguration: {
        iceServers: [{
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:global.stun.twilio.com:3478'
          ]
        }]
      }
    }),
  ],
  connectionManager: {
    maxConnections: 10,
    minConnections: 5
  },
  connectionEncryption: [noise()],
  streamMuxers: [yamux(), mplex()],
  peerDiscovery: [
    bootstrap({
      list: [
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
      ]
    })
  ],
  services: {
    // the identify service is used by the DHT and the circuit relay transport
    // to find peers that support the relevant protocols
    identify: identifyService(),

    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      //msgIdFn: msgIdFnStrictNoSign,
      ignoreDuplicatePublishError: true,
    }),
    // the DHT is used to find circuit relay servers we can reserve a slot on
    dht: kadDHT({
      //protocolPrefix: "/our-vault/0.0.1",

      protocolPrefix: "our-vault",//"/universal-connectivity",
      maxInboundStreams: 5000,
      maxOutboundStreams: 5000,
      // browser node ordinarily shouldn't be DHT servers
      clientMode: true
    })
  }
};

var loadingP2P = false;
function getP2P(subscriptions) {
  // Create our libp2p node
  if (libp2p) {
    return Promise.resolve(libp2p);
  } else {
    if (loadingP2P) {
      return Promise.resolve(loadingP2P)
    } else {
      loadingP2P = createLibp2p(options).then(lib => {
        libp2p = lib;
        subscribeEvents(subscriptions);
        return lib;
      });
      return loadingP2P;
    }
  }

  /*
  // Listen for new peers
  libp2p.addEventListener('peer:discovery', (evt) => {
    const peerInfo = evt.detail
    console.log(`Found peer ${peerInfo.id.toString()}`)

    // dial them when we discover them
    libp2p.dial(peerInfo.id).catch(err => {
      console.log(`Could not dial ${peerInfo.id.toString()}`, err)
      setCouldNotDial(couldNotDial + 1);
    })
  })

  // Listen for new connections to peers
  libp2p.addEventListener('peer:connect', (evt) => {
    const peerId = evt.detail
    console.log(`Connected to ${peerId.toString()}`)
    setConnected(connected + 1);
  })

  // Listen for peers disconnecting
  libp2p.addEventListener('peer:disconnect', (evt) => {
    const peerId = evt.detail
    console.log(`Disconnected from ${peerId.toString()}`);
    setDisconnected(disconnected + 1);
  })

  setStatus('libp2p started!')
  console.log(`libp2p id is ${libp2p.peerId.toString()}`)
  setId(libp2p.peerId.toString());
  */

};

function subscribeEvents({ discovery, connect, disconnect }) {

  if (!libp2p) {
    console.log('libp2p not initialized');
    return;
  }

  libp2p.addEventListener('peer:discovery', discovery);
  libp2p.addEventListener('peer:connect', connect);
  libp2p.addEventListener('peer:disconnect', disconnect);

}


export { getP2P, subscribeEvents, libp2p }