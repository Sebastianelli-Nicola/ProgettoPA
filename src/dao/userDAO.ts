/**
 * @fileoverview Data Access Object (DAO) per la gestione degli utenti.
 * 
 * Fornisce metodi per trovare utenti tramite email o username, creare nuovi utenti e creare wallet associati.
 */

import { User } from '../models/User';
import { WalletDAO } from './walletDAO';


type AllowedRole = "admin" | "bid-creator" | "bid-participant";

export class UserDAO {
  private static instance: UserDAO;

  private constructor() {}

  public static getInstance(): UserDAO {
    if (!UserDAO.instance) {
      UserDAO.instance = new UserDAO();
    }
    return UserDAO.instance;
  }

  /**
   * Trova un utente tramite email
   * 
   * @param email Email dell'utente da cercare
   * @returns L'istanza User trovata o null se non esiste
   */
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }


  /**
   * Trova un utente tramite username.
   * 
   * @param username Username dell'utente da cercare.
   * @returns L'istanza User trovata o null se non esiste.
   */
  async findByUsername(username: string) {
    return User.findOne({ where: { username } });
  }


  /**
   * Crea un nuovo utente nel database.
   * 
   * @param data Oggetto contenente email, password, ruolo e username.
   * @returns L'istanza User creata.
   */
  async createUser(data: { email: string, password: string, role: AllowedRole, username: string }) {
    return User.create(data);
  }


  /**
   * Crea un wallet associato a un utente.
   * 
   * @param userId ID dell'utente.
   * @param initialBalance Saldo iniziale del wallet.
   * @returns L'istanza Wallet creata.
   */
  async createWallet(userId: number, initialBalance: number) {
    const walletDAO = WalletDAO.getInstance();
    return walletDAO.create({ userId, balance: initialBalance });
  }
}
