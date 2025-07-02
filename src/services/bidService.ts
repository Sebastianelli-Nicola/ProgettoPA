import { Auction } from '../models/Auction';
import { Sequelize } from 'sequelize';
import { BidDAO } from '../dao/bidDAO';
import { ParticipationDAO } from '../dao/participationDAO';

export class BidService {
  private bidDAO = new BidDAO();
  private participationDAO = new ParticipationDAO();

  private getSequelize(): Sequelize {
    if (!Auction.sequelize) throw new Error('Sequelize instance not found on Auction model.');
    return Auction.sequelize;
  }

  async placeBid(auctionId: number, userId: number, amount: number) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      const auction = await Auction.findByPk(auctionId, { transaction });
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'bidding') throw { status: 400, message: 'L\'asta non è nello stato "bidding"' };

      const participation = await this.participationDAO.findParticipation(userId, auctionId, transaction);
      if (!participation) throw { status: 403, message: 'Non hai partecipato a questa asta' };

      const count = await this.bidDAO.countByAuctionAndUser(auctionId, userId, transaction);
      if (count >= auction.bidsPerParticipant) throw { status: 403, message: 'Hai esaurito le offerte disponibili per questa asta' };

      const lastBid = await this.bidDAO.findLastBid(auctionId, transaction);
      const lastAmount = lastBid ? Number(lastBid.amount) : 0;
      const minValid = lastAmount + Number(auction.minIncrement);

      if (amount < minValid) throw { status: 400, message: `L'offerta deve essere almeno di ${minValid}` };
      if (amount > Number(auction.maxPrice)) throw { status: 400, message: `L'offerta non può superare il prezzo massimo di ${auction.maxPrice}` };

      const nowDate = new Date();
      const bid = await this.bidDAO.createBid({ auctionId, userId, amount, updatedAt: nowDate }, transaction);

      // Gestione estensione asta
      const now = Date.now();
      const endTime = new Date(auction.endTime).getTime();
      const timeLeft = endTime - now;
      let extended = false;
      let newEndTime: Date | null = null;

      if (timeLeft <= auction.relaunchTime * 1000) {
        auction.endTime = new Date(now + auction.relaunchTime * 1000);
        await auction.save({ transaction });
        extended = true;
        newEndTime = auction.endTime;
      }

      return { bid, extended, newEndTime };
    });
  }
}