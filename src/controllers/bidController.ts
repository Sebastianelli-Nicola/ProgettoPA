import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { BidDAO } from '../dao/bidDAO'; // Importa il DAO per le offerte

/**
 * Funzione per piazzare un'offerta
 * Questa funzione gestisce la logica per piazzare un'offerta in un'asta.
 * Controlla se l'asta è nello stato "bidding", se l'utente
 * ha partecipato all'asta, se ha ancora offerte disponibili,
 * e se l'offerta è valida rispetto al prezzo minimo e massimo.
 * @param req 
 * @param res 
 * @returns 
 */
export const placeBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }
    if (!amount || isNaN(amount)) {
      res.status(400).json({ message: 'Importo offerta non valido' });
      return;
    }

    const bidDAO = new BidDAO();
    const result = await bidDAO.placeBid(auctionId, userId, Number(amount));

    if (result.extended) {
      broadcastToAuction(auctionId, {
        type: 'extended',
        newEndTime: result.newEndTime,
      });
    }

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
