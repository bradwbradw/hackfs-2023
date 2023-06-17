import { Route, Link } from 'wouter'
import Home from './pages/Home'
import About from './pages/About'
import Room from './pages/Room'
import Create from './pages/Create'
import CryptoDemo from './pages/Crypto-Demo'

function Routes() {

  return (
    <>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/create">
        <Create />
      </Route>
      <Route path="/room/:id">
        {params => <Room id={params.id} />}
      </Route>
      <Route path="/crypto-demo">
        <CryptoDemo />
      </Route>

      <div style={{ position: 'absolute', top: 0, left: 0 }} >
        <Link to="/"> home </Link>
        <Link to="create"> create </Link>
        <Link to="about"> about </Link>
        <Link to="crypto-demo"> crypto demo </Link>
      </div>
    </>
  );

}

export { Routes };