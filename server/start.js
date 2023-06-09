
import express from 'express';
import path from 'path';
import * as url from 'url';
import { startLibp2p, getPeers } from './p2p.js';
import 'dotenv/config'

var app = express();

var port = process.env.PORT || 3000;


app.get('/api/status', function (req, res) {

  getPeers().then(function (peers) {
    res.json({
      status: 'ok?',
      peers
    });

  })
    .catch(err => {
      res.json({
        status: 'could not get peers',
        err
      })
    });

});




app.use(express["static"]('dist'));

app.get('/*', function (req, res) {
  // serve index.html without using __dirname
  res.sendFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../dist', 'index.html'));


});

app.listen(port, function () {
  console.log("Listening on port ".concat(port));
  //  startLibp2p();
});
