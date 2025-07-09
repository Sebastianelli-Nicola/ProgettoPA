/**
 * @fileoverview Scheduler automatico per la gestione dello stato delle aste.
 *
 * Questo modulo utilizza `node-cron` per eseguire ogni minuto un controllo automatico delle aste:
 * - Avvia le aste il cui orario di inizio è arrivato (da 'open' a 'bidding' o 'cancelled').
 * - Chiude le aste il cui tempo è scaduto (da 'bidding' a 'closed').
 *
 * Durante l'esecuzione, vengono inviate notifiche in tempo reale ai client connessi tramite WebSocket.
 * Tutti gli errori vengono gestiti attraverso una fabbrica centralizzata (`ErrorFactory`).
 *
 * Import principali:
 * - `node-cron`: pianifica l'esecuzione periodica.
 * - `AuctionService`: contiene la logica di business per avviare e chiudere aste.
 * - `AuctionDAO`: accede al database per recuperare aste da aggiornare.
 * - `broadcastToAuction`: invia eventi WebSocket alle aste interessate.
 * - `ErrorFactory`: crea errori standardizzati con tipi specifici per il logging.
 */

import cron from 'node-cron';
import { broadcastToAuction } from './websocket/websockethandlers';
import { AuctionService } from './services/auctionService';
import { AuctionDAO } from './dao/auctionDAO';
import { ErrorFactory, ErrorType } from './factory/errorFactory';

// Schedula un job che si ripete ogni minuto
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const auctionService = new AuctionService();
  const auctionDao = AuctionDAO.getInstance();
  

  console.log(`[${now.toISOString()}] Avvio scheduler automatico aste...`);

  try {
     /**
     * === SEZIONE 1: AVVIO ASTE ===
     * Recupera tutte le aste con stato 'open' che dovrebbero iniziare ora
     */
    const toOpen = await auctionDao.findAllStartTime(['open'], now);

    if (toOpen.length > 0) {
      console.log(`[${now.toISOString()}] Trovate ${toOpen.length} aste da avviare.`);
    }

    // Itera su ogni asta da avviare
    for (const auction of toOpen) {
      try {
         // Se l'asta non è nello stato 'open', viene ignorata
        if (auction.status !== 'open') {
          console.log(`Asta ${auction.id} non è nello stato 'open', ignorata.`);
          continue;
        }

        // Tenta di avviare l'asta
        const result = await auctionService.startAuction(auction.id);

         // Se l'asta è stata chiusa subito (es. per pochi partecipanti), invia notifica di chiusura
        if (result.closed) {
          broadcastToAuction(auction.id, {
            type: 'auction_closed',
            reason: result.reason,
          });
          console.log(`Asta ${auction.id} chiusa: ${result.reason}`);
        } 
        // Se l'asta è partita correttamente, invia notifica di avvio
        else if (result.started) {
          broadcastToAuction(auction.id, {
            type: 'auction_started',
            auctionId: auction.id,
          });
          console.log(`Asta ${auction.id} avviata con successo (passata a 'bidding' o 'cancelled').`);
        }
      } catch (err) {
        // Gestione errore specifico nell'avvio di un'asta
        const error = ErrorFactory.createError(ErrorType.AuctionStartFailed, `Errore avvio asta ${auction.id}`);
        console.error(error.message, err);
      }
    }

    /**
     * === SEZIONE 2: CHIUSURA ASTE ===
     * Recupera tutte le aste con stato 'bidding' che dovrebbero chiudersi ora
     */
    const toClose = await auctionDao.findAllEndTime(['bidding'], now);

    if (toClose.length > 0) {
      console.log(`[${now.toISOString()}] Trovate ${toClose.length} aste da chiudere.`);
    }

    // Itera su ogni asta da chiudere
    for (const auction of toClose) {
      try {
        // Tenta di chiudere l'asta
        const result = await auctionService.closeAuction(auction.id);

        // Invia notifica WebSocket con l'esito finale dell'asta
        broadcastToAuction(auction.id, {
          type: 'auction_closed',
          winnerId: result.winnerId,
          finalAmount: result.finalAmount,
        });
        console.log(`Asta ${auction.id} chiusa correttamente.`);
      } catch (err) {
        // Gestione errore specifico nella chiusura di un'asta
        const error = ErrorFactory.createError(ErrorType.AuctionCloseFailed, `Errore chiusura asta ${auction.id}`);
        console.error(error.message, err);
      }
    }

    console.log(`[${now.toISOString()}] Scheduler completato.`);

  } catch (err) {
    // Gestione errore globale del job cron
    const error = ErrorFactory.createError(ErrorType.Scheduler);
    console.error(`[${now.toISOString()}] ${error.message}:`, err);
  }
});


