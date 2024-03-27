import * as WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket): void => {
  ws.on('message', (message: WebSocket.Data): void => {
    const { content } = JSON.parse(message as string) as Record<
      string,
      unknown
    >;
    console.log(`Received message => ${message}`);

    const response = {
      type: 'message',
      content
    };

    // Delay the echo back by 2 seconds
    setTimeout((): void => {
      // Modify the message and send it back
      ws.send(JSON.stringify(response));
    }, 2000);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
