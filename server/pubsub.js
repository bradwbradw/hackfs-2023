

import repl from 'repl';
import { Hub, HubClient } from '@anephenix/hub';

async function PubSub(port, server) {
  return;

  const hub = await new Hub({ port, server });
  hub.listen();
  console.log('ws hub listening on port ' + port);


  // split off somewhere else where ID can be dynamic
  var interval = setInterval(() => {
    hub.pubsub.publish(
      {
        data: {
          channel: '123abcIDHash',
          message: 'i like turtles too (from server) ' + new Date().getTime()
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


  var hubClient = new HubClient({ url: 'ws://localhost:' + port });

  const replInstance = repl.start('> ');
  replInstance.context.hubClient = hubClient;

  console.log('i get here.')
  await hubClient.subscribe('123abcIDHash');
  console.log('i get here..')

  var hubClientId = hubClient.getClientId();
  console.log('hub client id', hubClientId);
  console.log('ready to subscribe and add channel listener')
  hubClient.addChannelMessageHandler('123abcIDHash', (message) => {
    console.log('message received', message);
  });

}

export default PubSub;