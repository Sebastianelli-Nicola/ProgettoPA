/**
 * @fileoverview Controller per la gestione delle offerte (bid) nelle aste.
 * 
 * Fornisce la funzione per inserire una nuova offerta e gestisce la logica di broadcasting tramite websocket.
 * Ogni funzione restituisce risposte HTTP appropriate e gestisce eventuali errori.
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { BidService } from '../services/bidService';
import { Auction } from '../models/Auction';
import { ParticipationDAO } from '../dao/participationDAO';

const bidService = new BidService();
const participationDAO = new ParticipationDAO();


/**
 * Inserisce una nuova offerta per una specifica asta.
 * Valida i dati in ingresso, chiama il servizio per registrare l'offerta e notifica i partecipanti tramite websocket.
 * Restituisce la nuova offerta registrata o un errore se i dati sono mancanti/non validi.
 */
export const placeBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { amount } = req.body;

    // Verifica che l'utente sia autenticato
    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    // Verifica che l'importo sia valido
    if (!amount || isNaN(amount)) {
      res.status(400).json({ message: 'Importo offerta non valido' });
      return;
    }

    // Registra l'offerta tramite il servizio
    const result = await bidService.placeBid(auctionId, userId, Number(amount));

    // Se l'asta è stata estesa, notifica i partecipanti
    if (result.extended) {
      broadcastToAuction(auctionId, {
        type: 'extended',
        newEndTime: result.newEndTime,
      });
    }

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

    res.status(201).json({ message: 'Offerta registrata con successo', bid: result.bid });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Errore offerta:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }
};


/**
 * Restituisce l'elenco dei rilanci (offerte) per una specifica asta,
 * solo se l'utente è partecipante o creatore e l'asta è in fase "bidding".
 */
export const getBidsForAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    // Trova l'asta
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    // Consenti solo se l'asta è in fase di rilancio
    if (auction.status !== 'bidding') {
      res.status(403).json({ message: 'Non puoi visualizzare i rilanci: asta non in fase di rilancio' });
      return;
    }

    // Verifica se l'utente è partecipante o creatore
    const isParticipant = await participationDAO.findParticipation(userId, auctionId);
    const isCreator = auction.creatorId === userId;
    if (!isParticipant && !isCreator) {
      res.status(403).json({ message: 'Non sei autorizzato a visualizzare i rilanci di questa asta' });
      return;
    }

    // Recupera tutti i rilanci per l'asta
    const bids = await bidService.getBidsForAuction(auctionId);
    res.json(bids);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Errore interno del server' });
  }
};

