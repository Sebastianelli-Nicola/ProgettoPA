/**
 * @fileoverview Data Access Object (DAO) per la gestione delle partecipazioni alle aste.
 * 
 * Fornisce metodi per creare, recuperare, contare e salvare partecipazioni,
 * oltre a filtrare per utente, asta, validità e intervallo di date.
 */

import { Participation } from '../models/Participation';
import { Auction } from '../models/Auction';
import { Transaction } from 'sequelize';
import { Op } from 'sequelize';

export class ParticipationDAO {

  /**
   * Trova la partecipazione di un utente a una specifica asta.
   * 
   * @param userId ID dell'utente.
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns La partecipazione trovata o null se non esiste.
   */
  async findParticipation(userId: number, auctionId: number, transaction?: Transaction) {
    return Participation.findOne({ where: { userId, auctionId }, transaction });
  }


  /**
   * Conta il numero totale di partecipazioni a una specifica asta.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Numero di partecipazioni all'asta.
   */
  async countByAuction(auctionId: number, transaction?: Transaction) {
    return Participation.count({ where: { auctionId }, transaction });
  }


  /**
   * Conta il numero di partecipazioni valide (isValid: true) a una specifica asta.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Numero di partecipazioni valide all'asta.
   */
   async countValidByAuction(auctionId: number, transaction?: Transaction) {
    return Participation.count({ where: { auctionId, isValid: true }, transaction });
  }


  /**
   * Crea una nuova partecipazione nel database.
   * 
   * @param data Dati della partecipazione da creare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Participation creata.
   */
  async createParticipation(data: any, transaction?: Transaction) {
    return Participation.create(data, { transaction });
  }


  /**
   * Salva le modifiche di una partecipazione esistente.
   * 
   * @param participation Istanza Participation da salvare.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns L'istanza Participation aggiornata.
   */
  async saveParticipation(participation: Participation, transaction?: Transaction) {
    return participation.save({ transaction });
  }


  /**
   * Trova tutti i partecipanti validi (isValid: true) a una specifica asta.
   * 
   * @param auctionId ID dell'asta.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Array di partecipazioni valide.
   */
  async findValidParticipants(auctionId: number, transaction?: Transaction) {
    return Participation.findAll({ where: { auctionId, isValid: true }, transaction });
  }


  /**
   * Trova tutte le partecipazioni valide di un utente, opzionalmente filtrate per intervallo di date,
   * includendo anche i dati dell'asta associata.
   * 
   * @param userId ID dell'utente.
   * @param from (Opzionale) Data di inizio filtro.
   * @param to (Opzionale) Data di fine filtro.
   * @param transaction (Opzionale) Transazione Sequelize.
   * @returns Array di partecipazioni valide con i dati dell'asta.
   */
  async findAllByUserWithDateAndAuction(
      userId: number,
      from?: Date,
      to?: Date,
      transaction?: Transaction
    ) {
      const where: any = { userId, isValid: true };
      
      // Applica filtro per intervallo di date se fornito
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = from;
        if (to) where.createdAt[Op.lte] = to;
      }
      return Participation.findAll({
        where,
        include: [Auction],
        transaction,
      });
    }
}