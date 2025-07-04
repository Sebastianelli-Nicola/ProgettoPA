/**
 * @fileoverview Servizio per gestire il portafoglio degli utenti.
 * 
 * Fornisce metodi per ottenere il saldo del portafoglio e ricaricare il portafoglio.
 */

import { WalletDAO } from '../dao/walletDAO';
import { Wallet } from '../models/Wallet';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';

/**
 * Servizio per gestire il portafoglio degli utenti.
 */
export class WalletService {
  private walletDAO = new WalletDAO();

  /**
   * Ottiene il saldo del portafoglio per un utente.
   *
   * @param userId L'ID dell'utente.
   * @returns Il saldo del portafoglio.
   */
  async getWalletBalance(userId: number) {
    const wallet = await this.walletDAO.getBalance(userId);
    if (!wallet) {
      throw ErrorFactory.createError(ErrorType.WalletNotFound);
    }
    return wallet;
  }

  /**
   * Ricarica il portafoglio per un utente.
   * Utilizza una transazione per garantire l'integrità dei dati.
   *
   * @param userId L'ID dell'utente.
   * @param amount L'importo da ricaricare.
   * @returns Il nuovo saldo del portafoglio.
   */
  async rechargeWallet(userId: number, amount: number) {
    const sequelize = Wallet.sequelize;
    if (!sequelize) throw ErrorFactory.createError(ErrorType.ServiceUnavailable, 'Sequelize instance not found on Wallet model.');
    if (amount <= 0) throw ErrorFactory.createError(ErrorType.Validation, 'L\'importo deve essere maggiore di zero');
    return sequelize.transaction(async (transaction) => {
      return this.walletDAO.recharge(userId, amount, transaction);
    });
  }
}