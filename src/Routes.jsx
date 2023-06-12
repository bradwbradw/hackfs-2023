import { Link, Route } from 'wouter'
import About from './About'
import Status from './Status'
import Dungeon from './Dungeon'
import { useState } from 'react'

function Routes() {

  const [count, setCount] = useState(0)
  return (
    <>
      <Route path="/">

        <h1>our vault</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Our vault is a secure place to store your secrets, sharding then across our encrypted P2P network.
          </p>
          <p>
            <Link href="/about">Learn more</Link>
          </p>
        </div>
      </Route>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/status">
        <Status />
      </Route>
      <Route path="/dungeon/:id">
        {params => <Dungeon id={params.id} />}
      </Route>
    </>
  );

}

export { Routes };