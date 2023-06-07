

import React from 'react';

const Status = function () {

  const [n, setN] = React.useState(0);

  return (
    <>
      <h1>status</h1>
      <p>
        number of nodes: {n}
      </p>
    </>
  )
}
export default Status