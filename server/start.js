
import express from 'express';
import { startLibp2p } from './p2p.js';

var app = express();

var port = process.env.PORT || 3000;

app.use(express["static"]('dist'));

app.get('/api/status', function (req, res) {

  res.json({ status: 'ok?' });
});


app.listen(port, function () {
  console.log("Listening on port ".concat(port));
  startLibp2p();
});
