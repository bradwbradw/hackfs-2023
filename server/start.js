
import express from 'express';
import path from 'path';
import * as url from 'url';
import { startLibp2p, getPeers } from './p2p-server.js';
import 'dotenv/config'

var app = express();

var port = process.env.PORT || 3000;

var peers;

startLibp2p().then((p) => {
  peers = p;
})
  .catch(err => {
    console.error('could not start libP2P', err);
  });;


app.get('/api/peer-info', function (req, res) {
  //  var peers = libp2p.peerStore.peers;
  res.json({
    status: 'ok?',
    peers
  });

})


app.use(express["static"]('dist'));

app.get('/*', function (req, res) {
  // serve index.html without using __dirname
  res.sendFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../dist', 'index.html'));


});

app.listen(port, function () {
  console.log("Listening on port ".concat(port));
  //  startLibp2p();
});
