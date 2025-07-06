/**
 * @fileoverview Servizio per gestire le offerte nelle aste.
 * 
 * Fornisce metodi per piazzare offerte, controllare lo stato delle offerte e gestire le partecipazioni degli utenti.
 * Le offerte sono gestite tramite il modello Bid e le operazioni sono eseguite tramite i DAO corrispondenti.
 */

import { Auction } from '../models/Auction';
import { Sequelize } from 'sequelize';
import { BidDAO } from '../dao/bidDAO';
import { AuctionDAO } from '../dao/auctionDAO';
import { ParticipationDAO } from '../dao/participationDAO';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';

/**
 * Servizio per gestire le offerte nelle aste.
 */
export class BidService {
  private bidDAO = BidDAO.getInstance();
  private participationDAO = ParticipationDAO.getInstance();
  private auctionDAO = AuctionDAO.getInstance();

  /**
   * Ottiene l'istanza di Sequelize associata al modello Auction.
   *
   * @returns L'istanza di Sequelize.
   * @throws Errore se l'istanza di Sequelize non è trovata sul modello Auction.
   */
  private getSequelize(): Sequelize {
    if (!Auction.sequelize) throw ErrorFactory.createError(ErrorType.Generic, 'Sequelize instance not found on Auction model.');
    return Auction.sequelize;
  }

  /**
   * Piazzare un'offerta per un'asta.
   * Utilizza una transazione per garantire l'integrità dei dati.
   *
   * @param auctionId L'ID dell'asta.
   * @param userId L'ID dell'utente che piazza l'offerta.
   * @param amount L'importo dell'offerta.
   * @returns L'offerta creata.
   *
   * @throws Errore se l'asta non esiste, se l'utente non ha partecipato all'asta o se l'offerta non è valida.
   */
  async placeBid(auctionId: number, userId: number) {
    const sequelize = this.getSequelize();    // Ottiene l'istanza di Sequelize
    return sequelize.transaction(async (transaction) => {

        const auction = await this.auctionDAO.findById(auctionId, transaction);   // Trova l'asta per ID

        // Controlla se l'asta esiste
        if (!auction) throw ErrorFactory.createError(ErrorType.AuctionNotFound);

        // Controlla se l'asta è nello stato "bidding"
        if (auction.status !== 'bidding'){
          throw ErrorFactory.createError(ErrorType.BidsViewNotAllowed);
        }

        // Controlla se l'utente ha partecipato all'asta
        const participation = await this.participationDAO.findParticipation(userId, auctionId, transaction);
        if (!participation) throw ErrorFactory.createError(ErrorType.NotParticipant);

        // Controlla se l'utente ha esaurito le offerte disponibili
        const count = await this.bidDAO.countByAuctionAndUser(auctionId, userId, transaction);  // Conta le offerte dell'utente per l'asta
        if (count >= auction.bidsPerParticipant) throw ErrorFactory.createError(ErrorType.BidLimitReached);

        const lastBid = await this.bidDAO.findLastBid(auctionId, transaction);   // Trova l'ultima offerta per l'asta
        const lastAmount = lastBid ? Number(lastBid.amount) : 0;   // Ottiene l'importo dell'ultima offerta

        const newAmount = lastAmount + Number(auction.bidIncrement);

        if (newAmount > Number(auction.maxPrice)) {
          throw ErrorFactory.createError(ErrorType.Validation, `Il prezzo finale non può superare ${auction.maxPrice} €`);
        }


        // Controlla se l'offerta supera il prezzo massimo
        if (newAmount > Number(auction.maxPrice)) throw ErrorFactory.createError(ErrorType.Validation, `L'offerta non può superare il prezzo massimo di ${auction.maxPrice}`);

        const nowDate = new Date();   // Ottiene la data e ora attuale


        // Crea una nuova offerta
        const bid = await this.bidDAO.createBid({
          auctionId,
          userId,
          amount: newAmount,     
          createdAt: nowDate,
          updatedAt: nowDate
        }, transaction);

        return { bid};
        });
    }

    /**
     * Restituisce tutte le offerte per una specifica asta.
     * @param auctionId ID dell'asta
     * @returns Array di offerte ordinate per data di creazione crescente
     */
    async getBidsForAuction(auctionId: number) {
      return this.bidDAO.findBidsByAuctionId(auctionId);
    }
}