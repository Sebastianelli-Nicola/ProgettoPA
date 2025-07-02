import { Participation } from '../models/Participation';
import { Auction } from '../models/Auction';
import { Transaction } from 'sequelize';
import { Op } from 'sequelize';

export class ParticipationDAO {
  async findParticipation(userId: number, auctionId: number, transaction?: Transaction) {
    return Participation.findOne({ where: { userId, auctionId }, transaction });
  }
  async countByAuction(auctionId: number, transaction?: Transaction) {
    return Participation.count({ where: { auctionId }, transaction });
  }

   async countValidByAuction(auctionId: number, transaction?: Transaction) {
    return Participation.count({ where: { auctionId, isValid: true }, transaction });
  }

  async createParticipation(data: any, transaction?: Transaction) {
    return Participation.create(data, { transaction });
  }

  async saveParticipation(participation: Participation, transaction?: Transaction) {
    return participation.save({ transaction });
  }

  async findValidParticipants(auctionId: number, transaction?: Transaction) {
    return Participation.findAll({ where: { auctionId, isValid: true }, transaction });
  }

  async findAllByUserWithDate(userId: number, from?: Date, to?: Date, transaction?: Transaction) {
  const where: any = { userId };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = from;
    if (to) where.createdAt[Op.lte] = to;
  }
  return Participation.findAll({ where, transaction });
}

async findAllByUserWithDateAndAuction(
    userId: number,
    from?: string,
    to?: string,
    transaction?: Transaction
  ) {
    const where: any = { userId, isValid: true };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    return Participation.findAll({
      where,
      include: [Auction],
      transaction,
    });
  }
}