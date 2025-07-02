import { AuctionDAO } from '../dao/auctionDAO';
import { ParticipationDAO } from '../dao/participationDAO';
import { WalletDAO } from '../dao/walletDAO';
import { BidDAO } from '../dao/bidDAO';
import { Auction } from '../models/Auction';
import { Sequelize } from 'sequelize';

export class AuctionService {
  private auctionDAO = new AuctionDAO();
  private participationDAO = new ParticipationDAO();
  private walletDAO = new WalletDAO();
  private bidDAO = new BidDAO();

  private getSequelize(): Sequelize {
    if (!Auction.sequelize) throw new Error('Sequelize instance not found on Auction model.');
    return Auction.sequelize;
  }

  async createAuction(data: any) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      return this.auctionDAO.create(data, transaction);
    });
  }

  async getAuctions(status?: string) {
    return this.auctionDAO.getAuctions(status);
  }

  async joinAuction(userId: number, auctionId: number) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      const auction = await this.auctionDAO.findById(auctionId, transaction);
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'open') throw { status: 400, message: 'L\'asta non è aperta per le iscrizioni' };

      const count = await this.participationDAO.countByAuction(auctionId, transaction);
      if (count >= auction.maxParticipants) throw { status: 400, message: 'Numero massimo di partecipanti raggiunto' };

      const wallet = await this.walletDAO.findByUserId(userId, transaction);
      if (!wallet) throw { status: 404, message: 'Wallet non trovato' };

      const costoTotale = +auction.entryFee + +auction.maxPrice;
      if (wallet.balance < costoTotale) throw { status: 400, message: 'Credito insufficiente' };

      const existing = await this.participationDAO.findParticipation(userId, auctionId, transaction);
      if (existing) throw { status: 400, message: 'Utente già iscritto' };

      await this.participationDAO.createParticipation({ userId, auctionId, fee: auction.entryFee }, transaction);
      wallet.balance -= costoTotale;
      await this.walletDAO.save(wallet, transaction);

      return { message: 'Partecipazione registrata con successo' };
    });
  }

  async closeAuction(auctionId: number) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      const auction = await this.auctionDAO.findById(auctionId, transaction);
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'bidding') throw { status: 400, message: 'L\'asta non è nello stato "bidding"' };

      const topBid = await this.bidDAO.findTopBidByAuction(auctionId, transaction);
      if (!topBid) throw { status: 400, message: 'Nessuna offerta valida trovata' };

      const finalAmount = Number(topBid.amount);
      const maxPrice = Number(auction.maxPrice);

      const winnerWallet = await this.walletDAO.findByUserId(topBid.userId, transaction);
      if (winnerWallet) {
        const refund = maxPrice - finalAmount;
        winnerWallet.balance += refund;
        await this.walletDAO.save(winnerWallet, transaction);
      }

      const winnerParticipation = await this.participationDAO.findParticipation(auctionId, topBid.userId, transaction);
      if (winnerParticipation) {
        winnerParticipation.isWinner = true;
        await this.participationDAO.saveParticipation(winnerParticipation, transaction);
      }

      const participants = await this.participationDAO.findValidParticipants(auctionId, transaction);
      for (const participant of participants) {
        if (participant.userId !== topBid.userId) {
          const wallet = await this.walletDAO.findByUserId(participant.userId, transaction);
          if (wallet) {
            wallet.balance += +maxPrice + +auction.entryFee;
            await this.walletDAO.save(wallet, transaction);
          }
        }
      }

      auction.status = 'closed';
      await this.auctionDAO.save(auction, transaction);

      return {
        winnerId: topBid.userId,
        finalAmount: topBid.amount,
      };
    });
  }

  async updateStatus(auctionId: number, status: string) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      return this.auctionDAO.updateStatus(auctionId, status, transaction);
    });
  }

  async startAuction(auctionId: number) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      const auction = await this.auctionDAO.findById(auctionId, transaction);
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'open') throw { status: 400, message: 'Asta non nello stato open' };

      const partecipanti = await this.participationDAO.countValidByAuction(auctionId, transaction);

      if (partecipanti < auction.minParticipants) {
        auction.status = 'cancelled';
        await this.auctionDAO.save(auction, transaction);
        return { closed: true, reason: 'Partecipanti insufficienti' };
      }

      auction.status = 'bidding';
      await this.auctionDAO.save(auction, transaction);
      return { started: true };
    });
  }

  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    return this.auctionDAO.getAuctionHistory(userId, from, to);
  }
}