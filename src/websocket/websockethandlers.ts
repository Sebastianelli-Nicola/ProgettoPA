/**
 * @fileOverview Gestione delle connessioni WebSocket e dei messaggi dei client.
 * 
 * Questo modulo definisce le funzioni per gestire le connessioni WebSocket,
 * i messaggi inviati dai client e la logica per inviare aggiornamenti agli utenti
 * in base all'asta a cui sono iscritti.
 * Gestione delle connessioni WebSocket e dei messaggi dei client.
 */

import WebSocket from 'ws';
import { getWSS } from './websocketServer'; 

// Definizione del tipo di messaggio che il client può inviare
// In questo caso, il client può inviare un messaggio di tipo 'join' con un ID asta
// Il messaggio 'join' indica che il client vuole unirsi a un'asta specifica
// Il client deve inviare questo messaggio per poter ricevere aggiornamenti sull'asta
interface ClientMessage {
  type: 'join';
  auctionId: number;
}

// Estensione dell'interfaccia WebSocket per includere l'ID dell'asta
// Questo permette di associare ogni client a un'asta specifica
interface AuctionClient extends WebSocket {
  auctionId?: number;
}

/**
 * Gestisce la connessione WebSocket e i messaggi inviati dai client.
 * Quando un client si connette, viene registrato e può inviare un messaggio 'join' per unirsi a un'asta.
 * Dopo la connessione, il server invia un messaggio di conferma al client.
 * 
 * @param {WebSocket} ws - Il WebSocket del client connesso.
 */
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

/**
 * Invia un messaggio a tutti i client connessi che sono iscritti a un'asta specifica.
 * Questa funzione permette di inviare aggiornamenti in tempo reale ai client
 * che hanno espresso interesse per un'asta specifica.
 * @param auctionId - L'ID dell'asta a cui inviare i dati.
 * Invia i dati a tutti i client connessi che sono iscritti all'asta specificata.
 * @param data - I dati da inviare ai client.
 */
export const broadcastToAuction = (auctionId: number, data: object): void => {
  const wss = getWSS(); // ottieni wss

  
  // Invia i dati a tutti i client connessi che sono iscritti all'asta specificata
  wss.clients.forEach((client: WebSocket) => {
    const wsClient = client as AuctionClient;

    // Controlla se il client è connesso e se l'ID asta corrisponde a quello specificato
    // Se il client è connesso e ha l'ID asta corretto, invia i dati
    if (
      client.readyState === WebSocket.OPEN &&
      wsClient.auctionId === auctionId
    ) {
      client.send(JSON.stringify(data)); // invia i dati al client
    }
  });
};
