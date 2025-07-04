/**
 * @fileoverview Controller per la gestione delle aste.
 * 
 * Fornisce le funzioni per creare, ottenere, aggiornare, chiudere, avviare e unirsi alle aste.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { AuctionService } from '../services/auctionService';
import HTTPStatus from 'http-status-codes';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';

const auctionService = new AuctionService();

/**
 * Crea una nuova asta.
 * Valida i dati in ingresso e chiama il servizio per la creazione.
 * Restituisce la nuova asta creata o un errore se i dati sono mancanti o incompleti.
 */
export const createAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
      //endTime,
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


    const creatorId = req.user?.id;

    // Verifica la presenza di tutti i dati obbligatori (accetta anche 0 come valore valido)
    if (
      title == null || minParticipants == null || maxParticipants == null ||
      entryFee == null || maxPrice == null || minIncrement == null ||
      bidsPerParticipant == null || startTime == null || /*endTime == null ||*/ relaunchTime == null
    ) {
      const err = ErrorFactory.createError(ErrorType.MissingData);
      res.status(err.status).json({ message: err.message });
      return;
    }


    const newAuction = await auctionService.createAuction({
      creatorId,
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      minIncrement,
      bidsPerParticipant,
      startTime,
      //endTime,
      relaunchTime,
      status,
    });

    res.status(HTTPStatus.CREATED).json({ message: 'Asta creata con successo', auction: newAuction });
  } catch (error: any) {
    console.error('Errore creazione asta:', error);
    next(error);
  }
};


/**
 * Restituisce la lista delle aste, eventualmente filtrate per stato.
 */
export const getAuctions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const auctions = await auctionService.getAuctions(typeof status === 'string' ? status : undefined);
    res.json(auctions);
  } catch (error: any) {
    console.error('Errore lettura aste:', error);
    next(error);
  }
};


/**
 * Permette a un utente autenticato di unirsi a un'asta.
 * Richiede l'ID utente e l'ID dell'asta.
 */
export const joinAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const auctionId = req.body.auctionId;
    if (!userId) {
      const err = ErrorFactory.createError(ErrorType.Authentication);
      res.status(err.status).json({ message: err.message });
      return;
    }
    const result = await auctionService.joinAuction(userId, auctionId);
    res.status(HTTPStatus.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};


/**
 * Chiude un'asta e notifica i partecipanti tramite websocket.
 * Restituisce il vincitore e l'importo finale.
 */
export const closeAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.closeAuction(auctionId);

//     // Notifica la chiusura dell'asta tramite websocket
//     broadcastToAuction(auctionId, {
//       type: 'auction_closed',
//       winnerId: result.winnerId,
//       finalAmount: result.finalAmount,
//     });

    res.status(HTTPStatus.OK).json({
      message: 'Asta chiusa con successo',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });
  } catch (error: any) {
    next(error);
  }
};


/**
 * Aggiorna lo stato di un'asta.
 * Richiede l'ID dell'asta e il nuovo stato.
 */
export const updateAuctionStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const { status } = req.body;
    const auction = await auctionService.updateStatus(auctionId, status);
    res.status(HTTPStatus.OK).json({ message: 'Stato asta aggiornato con successo', auction });
  } catch (error: any) {
    next(error);
  }
};


/**
 * Avvia un'asta.
 * Se i partecipanti sono insufficienti, chiude l'asta e notifica il motivo.
 * Altrimenti, avvia l'asta e notifica i partecipanti.
 */
export const startAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.startAuction(auctionId);

    // Notifica la chiusura per partecipanti insufficienti
    if (result.closed) {
      broadcastToAuction(auctionId, {
        type: 'auction_closed',
        reason: result.reason,
      });
      res.status(HTTPStatus.OK).json({ message: 'Asta chiusa per partecipanti insufficienti' });
    } else if (result.started) {
      // Notifica l'avvio dell'asta
      broadcastToAuction(auctionId, {
        type: 'auction_started',
        auctionId,
      });
      res.status(HTTPStatus.OK).json({ message: 'Asta avviata' });
    }
  } catch (error: any) {
    console.error('Errore startAuction:', error);
    next(error);
  }
};

