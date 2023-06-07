
import express from 'express';
import { startLibp2p, getPeers } from './p2p.js';
import 'dotenv/config'

var app = express();

var port = process.env.PORT || 3000;

app.use(express["static"]('dist'));

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




app.listen(port, function () {
  console.log("Listening on port ".concat(port));
  startLibp2p();
});
