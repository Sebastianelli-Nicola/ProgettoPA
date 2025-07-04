/**
 * @fileoverview Data Access Object (DAO) per la gestione delle aste.
 * 
 * Fornisce metodi per creare, recuperare, aggiornare e salvare aste nel database,
 * oltre a filtrarle per stato o per ID.
 */

import { Auction, AuctionCreationAttributes } from '../models/Auction';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import { Op, Transaction } from 'sequelize';

export class AuctionDAO {

  /**
   * Crea una nuova asta nel database.
   * 
   * @param data Attributi per la creazione dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Auction creata.
   */
  async create(data: AuctionCreationAttributes, transaction?: Transaction): Promise<Auction> {
    return Auction.create(data, { transaction });
  }


  /**
   * Recupera tutte le aste, eventualmente filtrate per stato.
   * 
   * @param status (Opzionale) Stato da filtrare ('created', 'open', 'bidding', 'closed').
   * @returns Array di aste ordinate per data di creazione decrescente.
   */
  async getAuctions(status?: string): Promise<Auction[]> {
    const allowedStatuses = ['created', 'open', 'bidding', 'closed'];
    const statusStr = status && allowedStatuses.includes(status) ? status : undefined;
    const whereClause = statusStr ? { status: statusStr } : undefined;
    return Auction.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
  }


  /**
   * Trova un'asta per ID.
   * 
   * @param id ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Auction trovata o null se non esiste.
   */
  async findById(id: number, transaction?: Transaction): Promise<Auction | null> {
    return Auction.findByPk(id, { transaction });
  }


  /**
   * Aggiorna lo stato di un'asta.
   * 
   * @param id ID dell'asta.
   * @param status Nuovo stato da impostare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Auction aggiornata.
   * @throws Errore 404 se l'asta non esiste.
   */
  async updateStatus(id: number, status: string, transaction?: Transaction): Promise<Auction> {
    const auction = await Auction.findByPk(id, { transaction });
    if (!auction) throw ErrorFactory.createError(ErrorType.AuctionNotFound);
    auction.status = status as any;
    await auction.save({ transaction });
    return auction;
  }


   /**
   * Salva le modifiche di un'asta esistente.
   * 
   * @param auction Istanza Auction da salvare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Auction aggiornata.
   */
  async save(auction: Auction, transaction?: Transaction): Promise<Auction> {
    return auction.save({ transaction });
  }


  /**
   * Trova tutte le aste chiuse tra una lista di ID.
   * 
   * @param auctionIds Array di ID delle aste da filtrare.
   * @returns Array di aste chiuse ordinate per data di creazione decrescente.
   */
  async findAllClosed(auctionIds: number[]): Promise<Auction[]> {
    return Auction.findAll(
      { where: {
        id: { [Op.in]: auctionIds },
        status: 'closed' // Prendi solo le aste chiuse
      }, order: [['createdAt', 'DESC']] });
  }
  
}

