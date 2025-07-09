/**
 * @fileoverview Controller per la gestione delle offerte (bid) nelle aste.
 * 
 * Fornisce la funzione per inserire una nuova offerta e gestisce la logica di broadcasting tramite websocket.
 * Ogni funzione restituisce risposte HTTP appropriate e gestisce eventuali errori.
 */

import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { BidService } from '../services/bidService';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import HTTPStatus from 'http-status-codes';

const bidService = new BidService();


/**
 * Inserisce una nuova offerta per una specifica asta.
 * Valida i dati in ingresso, chiama il servizio per registrare l'offerta e notifica i partecipanti tramite websocket.
 * Restituisce la nuova offerta registrata o un errore se i dati sono mancanti/non validi.
 */
export const placeBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.body.auctionId);
    const userId = req.user?.id;

    // Verifica che l'utente sia autenticato
    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Registra l'offerta tramite il servizio
    const result = await bidService.placeBid(auctionId, userId);

    // Notifica la nuova offerta a tutti i partecipanti
    broadcastToAuction(auctionId, {
      type: 'new_bid',
      bid: {
        id: result.bid.id,
        amount: result.bid.amount,
        userId: result.bid.userId,
        createdAt: result.bid.createdAt,
      },
    });

      res.status(HTTPStatus.CREATED).json({ message: 'Offerta registrata con successo', bid: result.bid });
  } catch (error) {
    next(error);
  }
};


/**
 * Restituisce l'elenco dei rilanci (offerte) per una specifica asta,
 * solo se l'utente è partecipante o creatore e l'asta è in fase "bidding".
 */
export const getBidsForAuction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.body.auctionId);
    const userId = req.user?.id;

    // Verifica che l'utente sia autenticato
    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Recupera tutti i rilanci per l'asta
    const bids = await bidService.getBidsForAuction(auctionId, userId);
    res.json(bids);
  } catch (error) {
    next(error);
  }
};

