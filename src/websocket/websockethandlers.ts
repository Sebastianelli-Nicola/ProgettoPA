/**
 * @fileOverview Gestione delle connessioni WebSocket e dei messaggi dei client.
 * 
 * Questo modulo definisce le funzioni per gestire le connessioni WebSocket,
 * i messaggi inviati dai client e la logica per inviare aggiornamenti agli utenti
 * in base all'asta a cui sono iscritti.
 * Gestione delle connessioni WebSocket e dei messaggi dei client.
 */

import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { getWSS } from './websocketServer'; 
import { ParticipationDAO } from '../dao/participationDAO';
import { AuctionDAO } from '../dao/auctionDAO';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';


/**
 * Interfaccia per i messaggi inviati dai client.
 * Definisce il tipo di messaggio che il client può inviare al server.
 * In questo caso, il client può inviare un messaggio di tipo 'join' con un ID asta.
 * Il messaggio 'join' indica che il client vuole unirsi a un'asta specifica.
 * Il client deve inviare questo messaggio per poter ricevere aggiornamenti sull'asta.
 */
// interface ClientMessage {
//   type: 'join';
//   auctionId: number;
// }


/**
 * Estensione dell'interfaccia WebSocket per includere l'ID dell'asta
 * Questo permette di associare ogni client a un'asta specifica
 */
// interface AuctionClient extends WebSocket {
//   auctionId?: number;
// }

const participationDAO = ParticipationDAO.getInstance();
const auctionDAO = AuctionDAO.getInstance();

interface ClientMessage {
  type: 'join';
  auctionId: number;
  token: string;
}

interface AuctionClient extends WebSocket {
  auctionId?: number;
  userId?: number;
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

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message) as ClientMessage;

      // Gestione autenticazione e autorizzazione solo su messaggio 'join'
      if (data.type === 'join' && data.token) {
        // Verifica JWT
        let decoded: any;
        try {
          decoded = jwt.verify(data.token, process.env.JWT_SECRET!);
        } catch {
          const error = ErrorFactory.createError(ErrorType.InvalidToken);
          ws.send(JSON.stringify({ error: error.message }));
          ws.close();
          return;
        }
        client.userId = decoded.id;
        client.auctionId = data.auctionId;

        // Verifica che userId e auctionId siano definiti
        if (typeof client.userId !== 'number' || typeof client.auctionId !== 'number') {
          const error = ErrorFactory.createError(ErrorType.InvalidUserId, 'userId o auctionId mancanti o non validi');
          ws.send(JSON.stringify({ error: error.message }));
          ws.close();
          return;
        }

        // Verifica partecipazione o creazione
        const isParticipant = await participationDAO.findParticipation(client.userId, client.auctionId);
        const auction = await auctionDAO.findById(client.auctionId);
        const isCreator = auction && auction.creatorId === client.userId;

        if (!isParticipant && !isCreator) {
          const error = ErrorFactory.createError(ErrorType.Authorization);
          ws.send(JSON.stringify({ error: error.message }));
          ws.close();
          return;
        }
        console.log(`[WS] Client ${client.userId} collegato all'asta ${client.auctionId}`);
      }
    } catch (err) {
      const error = ErrorFactory.createError(ErrorType.Generic);
      ws.send(JSON.stringify({ error: error.message }));
      ws.close();
    }
  });

  ws.send(JSON.stringify({ message: 'Connessione WebSocket stabilita' }));
};

/**
 * Invia un messaggio a tutti i client connessi che sono iscritti a un'asta specifica.
 * Questa funzione permette di inviare aggiornamenti in tempo reale ai client
 * che hanno espresso interesse per un'asta specifica.
 * @param auctionId - L'ID dell'asta a cui inviare i dati.
 * @param data - I dati da inviare ai client.
 */
export const broadcastToAuction = (auctionId: number, data: object): void => {
  const wss = getWSS();   // Ottiene l'istanza del WebSocket Server
  
  // Invia i dati a tutti i client connessi che sono iscritti all'asta specificata
  wss.clients.forEach((client: WebSocket) => {
    const wsClient = client as AuctionClient; // estende WebSocket per includere auctionId

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
