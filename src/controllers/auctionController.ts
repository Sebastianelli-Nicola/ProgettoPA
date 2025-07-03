/**
 * @fileoverview Controller per la gestione delle aste.
 * 
 * Fornisce le funzioni per creare, ottenere, aggiornare, chiudere, avviare e unirsi alle aste.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { AuctionService } from '../services/auctionService';

const auctionService = new AuctionService();

/**
 * Crea una nuova asta.
 * Valida i dati in ingresso e chiama il servizio per la creazione.
 * Restituisce la nuova asta creata o un errore se i dati sono mancanti o incompleti.
 */
export const createAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      minIncrement,
      bidsPerParticipant,
      startTime,
      endTime,
      relaunchTime,
      status
    } = req.body;

    // // Verifica la presenza di tutti i dati obbligatori
    // if (
    //   !title || !minParticipants || !maxParticipants ||
    //   !entryFee || !maxPrice || !minIncrement ||
    //   !bidsPerParticipant || !startTime || !endTime || !relaunchTime
    // ) {
    //   res.status(400).json({ message: 'Dati mancanti o incompleti' });
    //   return;
    // }

    // Verifica la presenza di tutti i dati obbligatori (accetta anche 0 come valore valido)
    if (
      title == null || minParticipants == null || maxParticipants == null ||
      entryFee == null || maxPrice == null || minIncrement == null ||
      bidsPerParticipant == null || startTime == null || endTime == null || relaunchTime == null
    ) {
      res.status(400).json({ message: 'Dati mancanti o incompleti' });
      return;
    }


    const newAuction = await auctionService.createAuction({
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      minIncrement,
      bidsPerParticipant,
      startTime,
      endTime,
      relaunchTime,
      status,
    });

    res.status(201).json({ message: 'Asta creata con successo', auction: newAuction });
  } catch (error: any) {
    console.error('Errore creazione asta:', error);
    res.status(error.status || 500).json({ message: error.message || 'Errore interno del server' });
  }
};


/**
 * Restituisce la lista delle aste, eventualmente filtrate per stato.
 */
export const getAuctions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const auctions = await auctionService.getAuctions(typeof status === 'string' ? status : undefined);
    res.json(auctions);
  } catch (error) {
    console.error('Errore lettura aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};


/**
 * Permette a un utente autenticato di unirsi a un'asta.
 * Richiede l'ID utente e l'ID dell'asta.
 */
export const joinAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const auctionId = req.body.auctionId;
    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }
    const result = await auctionService.joinAuction(userId, auctionId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};


/**
 * Chiude un'asta e notifica i partecipanti tramite websocket.
 * Restituisce il vincitore e l'importo finale.
 */
export const closeAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.closeAuction(auctionId);

    // Notifica la chiusura dell'asta tramite websocket
    broadcastToAuction(auctionId, {
      type: 'auction_closed',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });

    res.status(200).json({
      message: 'Asta chiusa con successo',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


/**
 * Aggiorna lo stato di un'asta.
 * Richiede l'ID dell'asta e il nuovo stato.
 */
export const updateAuctionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const { status } = req.body;
    const auction = await auctionService.updateStatus(auctionId, status);
    res.status(200).json({ message: 'Stato dell\'asta aggiornato con successo', auction });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


/**
 * Avvia un'asta.
 * Se i partecipanti sono insufficienti, chiude l'asta e notifica il motivo.
 * Altrimenti, avvia l'asta e notifica i partecipanti.
 */
export const startAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.startAuction(auctionId);

    // Notifica la chiusura per partecipanti insufficienti
    if (result.closed) {
      broadcastToAuction(auctionId, {
        type: 'auction_closed',
        reason: result.reason,
      });
      res.status(200).json({ message: 'Asta chiusa per partecipanti insufficienti' });
    } else if (result.started) {
      // Notifica l'avvio dell'asta
      broadcastToAuction(auctionId, {
        type: 'auction_started',
        auctionId,
      });
      res.status(200).json({ message: 'Asta avviata' });
    }
  } catch (err: any) {
    console.error('Errore startAuction:', err);
    res.status(err.status || 500).json({ message: err.message || 'Errore interno' });
  }
};

