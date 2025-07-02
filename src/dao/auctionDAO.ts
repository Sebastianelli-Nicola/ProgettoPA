import { Auction, AuctionCreationAttributes } from '../models/Auction';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize';
import { ParticipationDAO } from './participationDAO';
import { WalletDAO } from './walletDAO';
import { BidDAO } from './bidDAO';

export class AuctionDAO {
  // Crea una nuova asta
  async create(data: AuctionCreationAttributes): Promise<Auction> {
    return Auction.create(data);
  }

  async getAuctions(status?: string) {
    const allowedStatuses = ['created', 'open', 'bidding', 'closed'];
    const statusStr = status && allowedStatuses.includes(status) ? status : undefined;
    const whereClause = statusStr ? { status: statusStr } : undefined;

    return Auction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
  }

  async joinAuction(userId: number, auctionId: number) {
    const sequelize = getSequelizeInstance();
    const t = await sequelize.transaction();

    try {
      const auction = await Auction.findByPk(auctionId, { transaction: t });
      const participation = new ParticipationDAO();
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'open') throw { status: 400, message: 'L\'asta non è aperta per le iscrizioni' };

      const count = await participation.countByAuction(auctionId, t);
      if (count >= auction.maxParticipants) throw { status: 400, message: 'Numero massimo di partecipanti raggiunto' };

      const walletDAO = new WalletDAO();
      const wallet = await walletDAO.findByUserId(userId, t);
      if (!wallet) throw { status: 404, message: 'Wallet non trovato' };

      const costoTotale = +auction.entryFee + +auction.maxPrice;
      if (wallet.balance < costoTotale) throw { status: 400, message: 'Credito insufficiente' };

      const existing = await participation.findParticipation(userId, auctionId, t);
      if (existing) throw { status: 400, message: 'Utente già iscritto' };

      await participation.createParticipation({ userId, auctionId, fee: auction.entryFee }, t);
      wallet.balance -= costoTotale;
      await walletDAO.save(wallet, t);

      await t.commit();
      return { message: 'Partecipazione registrata con successo' };
    } catch (err: any) {
      await t.rollback();
      throw err;
    }
  }

   async closeAuction(auctionId: number) {
    const sequelize = getSequelizeInstance();
    const t = await sequelize.transaction();

    try {
      const auction = await Auction.findByPk(auctionId, { transaction: t });
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'bidding') throw { status: 400, message: 'L\'asta non è nello stato "bidding"' };

      const bidDAO = new BidDAO();
      const topBid = await bidDAO.findTopBidByAuction(auctionId, t);
      if (!topBid) throw { status: 400, message: 'Nessuna offerta valida trovata' };

      const finalAmount = Number(topBid.amount);
      const maxPrice = Number(auction.maxPrice);

      const walletDAO = new WalletDAO();
      const winnerWallet = await walletDAO.findByUserId(topBid.userId, t);
      if (winnerWallet) {
        const refund = maxPrice - finalAmount;
        winnerWallet.balance += refund;
        await walletDAO.save(winnerWallet, t);
      }

      const participation = new ParticipationDAO();

      const winnerParticipation = await participation.findParticipation(auctionId, topBid.userId, t);
      if (winnerParticipation) {
        winnerParticipation.isWinner = true;
        await participation.saveParticipation(winnerParticipation, t);
      }

      const participants = await participation.findValidParticipants(auctionId, t);

      for (const participant of participants) {
        if (participant.userId !== topBid.userId) {
          const walletDAO = new WalletDAO();
          const wallet = await walletDAO.findByUserId(participant.userId, t);
          if (wallet) {
            wallet.balance += +maxPrice + +auction.entryFee;
            await walletDAO.save(wallet, t);
          }
        }
      }

      auction.status = 'closed';
      await auction.save({ transaction: t });

      await t.commit();

      return {
        winnerId: topBid.userId,
        finalAmount: topBid.amount,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
  

  // Trova un'asta per ID (opzionale transazione)
  async findById(id: number, options?: { transaction?: Transaction }): Promise<Auction | null> {
    return Auction.findByPk(id, options);
  }

  // Trova tutte le aste, eventualmente filtrando per status
  async findAllByStatus(status?: string): Promise<Auction[]> {
    const whereClause = status ? { status } : undefined;
    return Auction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
  }

  // Aggiorna lo stato di un'asta
  async updateStatus(id: number, status: string): Promise<void> {
    const auction = await Auction.findByPk(id);
    if (!auction) throw new Error('Auction not found');
    auction.status = status as any;
    await auction.save();
  }

  // Inizia un'asta (aggiorna stato a 'bidding')
  async startAuction(auctionId: number): Promise<{ started?: boolean; closed?: boolean; reason?: string }> {
    const sequelize = getSequelizeInstance();
    const transaction = await sequelize.transaction();

    try {
      const auction = await Auction.findByPk(auctionId, { transaction });
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      if (auction.status !== 'open') throw { status: 400, message: 'Asta non nello stato open' };

      const participationDAO = new ParticipationDAO();
      const partecipanti = await participationDAO.countValidByAuction(auctionId, transaction);

      if (partecipanti < auction.minParticipants) {
        auction.status = 'cancelled';
        await auction.save({ transaction });
        await transaction.commit();
        return { closed: true, reason: 'Partecipanti insufficienti' };
      }

      auction.status = 'bidding';
      await auction.save({ transaction });
      await transaction.commit();
      return { started: true };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // Recupera storico aste per utente con filtri temporali
  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    const whereAuction: any = { userId };
    // Costruisci il filtro per il range temporale
    if (from || to) {
        whereAuction.createdAt = {};
        if (from) whereAuction.createdAt[Op.gte] = new Date(from as Date);
        if (to) whereAuction.createdAt[Op.lte] = new Date(to as Date);
    }

        const participationDAO = new ParticipationDAO();
        const participations = await participationDAO.findAllByUserWithDate(userId, from, to);

        const auction = await Auction.findAll({
            where: { id: participations.map(p => p.auctionId) },
            attributes: ['id', 'title', 'status', 'startTime', 'endTime'],
        });

        // Prepara i dati per la risposta
        return participations.map(p => ({
            auctionId: p.auctionId,
            title: auction.find(a => a.id === p.auctionId)?.title,
            status: auction.find(a => a.id === p.auctionId)?.status,
            startTime: auction.find(a => a.id === p.auctionId)?.startTime,
            endTime: auction.find(a => a.id === p.auctionId)?.endTime,
            isWinner: p.isWinner,
        }));
      }
}
function getSequelizeInstance(): Sequelize {
  // Assumes Auction model is initialized with a sequelize instance
  // and that instance is accessible via Auction.sequelize
  if (!Auction.sequelize) {
    throw new Error('Sequelize instance not found on Auction model.');
  }
  return Auction.sequelize;
}