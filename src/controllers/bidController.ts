import { Request, Response } from 'express';
import { Bid } from '../models/Bid';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';

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

    const auction = await Auction.findByPk(auctionId);
    // Controlla se l'asta esiste
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    // Controlla se l'asta è nello stato 'bidding'
    if (auction.status !== 'bidding') {
      res.status(400).json({ message: 'L\'asta non è nello stato "bidding"' });
      return;
    }

    
    const participation = await Participation.findOne({ where: { auctionId, userId, isValid: true } });
    // Controlla se l'utente ha partecipato all'asta
    if (!participation) {
      res.status(403).json({ message: 'Non hai partecipato a questa asta' });
      return;
    }

    // conta i bid già fatti
    const count = await Bid.count({ where: { auctionId, userId } });
    if (count >= auction.bidsPerParticipant) {
      res.status(403).json({ message: 'Hai esaurito le offerte disponibili per questa asta' });
      return;
    }

    // ottieni il bid più alto
    const lastBid = await Bid.findOne({
      where: { auctionId },
      order: [['createdAt', 'DESC']],
    });

    const lastAmount = lastBid ? Number(lastBid.amount) : 0;
    const minValid = lastAmount + Number(auction.minIncrement);

    // prezzo offerto dall'utente
    const { amount } = req.body;

    // Controlla se l'importo è valido
    if (!amount || isNaN(amount)) {
      res.status(400).json({ message: 'Importo offerta non valido' });
      return;
    }

    const amountNum = Number(amount);

    // Controlla se l'importo è inferiore al minimo valido
    if (amountNum < minValid) {
      res.status(400).json({ message: `L'offerta deve essere almeno di ${minValid}` });
      return;
    }

    // Controlla se l'importo supera il prezzo massimo dell'asta
    if (amountNum > Number(auction.maxPrice)) {
      res.status(400).json({ message: `L'offerta non può superare il prezzo massimo di ${auction.maxPrice}` });
      return;
    }

    // Controlla se l'utente è autenticato
    if (!userId) {
        res.status(401).json({ message: 'Utente non autenticato' });
    return;
    }

    // crea il nuovo bid
    const nowDate = new Date();
    const bid = await Bid.create({ auctionId, userId, amount,  updatedAt: nowDate });

    // check per rilancio automatico
    const now = Date.now();
    const endTime = new Date(auction.endTime).getTime();
    const timeLeft = endTime - now;

    // Se il tempo rimasto è inferiore al tempo di rilancio, estendi l'asta
    // e notifica i client
    if (timeLeft <= auction.relaunchTime * 1000) {
      // estendi asta
      auction.endTime = new Date(now + auction.relaunchTime * 1000);
      await auction.save();

      
      broadcastToAuction(auctionId, {
        type: 'extended',
        newEndTime: auction.endTime,
      });
    }

    // notifica nuova offerta
    broadcastToAuction(auctionId, {
      type: 'new_bid',
      bid: {
        id: bid.id,
        amount: bid.amount,
        userId: bid.userId,
        createdAt: bid.createdAt,
      },
    });

    res.status(201).json({ message: 'Offerta registrata con successo', bid });
  } catch (error) {
    console.error('Errore offerta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};
