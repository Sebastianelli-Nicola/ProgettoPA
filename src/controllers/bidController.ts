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

const bidService = new BidService();


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

