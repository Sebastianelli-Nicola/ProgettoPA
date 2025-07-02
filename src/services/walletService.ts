import { WalletDAO } from '../dao/walletDAO';
import { Wallet } from '../models/Wallet';

export class WalletService {
  private walletDAO = new WalletDAO();

  async getWalletBalance(userId: number) {
    return this.walletDAO.getBalance(userId);
  }

  async rechargeWallet(userId: number, amount: number) {
    const sequelize = Wallet.sequelize;
    if (!sequelize) throw new Error('Sequelize instance not found on Wallet model.');
    return sequelize.transaction(async (transaction) => {
      return this.walletDAO.recharge(userId, amount, transaction);
    });
  }
}