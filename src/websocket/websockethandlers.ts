import WebSocket from 'ws';
import { getWSS } from './websocketServer'; // ✅ usa questa funzione

interface ClientMessage {
  type: 'join';
  auctionId: number;
}

interface AuctionClient extends WebSocket {
  auctionId?: number;
}

export const handleWebSocketConnection = (ws: WebSocket): void => {
  const client = ws as AuctionClient;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message) as ClientMessage;

      if (data.type === 'join') {
        client.auctionId = data.auctionId;
        console.log(`[WS] Client collegato all'asta ${data.auctionId}`);
      }
    } catch (err) {
      console.error('[WS] Messaggio malformato:', message);
    }
  });

  ws.send(JSON.stringify({ message: 'Connessione WebSocket stabilita' }));
};

export const broadcastToAuction = (auctionId: number, data: object): void => {
  const wss = getWSS(); // ✅ ottieni wss

  wss.clients.forEach((client: WebSocket) => {
    const wsClient = client as AuctionClient;

    if (
      client.readyState === WebSocket.OPEN &&
      wsClient.auctionId === auctionId
    ) {
      client.send(JSON.stringify(data));
    }
  });
};
