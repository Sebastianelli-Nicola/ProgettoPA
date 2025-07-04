/**
 * @fileoverview Servizio per gestire il portafoglio degli utenti.
 * 
 * Fornisce metodi per ottenere il saldo del portafoglio e ricaricare il portafoglio.
 */

import { WalletDAO } from '../dao/walletDAO';
import { Wallet } from '../models/Wallet';

/**
 * Servizio per gestire il portafoglio degli utenti.
 */
export class WalletService {
  private walletDAO = WalletDAO.getInstance();

  /**
   * Ottiene il saldo del portafoglio per un utente.
   *
   * @param userId L'ID dell'utente.
   * @returns Il saldo del portafoglio.
   */
  async getWalletBalance(userId: number) {
    return this.walletDAO.getBalance(userId);
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
    if (!sequelize) throw new Error('Sequelize instance not found on Wallet model.');
    return sequelize.transaction(async (transaction) => {
      return this.walletDAO.recharge(userId, amount, transaction);
    });
  }
}