import { Auction } from '../models/Auction';
import { Bid } from '../models/Bid';
import { ParticipationDAO } from '../dao/participationDAO';
import { Op } from 'sequelize';
import { AuctionDAO } from './auctionDAO';

export class StatsDAO {
  async findAuctionsWithBids(dateFilter: any) {
    return Auction.findAll({
      where: dateFilter,
      include: [{
        model: Bid,
        attributes: ['amount'],
      }]
    });
  }

  async findBidsByAuctionIds(auctionIds: number[]) {
    return Bid.findAll({
      where: {
        auctionId: {
          [Op.in]: auctionIds
        }
      }
    });
  }

  async findParticipations(userId: number, from?: Date, to?: Date) {
    const participationDAO = new ParticipationDAO();
    return participationDAO.findAllByUserWithDateAndAuction(userId, from, to);
  }

  async findWinningBid(userId: number, auctionId: number) {
    return Bid.findOne({
      where: { userId, auctionId },
      order: [['amount', 'DESC']],
    });
  }

  // async getAuctionHistory(userId: number, from?: Date, to?: Date) {
  //   const whereAuction: any = { userId };
  //   if (from || to) {
  //     whereAuction.createdAt = {};
  //     if (from) whereAuction.createdAt[Op.gte] = new Date(from as Date);
  //     if (to) whereAuction.createdAt[Op.lte] = new Date(to as Date);
  //   }
  //   return Auction.findAll({
  //     where: whereAuction,
  //     order: [['createdAt', 'DESC']],
  //   });
  // }

  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    const participationDAO = new ParticipationDAO();
    const participations = await participationDAO.findAllByUserWithDateAndAuction(userId, from, to);

    const auctionIds = participations.map(p => p.auctionId);

    const auctionDAO = new AuctionDAO();
    const auctions = await auctionDAO.findAllClosed(auctionIds);

    const participationMap = new Map<number, any>();
    participations.forEach(p => participationMap.set(p.auctionId, p));

    // Arricchisci ogni asta con info se è stata aggiudicata dall'utente
    const history = auctions.map(a => ({
      ...a.toJSON(),
      isWinner: participationMap.get(a.id)?.isWinner || false
    }));

    // Dividi tra aste aggiudicate e non aggiudicate
    const won = history.filter(a => a.isWinner);
    const lost = history.filter(a => !a.isWinner);

    return { won, lost };
  }

}

// import { Auction } from '../models/Auction';
// import { Bid } from '../models/Bid';
// import { ParticipationDAO } from '../dao/participationDAO'; 
// import { Op } from 'sequelize';

// export class StatsDAO {

//   async getAuctionStats(from?: string, to?: string) {
//     // Costruisci i filtri per le date
//     const dateFilter: any = {};
//     if (from || to) {
//       dateFilter.createdAt = {};
//       if (from) dateFilter.createdAt[Op.gte] = new Date(from as string);
//       if (to) dateFilter.createdAt[Op.lte] = new Date(to as string);
//     }

//     // Ottieni le aste chiuse nel periodo specificato
//     const auctions = await Auction.findAll({
//       where: dateFilter,
//       include: [{
//         model: Bid,
//         attributes: ['amount'],
//       }]
//     });
//     const bids = await Bid.findAll({
//       where: {
//         auctionId: {
//           [Op.in]: auctions.map(auction => auction.id)
//         }
//       }
//     });

//     // Calcola le statistiche
//     let completedCount = 0;  
//     let cancelledCount = 0;
//     const totalBidsEffettuate = bids.length;
//     let totalBidsMassime = 0;

//     for (const auction of auctions) {
//       if (auction.status === 'closed') {
//         completedCount++;
//       } else if (auction.status === 'cancelled') {
//         cancelledCount++;
//       }
//       totalBidsMassime += auction.maxParticipants * auction.bidsPerParticipant;
//     }

//     const averageBidRatio = totalBidsMassime > 0 ? totalBidsEffettuate / totalBidsMassime : 0;

//     return {
//       intervallo: { from, to },
//       asteCompletate: completedCount,
//       asteAnnullate: cancelledCount,
//       mediaRapportoPuntate: averageBidRatio.toFixed(2),
//     };
//   }

// async getUserExpenses(userId: number, from?: string, to?: string) {
//    const dateFilter: any = {};
//     if (from) dateFilter[Op.gte] = new Date(from);
//     if (to) dateFilter[Op.lte] = new Date(to);

//     const participationDAO = new ParticipationDAO();
//     const participations = await participationDAO.findAllByUserWithDateAndAuction(userId, from, to);

//     let totalFees = 0;
//     let totalSpentOnWins = 0;

//     for (const p of participations) {
//       totalFees += p.fee;

//       if (p.isWinner) {
//         const winningBid = await Bid.findOne({
//           where: {
//             userId,
//             auctionId: p.auctionId,
//           },
//           order: [['amount', 'DESC']],
//         });

//         if (winningBid) {
//           totalSpentOnWins += Number(winningBid.amount);
//         }
//       }
//     }

//     return {
//       userId,
//       totalParticipationFees: totalFees,
//       totalWinningSpending: totalSpentOnWins,
//       total: totalFees + totalSpentOnWins,
//       from: from || null,
//       to: to || null,
//     };
//   }
// }
