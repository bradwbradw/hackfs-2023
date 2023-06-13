

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

var libp2p;
async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
  var enc = new TextEncoder();

  const signedMessage = msg as SignedMessage
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString());
  return await sha256.encode(encodedSeqNum)
}

const options = {
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
    webTransport(),
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
    webRTCDirect(),
    circuitRelayTransport({
      discoverRelays: 1
    }),
    webSockets({
      filter: filters.all,
    }),
  ],

  connectionManager: {
    maxConnections: 100,
    minConnections: 2
  },
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],//, mplex()],
  peerDiscovery: [
    bootstrap({
      list: [
        //'/ip4/192.168.1.154/tcp/56272/ws/p2p/12D3KooWLzGrMupm2oHE6tt8Jqer964XLo34ezpxCPMW8uyJrL9z',
        // '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
        //   '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
      ]
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
      //protocolPrefix: "/our-vault/0.0.1",

      protocolPrefix: "/our-vault",//"/universal-connectivity",
      maxInboundStreams: 5000,
      maxOutboundStreams: 5000,
      // browser node ordinarily shouldn't be DHT servers
      clientMode: true
    })
  }
};

var loadingP2P;
function getP2P(peer) {
  // Create our libp2p node
  if (libp2p) {
    return Promise.resolve(libp2p);
  } else {
    if (loadingP2P) {
      return Promise.resolve(loadingP2P)
    } else {
      loadingP2P = createLibp2p(
        {
          ...options,
          peerDiscovery: [
            bootstrap({ list: [peer] })
          ]
        }
      ).then(lib => {
        libp2p = lib;
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


export { getP2P, subscribeEvents, libp2p }