
import express from 'express';
import path from 'path';
import * as url from 'url';
import 'dotenv/config'
import cors from 'cors';
import { generateNonce, SiweMessage } from 'siwe';

import { ironSession } from "iron-session/express";

var app = express();
app.use(express.json());
app.use(cors());

function track(req, res, next) {
  console.log(req?.headers?.host + req.url);
  next();
}

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

const session = ironSession({
  cookieName: "iron-session/our-vault-session",
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: true// process.env.NODE_ENV === "production",
  },
});

app.use(session);

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
