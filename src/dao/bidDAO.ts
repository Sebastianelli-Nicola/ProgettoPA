import { Bid } from '../models/Bid';
import { Transaction } from 'sequelize';

export class BidDAO {
  async createBid(data: any, transaction?: Transaction) {
    return Bid.create(data, { transaction });
  }

  async countByAuctionAndUser(auctionId: number, userId: number, transaction?: Transaction) {
    return Bid.count({ where: { auctionId, userId }, transaction });
  }

  async findLastBid(auctionId: number, transaction?: Transaction) {
    return Bid.findOne({
      where: { auctionId },
      order: [['createdAt', 'DESC']],
      transaction,
    });
  }

  async findTopBidByAuction(auctionId: number, transaction?: Transaction) {
    return Bid.findOne({
      where: { auctionId },
      order: [['amount', 'DESC'], ['createdAt', 'ASC']],
      transaction,
    });
  }
}


/*import { Bid } from '../models/Bid';
import { Auction } from '../models/Auction';
import { ParticipationDAO } from '../dao/participationDAO';

export class BidDAO {
  async placeBid(auctionId: number, userId: number, amount: number) {
    const auction = await Auction.findByPk(auctionId);
    if (!auction) throw { status: 404, message: 'Asta non trovata' };
    if (auction.status !== 'bidding') throw { status: 400, message: 'L\'asta non è nello stato "bidding"' };

    const participationDAO = new ParticipationDAO();
    const participation = await participationDAO.findParticipation(userId, auctionId);
    if (!participation) throw { status: 403, message: 'Non hai partecipato a questa asta' };

    const count = await Bid.count({ where: { auctionId, userId } });
    if (count >= auction.bidsPerParticipant) throw { status: 403, message: 'Hai esaurito le offerte disponibili per questa asta' };

    const lastBid = await Bid.findOne({
      where: { auctionId },
      order: [['createdAt', 'DESC']],
    });

    const lastAmount = lastBid ? Number(lastBid.amount) : 0;
    const minValid = lastAmount + Number(auction.minIncrement);

    if (amount < minValid) throw { status: 400, message: `L'offerta deve essere almeno di ${minValid}` };
    if (amount > Number(auction.maxPrice)) throw { status: 400, message: `L'offerta non può superare il prezzo massimo di ${auction.maxPrice}` };

    const nowDate = new Date();
    const bid = await Bid.create({ auctionId, userId, amount, updatedAt: nowDate });

    // Gestione estensione asta
    const now = Date.now();
    const endTime = new Date(auction.endTime).getTime();
    const timeLeft = endTime - now;
    let extended = false;
    let newEndTime: Date | null = null;

    if (timeLeft <= auction.relaunchTime * 1000) {
      auction.endTime = new Date(now + auction.relaunchTime * 1000);
      await auction.save();
      extended = true;
      newEndTime = auction.endTime;
    }

    return { bid, extended, newEndTime };
  }

  async findTopBidByAuction(auctionId: number, t?: any) {
    return Bid.findOne({
       where: { auctionId },
        order: [['amount', 'DESC'], ['createdAt', 'ASC']],
        transaction: t
    });
  }
}*/
