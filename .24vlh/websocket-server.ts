import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket): void => {
  ws.on('message', (message: WebSocket.Data): void => {
    const { content } = JSON.parse(message as string) as Record<
      string,
      unknown
    >;
    console.log(`Received message => ${message}`);
  });

  const response = {
    type: 'message',
    content: 'Some random message sent over the websocket'
  };

  // Emit to this client every 2 seconds
  const interval = setInterval((): void => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }, 2000);

  ws.on('close', () => {
    clearInterval(interval);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
