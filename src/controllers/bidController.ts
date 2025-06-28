import { Request, Response } from 'express';
import { Bid } from '../models/Bid';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { AuthRequest } from '../middlewares/authMiddleware';
import { broadcastToAuction } from '../websocket/websockethandlers';

export const placeBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user?.id;

    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    if (auction.status !== 'bidding') {
      res.status(400).json({ message: 'L\'asta non è nello stato "bidding"' });
      return;
    }

    const participation = await Participation.findOne({ where: { auctionId, userId, isValid: true } });
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

    if (!amount || isNaN(amount) || Number(amount) < minValid) {
      res.status(400).json({ message: `L'offerta deve essere almeno di ${minValid}` });
      return;
    }

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
