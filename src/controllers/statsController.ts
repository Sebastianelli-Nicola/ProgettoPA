import { Request, Response } from 'express';
import { Auction } from '../models/Auction';
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