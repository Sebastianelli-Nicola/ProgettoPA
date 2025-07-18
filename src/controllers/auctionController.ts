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
 * Restituisce la lista delle aste, eventualmente filtrate per stato.
 */
export const getAuctions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Estrae il filtro 'status' dal corpo della richiesta, se è una stringa valida.
    const status = typeof req.body?.status === 'string' ? req.body.status : undefined;

    // Richiama il servizio per ottenere le aste filtrate per stato.
    const auctions = await auctionService.getAuctions(status);

    // Invia la lista delle aste come risposta JSON al client.
    res.json(auctions);

  } catch (error) {
    // In caso di errore, passa l'errore al middleware di gestione errori.
    next(error);
  }
};


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
      bidIncrement,
      bidsPerParticipant,
      startTime,
      relaunchTime,
      status
    } = req.body;


    const creatorId = req.user?.id;

    // Verifica la presenza di tutti i dati obbligatori (accetta anche 0 come valore valido)
    if (
      title == null || minParticipants == null || maxParticipants == null ||
      entryFee == null || maxPrice == null || bidIncrement == null ||
      bidsPerParticipant == null || startTime == null || /*endTime == null ||*/ relaunchTime == null
    ) {
      return next(ErrorFactory.createError(ErrorType.MissingData));
    }

    const validStatuses = ['created', 'open'];

    // Verifica che lo stato, se fornito, sia uno tra quelli validi definiti in validStatuses
    if (status != null && !validStatuses.includes(status)) {
      return next(ErrorFactory.createError(ErrorType.InvalidAuctionStatus));
    }


    const newAuction = await auctionService.createAuction({
      creatorId,
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      bidIncrement,
      bidsPerParticipant,
      startTime,
      relaunchTime,
      status,
    });

    res.status(HTTPStatus.CREATED).json({ message: 'Asta creata con successo', auction: newAuction });
  } catch (error) {
    console.error('Errore creazione asta:', error);
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
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }
    const result = await auctionService.joinAuction(userId, auctionId);
    res.status(HTTPStatus.OK).json(result);
  } catch (error) {
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
    const auctionId = parseInt(req.body.auctionId);
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
  } catch (error) {
    console.error('Errore startAuction:', error);
    next(error);
  }
};


/**
 * Chiude un'asta e notifica i partecipanti tramite websocket.
 * Restituisce il vincitore e l'importo finale.
 */
export const closeAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.body.auctionId);
    const result = await auctionService.closeAuction(auctionId);

    // Notifica la chiusura dell'asta tramite websocket
    broadcastToAuction(auctionId, {
      type: 'auction_closed',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });

    res.status(HTTPStatus.OK).json({
      message: 'Asta chiusa con successo',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Aggiorna lo stato di un'asta.
 * Richiede l'ID dell'asta e il nuovo stato.
 */
export const updateAuctionStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.body.auctionId);
    const { status } = req.body;
    const auction = await auctionService.updateStatus(auctionId, status);
    res.status(HTTPStatus.OK).json({ message: 'Stato asta aggiornato con successo', auction });
  } catch (error) {
    next(error);
  }
};




