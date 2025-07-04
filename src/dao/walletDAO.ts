/**
 * @fileoverview Data Access Object (DAO) per la gestione dei wallet utente.
 * 
 * Fornisce metodi per ottenere il saldo, salvare, trovare, ricaricare e creare wallet nel database.
 */

import { Wallet } from '../models/Wallet';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';


export class WalletDAO {
  private static instance: WalletDAO;

  private constructor() {}

  public static getInstance(): WalletDAO {
    if (!WalletDAO.instance) {
      WalletDAO.instance = new WalletDAO();
    }
    return WalletDAO.instance;
  }

  /**
   * Restituisce il wallet di un utente tramite userId.
   * 
   * @param userId ID dell'utente.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Istanza Wallet trovata o null se non esiste.
   */
  async getBalance(userId: number, transaction?: any) {
    return Wallet.findOne({ where: { userId }, transaction });
  }


  /**
   * Salva le modifiche di un wallet esistente.
   * 
   * @param wallet Istanza Wallet da salvare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Istanza Wallet aggiornata.
   */
  async save(wallet: Wallet, transaction?: any): Promise<Wallet> {
    return wallet.save({ transaction });
  }


  /**
   * Trova un wallet tramite userId.
   * 
   * @param userId ID dell'utente.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Istanza Wallet trovata o null se non esiste.
   */
  async findByUserId(userId: number, transaction?: any): Promise<Wallet | null> {
    return Wallet.findOne({ where: { userId }, transaction });
  }


  /**
   * Ricarica il wallet di un utente di un certo importo.
   * 
   * @param userId ID dell'utente.
   * @param amount Importo da aggiungere.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Istanza Wallet aggiornata.
   * @throws Errore se il wallet non esiste.
   */
  async recharge(userId: number, amount: number, transaction?: any): Promise<Wallet> {
    const wallet = await Wallet.findOne({ where: { userId }, transaction });
    if (!wallet) {
      throw ErrorFactory.createError(ErrorType.WalletNotFound);
    }
    wallet.balance += Number(amount);
    await wallet.save({ transaction });
    return wallet;
  }


  /**
   * Crea un nuovo wallet per un utente.
   * 
   * @param data Oggetto con userId e saldo iniziale.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Istanza Wallet creata.
   */
  async create(data: { userId: number, balance: number }, transaction?: any): Promise<Wallet> {
    return Wallet.create(data, { transaction });
  }
}

