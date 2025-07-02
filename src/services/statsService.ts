import { StatsDAO } from '../dao/statsDAO';
import { Op } from 'sequelize';

export class StatsService {
  private statsDAO = new StatsDAO();

  async getAuctionStats(from?: string, to?: string) {
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt[Op.gte] = new Date(from);
      if (to) dateFilter.createdAt[Op.lte] = new Date(to);
    }

    const auctions = await this.statsDAO.findAuctionsWithBids(dateFilter);
    const bids = await this.statsDAO.findBidsByAuctionIds(auctions.map(a => a.id));

    let completedCount = 0;
    let cancelledCount = 0;
    const totalBidsEffettuate = bids.length;
    let totalBidsMassime = 0;

    for (const auction of auctions) {
      if (auction.status === 'closed') completedCount++;
      else if (auction.status === 'cancelled') cancelledCount++;
      totalBidsMassime += auction.maxParticipants * auction.bidsPerParticipant;
    }

    const averageBidRatio = totalBidsMassime > 0 ? totalBidsEffettuate / totalBidsMassime : 0;
    console.log( 'Total Bids Effettuate:', totalBidsEffettuate, 'Total Bids Massime:', totalBidsMassime, 'Average Bid Ratio:' , averageBidRatio );

    return {
      intervallo: { from, to },
      asteCompletate: completedCount,
      asteAnnullate: cancelledCount,
      mediaRapportoPuntate: averageBidRatio.toFixed(2),
    };
  }

  async getUserExpenses(userId: number, from?: Date, to?: Date) {
    const participations = await this.statsDAO.findParticipations(userId, from, to);

    let totalFees = 0;
    let totalSpentOnWins = 0;

    for (const p of participations) {
      totalFees += p.fee;
      if (p.isWinner) {
        const winningBid = await this.statsDAO.findWinningBid(userId, p.auctionId);
        if (winningBid) totalSpentOnWins += Number(winningBid.amount);
      }
    }

    return {
      userId,
      totalParticipationFees: totalFees,
      totalWinningSpending: totalSpentOnWins,
      total: totalFees + totalSpentOnWins,
      from: from || null,
      to: to || null,
    };
  }

  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    return this.statsDAO.getAuctionHistory(userId, from, to);
  }
  
}