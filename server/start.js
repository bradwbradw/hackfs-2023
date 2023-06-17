
import express from 'express';
import path from 'path';
import * as url from 'url';
import 'dotenv/config'
import cors from 'cors';

import Auth from './auth.js';
import PubSub from './pubsub.js';

//import bodpyparser
import bodyParser from 'body-parser';

import PinataClient from '@pinata/sdk';

var port = process.env.PORT || 3000;

var app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

function track(req, res, next) {
  console.log(req?.headers?.host + req.url);
  next();
}

app.use(track);
//Auth(app);


app.use(express["static"]('dist'));

const pinata = new PinataClient(process.env.PINATA_KEY, process.env.PINATA_SECRET);
/*
pinata.testAuthentication().then((result) => {
  //handle successful authentication here
  console.log(result);
    pinata.pinJSONToIPFS({ test: "json", hash: "abc123" }, {
      pinataMetadata: {
        name: 'our-vault-test'
      }
    }).then((result) => {
      //handle results here
      console.log('pin result', result);
      console.log('pin result', JSON.stringify(result, null, 2));
    });
    
}).catch((err) => {
  //handle error here
  console.log(err);
});
*/



app.get('/*', function (req, res) {
  // serve index.html without using __dirname
  res.sendFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../dist', 'index.html'));
});

app.post('/api/status', function (req, res) {
  // guardian can send post to indicate on the page, authed, 
});

app.post('/api/upload', function (req, res) {
  var data = req.body;
  console.log('upload', data);
  pinata.pinJSONToIPFS(data, { pinataMetadata: { name: 'our-vault' } }).then(({ IpfsHash, Timestamp }) => {
    res.json({
      url: 'https://fuchsia-simple-tiger-806.mypinata.cloud/ipfs/' + IpfsHash,
      hash: IpfsHash,
      timestamp: Timestamp
    })
  }).catch(err => {
    console.log('error', err);
    res.status(500).json({ error: 'something went wrong' });
  });
});



//var server = http.createServer({
// key: fs.readFileSync('./server/key.pem'),//process.env.SSL_KEY,
// cert: fs.readFileSync('./server/cert.pem')//process.env.SSL_CERT
//});

//server.on('request', app);

//PubSub(port, server);

app.listen(port, function () {
  console.log("Listening on port ".concat(port));
});
