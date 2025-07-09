/**
 * @fileoverview Data Access Object (DAO) per la gestione delle statistiche sulle aste.
 * 
 * Fornisce metodi per recuperare aste con offerte, offerte per aste, partecipazioni,
 * offerte vincenti e storico delle aste per utente.
 */

import { Auction } from '../models/Auction';
import { Bid } from '../models/Bid';
import { ParticipationDAO } from '../dao/participationDAO';
import { Op } from 'sequelize';
import { AuctionDAO } from './auctionDAO';
import { BidDAO } from '../dao/bidDAO';

export class StatsDAO {
  private static instance: StatsDAO;

  private constructor() {}

  public static getInstance(): StatsDAO {
    if (!StatsDAO.instance) {
      StatsDAO.instance = new StatsDAO();
    }
    return StatsDAO.instance;
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


  /**
   * Trova tutte le offerte associate a una lista di ID aste.
   * 
   * @param auctionIds Array di ID delle aste.
   * @returns Array di offerte trovate.
   */
  async findBidsByAuctionIds(auctionIds: number[]) {
    return Bid.findAll({
      where: {
        auctionId: {
          [Op.in]: auctionIds
        }
      }
    });
  }


  /**
   * Trova tutte le partecipazioni di un utente, opzionalmente filtrate per intervallo di date.
   * 
   * @param userId ID dell'utente.
   * @param from (Opzionale) Data di inizio filtro.
   * @param to (Opzionale) Data di fine filtro.
   * @returns Array di partecipazioni trovate.
   */
  async findParticipations(userId: number, from?: Date, to?: Date) {
    const participationDAO = ParticipationDAO.getInstance();
    return participationDAO.findAllByUserWithDateAndAuction(userId, from, to);
  }


  /**
   * Trova l'offerta vincente di un utente per una specifica asta.
   * 
   * @param userId ID dell'utente.
   * @param auctionId ID dell'asta.
   * @returns L'offerta vincente o null se non esiste.
   */
  async findWinningBid(userId: number, auctionId: number) {
    const bidDAO = BidDAO.getInstance();
    return bidDAO.findBidsByAuctionIdAndUserId(auctionId,userId);
  }


   /**
   * Restituisce lo storico delle aste a cui ha partecipato un utente,
   * distinguendo tra aste aggiudicate e non aggiudicate.
   * 
   * @param userId ID dell'utente.
   * @param from (Opzionale) Data di inizio filtro.
   * @param to (Opzionale) Data di fine filtro.
   * @returns Oggetto con due array: aste vinte (won) e perse (lost).
   */
  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    const participationDAO = ParticipationDAO.getInstance();
    const auctionDAO = AuctionDAO.getInstance();
    const bidDAO = BidDAO.getInstance();

    // Recupera tutte le partecipazioni dell'utente nel periodo
    const participations = await participationDAO.findAllByUserWithDateAndAuction(userId, from, to);
    const auctionIds = participations.map(p => p.auctionId);

    // Recupera tutte le aste chiuse a cui ha partecipato
    const auctions = await auctionDAO.findAllClosed(auctionIds);

    // Crea una mappa per accedere rapidamente alle partecipazioni
    const participationMap = new Map<number, any>();
    participations.forEach(p => participationMap.set(p.auctionId, p));

    // Per ogni asta chiusa, calcola info aggiuntive
    const history = await Promise.all(auctions.map(async auction => {
      const participation = participationMap.get(auction.id);
      
      let userBidTotal = 0;
      if (participation) {
        userBidTotal = await bidDAO.countByAuction(auction.id)
          .then(count => count * Number(auction.bidIncrement)); 
      }

      const totalCost = Number(participation?.fee || 0) + userBidTotal;

      return {
        ...auction.toJSON(),
        isWinner: participation?.isWinner || false,
        endTime: auction.endTime,
        totalCost
      };
    }));

    const won = history.filter(a => a.isWinner);
    const lost = history.filter(a => !a.isWinner);

    return { won, lost };
  }


}

