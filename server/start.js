
import http from 'http';
import https from 'https';

import fs from 'fs';
import express from 'express';
import path from 'path';
import * as url from 'url';
import 'dotenv/config'
import cors from 'cors';

import Auth from './auth.js';
import PubSub from './pubsub.js';

var port = process.env.PORT || 3000;

var app = express();

app.use(express.json());
app.use(cors());

function track(req, res, next) {
  console.log(req?.headers?.host + req.url);
  next();
}

app.use(track);
Auth(app);


app.use(express["static"]('dist'));

app.get('/*', function (req, res) {
  // serve index.html without using __dirname
  res.sendFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../dist', 'index.html'));
});



var server = http.createServer({
  // key: fs.readFileSync('./server/key.pem'),//process.env.SSL_KEY,
  // cert: fs.readFileSync('./server/cert.pem')//process.env.SSL_CERT
});

server.on('request', app);

PubSub(port, server);

/*var server = app.listen(port, function () {
  console.log("Listening on port ".concat(port));
  //  startLibp2p();
});
*/
console.log('i get to this point')

