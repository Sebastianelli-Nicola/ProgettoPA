import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { Bid } from '../models/Bid';
import { Op } from 'sequelize';

export const getAuctionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Costruisci i filtri per le date
    const dateFilter: any = {};
    if (startDate) {
      dateFilter[Op.gte] = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter[Op.lte] = new Date(endDate as string);
    }

    // Ottieni le aste chiuse nel periodo specificato
    const Auctions = await Auction.findAll({
      where: {
        endTime: dateFilter,
      },
      include: [{
        model: Bid,
        attributes: ['amount'],
      }],
    });

    const bids = await Bid.findAll({
      where: {
        auctionId: {
          [Op.in]: Auctions.map(auction => auction.id)
        }
      }
    });

    //Calcola le statistiche
    let completedCount = 0;
    let cancelledCount = 0;
    const totalBidsEffettuate = bids.length;
    let totalBidsMassime = 0
    //let ratioSum = 0;
    //let ratioCount = 0;

    for (const auction of Auctions) {
      if (auction.status === 'closed') {
        completedCount++;
      } else if (auction.status === 'cancelled') {
        cancelledCount++;
      }
       totalBidsMassime += auction.maxParticipants * auction.bidsPerParticipant;
    }

    const averageBidRatio = totalBidsMassime > 0 ? totalBidsEffettuate / totalBidsMassime : 0;


    res.json({
      intervallo: { startDate, endDate },
      asteCompletate: completedCount,
      asteAnnullate: cancelledCount,
      mediaRapportoPuntate: averageBidRatio.toFixed(2),
    });
    } catch (error) {
    console.error('Errore durante il recupero delle statistiche delle aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
} 


/**
 * Calcola le spese di un utente (partecipazioni e vincite) in un intervallo temporale.
 * Richiede autenticazione e ruolo 'bid-participant'.
 */
export const getUserExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { from, to } = req.query;
    
    // Validazione date
    const dateFilter: any = {};
    if (from && isNaN(Date.parse(from as string))) {
      res.status(400).json({ message: 'Parametro "from" non è una data valida' });
      return;
    }
    if (to && isNaN(Date.parse(to as string))) {
      res.status(400).json({ message: 'Parametro "to" non è una data valida' });
      return;
    }
    if (from) dateFilter[Op.gte] = new Date(from as string);
    if (to) dateFilter[Op.lte] = new Date(to as string);

    // Ottieni le partecipazioni effettive (non annullate)
    const participations = await Participation.findAll({
      where: {
        userId,
        isValid: true,
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      include: [Auction],
    });

    let totalFees = 0;
    let totalSpentOnWins = 0;

    for (const p of participations) {
      totalFees += p.fee;

      if (p.isWinner) {
        const winningBid = await Bid.findOne({
          where: {
            userId,
            auctionId: p.auctionId,
          },
          order: [['amount', 'DESC']],
        });

        if (winningBid) {
          totalSpentOnWins += Number(winningBid.amount);
        }
      }
    }

    res.status(200).json({
      userId,
      totalParticipationFees: totalFees,
      totalWinningSpending: totalSpentOnWins,
      total: totalFees + totalSpentOnWins,
      from: from || null,
      to: to || null,
    });
  } catch (error) {
    console.error('Errore nel calcolo delle spese:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};