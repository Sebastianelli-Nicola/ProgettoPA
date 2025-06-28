import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { handleWebSocketConnection } from './websockethandlers';

let wss: WebSocketServer; // 👈 wss accessibile internamente

export const initWebSocket = (server: Server): void => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('[WS] Nuova connessione WebSocket');
    handleWebSocketConnection(ws);
  });

  console.log('[WS] WebSocket Server inizializzato');
};

// 👇 Funzione per esporre wss ad altri moduli
export const getWSS = (): WebSocketServer => wss;
