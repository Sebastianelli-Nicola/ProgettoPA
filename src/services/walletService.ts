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
  private walletDAO = WalletDAO.getInstance();

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
  /**
 * Ricarica il portafoglio per un utente.
 * Utilizza una transazione per garantire l'integrità dei dati.
 *
 * @param userId L'ID dell'utente.
 * @param amount L'importo da ricaricare.
 * @returns Il nuovo saldo del portafoglio.
 */
async rechargeWallet(userId: number, amount: number) {
  // Ottiene l'istanza di Sequelize associata al modello Wallet.
  const sequelize = Wallet.sequelize;

  // Se l'istanza non è presente, lancia un errore di tipo "ServiceUnavailable".
  if (!sequelize) {
    throw ErrorFactory.createError(
      ErrorType.ServiceUnavailable,
      'Sequelize instance not found on Wallet model.'
    );
  }

  // Verifica che l'importo da ricaricare sia maggiore di zero; altrimenti, lancia un errore di validazione.
  if (amount <= 0) {
    throw ErrorFactory.createError(
      ErrorType.Validation,
      'L\'importo deve essere maggiore di zero'
    );
  }

  // Esegue la ricarica del portafoglio all'interno di una transazione per garantire l'integrità dei dati.
  return sequelize.transaction(async (transaction) => {
    // Chiama il metodo `recharge` del DAO passando userId, amount e la transazione attiva.
    return this.walletDAO.recharge(userId, amount, transaction);
  });
}
}