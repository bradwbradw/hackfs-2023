import { Route } from 'wouter'
import Home from './pages/Home'
import About from './pages/About'
import Room from './pages/Room'
import Create from './pages/Create'

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
    </>
  );

}

export { Routes };