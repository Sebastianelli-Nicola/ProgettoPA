/**
 * @fileoverview Data Access Object (DAO) per la gestione delle offerte (bid) nelle aste.
 * 
 * Fornisce metodi per creare offerte, contare offerte per utente e asta,
 * trovare l'ultima offerta e trovare l'offerta più alta per un'asta.
 */

import { Bid } from '../models/Bid';
import { Transaction } from 'sequelize';

export class BidDAO {
  private static instance: BidDAO;

  private constructor() {}

  public static getInstance(): BidDAO {
    if (!BidDAO.instance) {
      BidDAO.instance = new BidDAO();
    }
    return BidDAO.instance;
  }

  /**
   * Crea una nuova offerta (bid) nel database.
   * 
   * @param data Dati dell'offerta da creare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Bid creata.
   */
  async createBid(data: any, transaction?: Transaction) {
    return Bid.create(data, { transaction });
  }

  /**
   * Conta quante offerte ha fatto un utente in una specifica asta.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Numero di offerte fatte nell'asta.
   */
  async countByAuction(auctionId: number) {
    return Bid.count({ where: { auctionId }});
  }

  /**
   * Conta quante offerte ha fatto un utente in una specifica asta da uno specifico utente.
   * 
   * @param auctionId ID dell'asta.
   * @param userId ID dell'utente.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Numero di offerte fatte dall'utente nell'asta.
   */
  async countByAuctionAndUser(auctionId: number, userId: number, transaction?: Transaction) {
    return Bid.count({ where: { auctionId, userId }, transaction });
  }


  /**
   * Trova l'ultima offerta fatta in una specifica asta.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'ultima offerta fatta nell'asta, o null se non esiste.
   */
  async findLastBid(auctionId: number, transaction?: Transaction) {
    return Bid.findOne({
      where: { auctionId },
      order: [['createdAt', 'DESC']],
      transaction,
    });
  }


  /**
   * Trova l'offerta più alta per una specifica asta.
   * In caso di parità di importo, prende la più vecchia.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'offerta più alta per l'asta, o null se non esiste.
   */
  async findTopBidByAuction(auctionId: number, transaction?: Transaction) {
    return Bid.findOne({
      where: { auctionId },
      order: [['amount', 'DESC'], ['createdAt', 'ASC']],
      transaction,
    });
  }


    /**
   * Restituisce tutte le offerte per una specifica asta.
   * @param auctionId ID dell'asta.
   * @returns Array di offerte ordinate per data di creazione crescente.
   */
  async findBidsByAuctionId(auctionId: number, transaction?: Transaction) {
    return Bid.findAll({
      where: { auctionId },
      order: [['createdAt', 'ASC']],
      transaction,
    });
  }
}

