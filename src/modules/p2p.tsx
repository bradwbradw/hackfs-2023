

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
import _, { create } from 'lodash'

var libp2p;
async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
  var enc = new TextEncoder();

  const signedMessage = msg as SignedMessage
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString());
  return await sha256.encode(encodedSeqNum)
}

var relayNodeJson = await fetch('/api/peer-info');
var relayNode = await relayNodeJson.json();
var relayNodePeers = _.get(relayNode, 'peers', []);

const options = {
  addresses: {
    listen: [
      '/webrtc'
    ]
  },
  transports: [
    //    webTransport(),
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
    //    webRTCDirect(),
    webSockets({
      filter: filters.all
    }),
  ],

  connectionManager: {
    maxConnections: 100,
    minConnections: 2
  },
  connectionEncryption: [noise()],
  streamMuxers: [yamux(), mplex()],
  peerDiscovery: [
    bootstrap({
      list: relayNodePeers
    })
  ],
  connectionGater: {
    denyDialMultiaddr: async () => false,
  },
  services: {
    // the identify service is used by the DHT and the circuit relay transport
    // to find peers that support the relevant protocols
    identify: identifyService(),

    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      msgIdFn: msgIdFnStrictNoSign,
      ignoreDuplicatePublishError: true,
      //      globalSignaturePolicy: SignaturePolicy.StrictSign
    }),
    // the DHT is used to find circuit relay servers we can reserve a slot on
    dht: kadDHT({
      protocolPrefix: '/our-vault',
      maxInboundStreams: 5000,
      maxOutboundStreams: 5000,
      clientMode: true
    })
  }
};

var loadingP2P;
function getP2P(peers) {
  // Create our libp2p node
  if (libp2p) {
    return Promise.resolve(libp2p);
  } else {
    if (loadingP2P) {
      return Promise.resolve(loadingP2P)
    } else {
      //peer = '/ip4/3.225.43.236/tcp/37848/ws/p2p/12D3KooWCVB3rbFFnksCNzXuyALgAH723dvB7P1ZnkqJWwyZqr4F';
      loadingP2P = createLibp2p(
        {
          ...options,
          peerDiscovery: [
            bootstrap({ list: peers })
          ]
        }
      ).then(lib => {
        libp2p = lib;
        window.libp2p = libp2p;
        return lib;
      });
      return loadingP2P;
    }
  }

};

function subscribeEvents(libp2p, { discovery, connect, disconnect, selfUpdate }) {

  if (!libp2p) {
    console.log('libp2p not initialized');
    return;
  }
  libp2p.removeEventListener('peer:discovery', discovery);
  libp2p.addEventListener('peer:discovery', discovery);

  libp2p.removeEventListener('peer:connect', connect);
  libp2p.addEventListener('peer:connect', connect);

  libp2p.removeEventListener('peer:disconnect', disconnect);
  libp2p.addEventListener('peer:disconnect', disconnect);

  libp2p.removeEventListener('self:peer:update', selfUpdate);
  libp2p.addEventListener('self:peer:update', selfUpdate);
  console.log('subscribed eventz');

}

const P2P = createLibp2p(options);

console.log('exporting')
export default P2P;

//export { getP2P, subscribeEvents, libp2p }