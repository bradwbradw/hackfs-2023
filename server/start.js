
import express from 'express';
import path from 'path';
import * as url from 'url';
import 'dotenv/config'
import cors from 'cors';
import { generateNonce, SiweMessage } from 'siwe';

import { ironSession } from "iron-session/express";
// Dependencies
import { Hub } from '@anephenix/hub';

// Initialize hub to listen on port 4000
const hub = new Hub({ port: 4000 });
// Here's some example data of say cryptocurrency prices


// We then attach that function to the RPC action 'get-price'
//hub.rpc.add('get-price', getPriceFunction);

// Start listening
hub.listen();
var interval = setInterval(() => {
  hub.pubsub.publish(
    {
      data: {
        channel: '123abcIDHash',
        message: 'i like turtles too' + new Date().getTime()
      },
      socket: { clientId: 'steve' }
    });
}, 5000);


hub.pubsub.subscribe({
  data: {
    channel: '123abcIDHash'
  },
  socket: {
    clientId: 'steve'
  }
});

var app = express();
app.use(express.json());
app.use(cors());

function track(req, res, next) {
  console.log(req?.headers?.host + req.url);
  next();
}

const session = ironSession({
  cookieName: "iron-session/our-vault-session",
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: true// process.env.NODE_ENV === "production",
  },
});

app.use(session);
app.use(track);

var port = process.env.PORT || 3000;


app.get('/api/nonce', function (_, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send(generateNonce());
});


app.post('/api/verify', async function (req, res) {
  const { message, signature } = req.body;
  const siweMessage = new SiweMessage(message);
  try {
    await siweMessage.verify({ signature });
    res.json({ ok: true });
  } catch {
    res.status(422).json({ message: 'Invalid nonce.' })
  }
});

app.get("/api/profile", function (req, res) {
  // now you can access all of the req.session.* utilities
  console.log('session.get', req.session);
  if (req.session.user === undefined) {
    res.json({ status: "restricted" });
    return;
  }

  res.json({
    title: "Profile",
    userId: req.session.user.id,
    address: req.session.siwe?.address
  });
});

app.get("/api/logout", function (req, res) {

  //Before going to production, you likely want to invalidate nonces on logout to prevent replay attacks through session duplication (e.g. store expired nonce and make sure they can't be used again).

  req.session.destroy();
  res.send({ ok: true });

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
