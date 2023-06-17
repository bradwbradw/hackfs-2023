
import React, { useState } from "react";
import { Link } from "wouter";

function Home() {
  return (
    <>
      <h1>Our Vault</h1>

      <div className="card">
        <p style={{ fontSize: '1.3rem' }}>

          This dapp lets anyone create their own secure encrypted vault, for backing up a crypto wallet seed phrase (or any kind of password / secret).
        </p>
        <h4 style={{ marginTop: '1rem' }}>Steps</h4>
        <ul>
          <li>
            1) Decide on a group of "Guardians", these are people you know and trust, and you'll need their web3 addresses to create the vault. You will also need to decide on a secret question / answer for each Guardian in order to prove your identity during recovery.
          </li>
          <li>
            2) Click "get started" below to visit the vault creation page. You'll connect via Meta Mask, enter the addresses of your Guardians, and initiate the on-chain process.
          </li>
          <li>
            3) After the vault is created, you'll see your own url for your vault control center page. This is where you can securely enter your secret to be encrypted and sharded.
          </li>
          <li>
            4) Later, when you need to recover your secret, you can ask your Guardians to visit the same page. Once they authenticate, they'll be able to sign a transaction that will unlock access to your secret.
          </li>
          <li>
            5) After the secret is unlocked, you will be able to answer the secret questions, and decrypt the original secret, which stays in your browser view, invisible to everyone else, including your Guardians.
          </li>


        </ul>

        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '2rem' }}>
          <Link href="/create">Get Started</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </>
  );
}

export default Home