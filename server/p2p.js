
import 'dotenv/config'

import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { multiaddr } from 'multiaddr'
import { pingService } from 'libp2p/ping'

import { bootstrap } from '@libp2p/bootstrap'


var peers = [];

async function startLibp2p() {

  const node = await createLibp2p({
    addresses: {
      // add a listen address (localhost) to accept TCP connections on a random port
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp(), webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    /*   peerDiscovery: [
         bootstrap({
           list: peers, // provide array of multiaddrs
         })
       ],*/
    services: {
      ping: pingService({
        protocolPrefix: 'ipfs', // default
      }),
    },
  });

  node.addEventListener('peer:discovery', (evt) => {
    console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
  })

  node.addEventListener('peer:connect', (evt) => {
    console.log('Connected to %s', evt.detail.remotePeer.toString()) // Log connected peer
  })

  // start libp2p
  await node.start()
  console.log('libp2p has started')

  // print out listening addresses
  console.log('listening on addresses:')
  node.getMultiaddrs().forEach((addr) => {
    console.log(addr.toString())
    peers.push(addr.toString());
    //deduplicate peers
    peers = [...new Set(peers)];
  })

  // ping peer if received multiaddr
  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2])
    console.log(`pinging remote peer at ${process.argv[2]}`)
    const latency = await node.services.ping.ping(ma)
    console.log(`pinged ${process.argv[2]} in ${latency}ms`)
  } else {
    console.log('no remote peer address given, skipping ping')
  }

  const stop = async () => {
    // stop libp2p
    await node.stop()
    console.log('libp2p has stopped')
    process.exit(0)
  }

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

function getPeers() {
  return peers;
}

export { startLibp2p, getPeers };