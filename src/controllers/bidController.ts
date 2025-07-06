/**
 * @fileoverview Controller per la gestione delle offerte (bid) nelle aste.
 * 
 * Fornisce la funzione per inserire una nuova offerta e gestisce la logica di broadcasting tramite websocket.
 * Ogni funzione restituisce risposte HTTP appropriate e gestisce eventuali errori.
 */

import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { BidService } from '../services/bidService';
import { Auction } from '../models/Auction';
import { ParticipationDAO } from '../dao/participationDAO';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import HTTPStatus from 'http-status-codes';

const bidService = new BidService();
const participationDAO = ParticipationDAO.getInstance();


/**
 * Inserisce una nuova offerta per una specifica asta.
 * Valida i dati in ingresso, chiama il servizio per registrare l'offerta e notifica i partecipanti tramite websocket.
 * Restituisce la nuova offerta registrata o un errore se i dati sono mancanti/non validi.
 */
export const placeBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auctionId = parseInt(req.body.auctionId);
    const userId = req.user?.id;
    //const { amount } = req.body;

    // Verifica che l'utente sia autenticato
    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Verifica che l'importo sia valido
    // if (!amount || isNaN(amount)) {
    //   return next(ErrorFactory.createError(ErrorType.Validation, 'Importo offerta non valido'));
    // }

    // Registra l'offerta tramite il servizio
    const result = await bidService.placeBid(auctionId, userId);

    // // Se l'asta è stata estesa, notifica i partecipanti
    // if (result.extended) {
    //   broadcastToAuction(auctionId, {
    //     type: 'extended',
    //     newEndTime: result.newEndTime,
    //   });
    // }

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
  } catch (error: any) {
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

    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Trova l'asta
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return next(ErrorFactory.createError(ErrorType.AuctionNotFound));
    }

    // Consenti solo se l'asta è in fase di rilancio
    if (auction.status !== 'bidding') {
      return next(ErrorFactory.createError(ErrorType.BidsViewNotAllowed));
    }

    // Verifica se l'utente è partecipante o creatore
    const isParticipant = await participationDAO.findParticipation(userId, auctionId);
    const isCreator = auction.creatorId === userId;
    if (!isParticipant && !isCreator) {
      return next(ErrorFactory.createError(ErrorType.BidsViewNotAuthorized));
    }

    // Recupera tutti i rilanci per l'asta
    const bids = await bidService.getBidsForAuction(auctionId);
    res.json(bids);
  } catch (error: any) {
    next(error);
  }
};

