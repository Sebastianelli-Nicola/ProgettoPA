/**
 * @fileoverview    Modulo per gestire il server WebSocket.
 * Fornisce funzioni per inizializzare il server e gestire le connessioni.
 * Gestisce le connessioni WebSocket e i messaggi dei client.
 */

import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { handleWebSocketConnection } from './websockethandlers';

/**
 * Modulo per gestire il server WebSocket.
 * Fornisce funzioni per inizializzare il server e gestire le connessioni.
 */

let wss: WebSocketServer; // wss è il WebSocketServer che gestisce le connessioni WebSocket  


/**
 * Inizializza il server WebSocket e gestisce le connessioni.
 * @param {Server} server - Il server HTTP su cui il WebSocket sarà attivo.
 */
export const initWebSocket = (server: Server): void => {
  // Crea una nuova istanza di WebSocketServer associata al server HTTP
  wss = new WebSocketServer({ server });

  // Gestisce le connessioni WebSocket in arrivo
  // Quando un client si connette, viene chiamata la funzione handleWebSocketConnection
  // che gestisce la logica di connessione e messaggi
  wss.on('connection', (ws) => {
    console.log('[WS] Nuova connessione WebSocket');
    handleWebSocketConnection(ws);
  });

  console.log('[WS] WebSocket Server inizializzato');
};

// Funzione per esporre wss ad altri moduli
export const getWSS = (): WebSocketServer => wss;
