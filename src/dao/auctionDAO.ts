/**
 * @fileoverview Data Access Object (DAO) per la gestione delle aste.
 * 
 * Fornisce metodi per creare, recuperare, aggiornare e salvare aste nel database,
 * oltre a filtrarle per stato o per ID.
 */

import { Auction, AuctionCreationAttributes } from '../models/Auction';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import { Op, Transaction } from 'sequelize';
import { Bid } from '../models/Bid';

export class AuctionDAO {
  private static instance: AuctionDAO;

  private constructor() {}

  public static getInstance(): AuctionDAO {
    if (!AuctionDAO.instance) {
      AuctionDAO.instance = new AuctionDAO();
    }
    return AuctionDAO.instance;
  }

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
    const allowedStatuses = ['created', 'open', 'bidding', 'closed', 'cancelled'];
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
   * 
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


  /**
   * Trova tutte le aste che devono iniziare, sulla base dello stato e dell'orario di inizio.
   * 
   * @param status Array di stati accettati (es. ['created', 'open']).
   * @param startTime Data limite: prende le aste il cui startTime è inferiore o uguale.
   * @returns Array di aste da avviare, ordinate per data di creazione decrescente.
   */
  async findAllStartTime(status: string[], startTime: Date): Promise<Auction[]> {
    return Auction.findAll(
      { where: {
        status: status, 
        startTime: { [Op.lte]: startTime },
      }, order: [['createdAt', 'DESC']] });
  }


  /**
   * Trova tutte le aste che devono essere chiuse, sulla base dello stato e dell'orario di fine.
   * 
   * @param status Array di stati accettati (es. ['bidding']).
   * @param endTime Data limite: prende le aste il cui endTime è inferiore o uguale.
   * @returns Array di aste da chiudere, ordinate per data di creazione decrescente.
   */
  async findAllEndTime(status: string[], endTime: Date): Promise<Auction[]> {
    return Auction.findAll(
      { where: {
        status: status, 
        endTime: { [Op.lte]: endTime },
      }, order: [['createdAt', 'DESC']] });
  }

  /**
     * Trova tutte le aste che hanno offerte, opzionalmente filtrate per data.
     * 
     * @param dateFilter Oggetto filtro per le date (es. { createdAt: { [Op.gte]: ... } })
     * @returns Array di aste con le relative offerte.
     */
    async findAuctionsWithBids(dateFilter: any) {
      return Auction.findAll({
        where: dateFilter,
        include: [{
          model: Bid,
          attributes: ['amount'],
        }]
      });
    }
  
}

