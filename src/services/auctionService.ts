/**
 * @fileoverview Servizio per gestire le operazioni relative alle aste.
 * 
 * Fornisce metodi per creare, gestire e chiudere aste, oltre a gestire le partecipazioni degli utenti.
 * Le aste sono gestite tramite il modello Auction e le operazioni sono eseguite tramite i DAO corrispondenti.  
 * Le operazioni includono la creazione di aste, l'iscrizione degli utenti, la chiusura delle aste e la gestione delle puntate. 
 * 
 */

import { AuctionDAO } from '../dao/auctionDAO';
import { ParticipationDAO } from '../dao/participationDAO';
import { WalletDAO } from '../dao/walletDAO';
import { BidDAO } from '../dao/bidDAO';
import { Auction } from '../models/Auction';
import { Sequelize } from 'sequelize';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';

/**
 * Servizio per gestire le operazioni relative alle aste.
 * 
 * Fornisce metodi per creare, gestire e chiudere aste, oltre a gestire le partecipazioni degli utenti.
 * Le aste sono gestite tramite il modello Auction e le operazioni sono eseguite tramite i DAO corrispondenti.  
 * Le operazioni includono la creazione di aste, l'iscrizione degli utenti, la chiusura delle aste e la gestione delle puntate. 
 */
export class AuctionService {
  private auctionDAO = new AuctionDAO();
  private participationDAO = new ParticipationDAO();
  private walletDAO = new WalletDAO();
  private bidDAO = new BidDAO();

  /**
   * Ottiene l'istanza di Sequelize associata al modello Auction.
   * 
   * @returns L'istanza di Sequelize.
   * @throws Errore se l'istanza di Sequelize non è trovata sul modello Auction.
   */
  private getSequelize(): Sequelize {
    if (!Auction.sequelize) throw new Error('Sequelize instance not found on Auction model.');
    return Auction.sequelize;
  }


  /**
   * Crea una nuova asta.
   * Utilizza una transazione per garantire l'integrità dei dati.
   * 
   * @param data I dati dell'asta da creare.
   * @returns La nuova asta creata.
   */
  async createAuction(data: any) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      // Controlla che la data e ora di inizio siano almeno uguali o superiori all'attuale
      const now = new Date();
      const startTime = new Date(data.startTime);
      if (startTime < now) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          "La data e ora di inizio dell'asta devono essere uguali o successive a quella attuale."
        );
      }

      /*const endTime = new Date(data.startTime);
      if (endTime <= startTime){
        throw ErrorFactory.createError(
          ErrorType.Validation,
          "La data e ora di fine dell'asta devono essere successive a quella di inizio."
        );
      }*/

      // Controlla che tutti i valori numerici siano positivi
      const numericFields = [
        { key: 'minParticipants', value: data.minParticipants },
        { key: 'maxParticipants', value: data.maxParticipants },
        //{ key: 'entryFee', value: data.entryFee },
        { key: 'maxPrice', value: data.maxPrice },
        { key: 'minIncrement', value: data.minIncrement },
        { key: 'bidsPerParticipant', value: data.bidsPerParticipant },
        { key: 'relaunchTime', value: data.relaunchTime}
      ];

      for (const field of numericFields) {
        if (typeof field.value !== 'number' || field.value <= 0) {
          throw ErrorFactory.createError(
            ErrorType.Validation,
            `Il campo "${field.key}" deve essere un numero positivo.`
          );
        }
      }

      // maxPrice deve essere maggiore di minIncrement
      if (data.maxPrice <= data.minIncrement) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          'Il campo "maxPrice" deve essere maggiore di "minIncrement".'
        );
      }

      // maxParticipants deve essere maggiore o uguale a minParticipants
      if (data.maxParticipants < data.minParticipants) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          'Il campo "maxParticipants" deve essere maggiore o uguale a "minParticipants".'
        );
      }

      // maxPrice deve essere maggiore di minIncrement
      if (data.entryFee < 0) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          'Il campo "entryFee" deve essere maggiore uguale a zero.'
        );
      }

      // Controlla che creatorId sia presente
      if (!data.creatorId) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          "Il campo 'creatorId' è obbligatorio."
        );
      }

      return this.auctionDAO.create(data, transaction);
    });
  }


  /**
   * Ottiene le aste in base allo stato specificato.
   * Se lo stato non è fornito, restituisce tutte le aste.
   * 
   * @param status Lo stato delle aste da recuperare (opzionale).
   * @returns Un array di aste con lo stato specificato.
   */
  async getAuctions(status?: string) {
    return this.auctionDAO.getAuctions(status);
  }


  /**
   * Permette a un utente di unirsi a un'asta.
   * Controlla se l'asta è aperta, se l'utente ha un wallet con saldo sufficiente e se non è già iscritto.
   * Utilizza una transazione per garantire l'integrità dei dati.
   * 
   * @param userId L'ID dell'utente che vuole unirsi all'asta.
   * @param auctionId L'ID dell'asta a cui unirsi.
   * @returns Un messaggio di successo se l'iscrizione è avvenuta con successo.
   */
  async joinAuction(userId: number, auctionId: number) {
    const sequelize = this.getSequelize();   // Ottiene l'istanza di Sequelize
    return sequelize.transaction(async (transaction) => {
      
      const auction = await this.auctionDAO.findById(auctionId, transaction);   // Trova l'asta per ID

      // Controlla se l'asta esiste
      if (!auction) throw { status: 404, message: 'Asta non trovata' };

      // Controlla se l'asta è nello stato "open"
      if (auction.status !== 'open') throw { status: 400, message: 'L\'asta non è aperta per le iscrizioni' };

      const count = await this.participationDAO.countByAuction(auctionId, transaction); // Conta i partecipanti all'asta
      
      // Controlla se il numero di partecipanti ha raggiunto il massimo consentito
      if (count >= auction.maxParticipants) throw { status: 400, message: 'Numero massimo di partecipanti raggiunto' };

      const wallet = await this.walletDAO.findByUserId(userId, transaction);  // Trova il wallet dell'utente
      
      // Controlla se il wallet esiste
      if (!wallet) throw { status: 404, message: 'Wallet non trovato' };

      const costoTotale = +auction.entryFee + +auction.maxPrice; // Calcola il costo totale per unirsi all'asta
      
      // Controlla se il saldo del wallet è sufficiente per coprire il costo
      if (wallet.balance < costoTotale) throw { status: 400, message: 'Credito insufficiente' };

      // Trova la partecipazione esistente
      const existing = await this.participationDAO.findParticipation(userId, auctionId, transaction);

      // Controlla se l'utente è già iscritto all'asta
      if (existing) throw { status: 400, message: 'Utente già iscritto' };

      // Crea una nuova partecipazione
      await this.participationDAO.createParticipation({ userId, auctionId, fee: auction.entryFee }, transaction);
      wallet.balance -= costoTotale;    // Sottrae il costo totale dal saldo del wallet
      await this.walletDAO.save(wallet, transaction);  // Salva il wallet aggiornato

      return { message: 'Partecipazione registrata con successo' };
    });
  }

  
  /**
   * Chiude un'asta e determina il vincitore.
   * Gestisce i rimborsi ai partecipanti e aggiorna lo stato dell'asta.
   * Utilizza una transazione per garantire l'integrità dei dati.
   * 
   * @param auctionId L'ID dell'asta da chiudere.
   * @returns Un oggetto contenente l'ID del vincitore e l'importo finale dell'offerta.
   */
  async closeAuction(auctionId: number) {
    const sequelize = this.getSequelize();  // Ottiene l'istanza di Sequelize
    return sequelize.transaction(async (transaction) => {
      const auction = await this.auctionDAO.findById(auctionId, transaction); // Trova l'asta per ID

      // Controlla se l'asta esiste
      if (!auction) throw { status: 404, message: 'Asta non trovata' }; 
      
      // Controlla se l'asta è nello stato "bidding"
      if (auction.status !== 'bidding') throw { status: 400, message: 'L\'asta non è nello stato "bidding"' };

      const topBid = await this.bidDAO.findTopBidByAuction(auctionId, transaction); // Trova la puntata più alta per l'asta
      
      // Controlla se esiste una puntata valida
      if (!topBid) throw { status: 400, message: 'Nessuna offerta valida trovata' };

      const finalAmount = Number(topBid.amount); // Importo finale dell'offerta vincente
      const maxPrice = Number(auction.maxPrice); // Prezzo massimo dell'asta

      // Trova il wallet del vincitore
      const winnerWallet = await this.walletDAO.findByUserId(topBid.userId, transaction);

      // Se il wallet del vincitore esiste, rimborsa la differenza tra il prezzo massimo e l'importo finale
      if (winnerWallet) {
        const refund = maxPrice - finalAmount;
        winnerWallet.balance += refund;
        await this.walletDAO.save(winnerWallet, transaction); // Salva il wallet del vincitore con il rimborso
      }

      // Trova la partecipazione del vincitore e segna come vincitore
      const winnerParticipation = await this.participationDAO.findParticipation(topBid.userId, auctionId, transaction);
      
      // Se la partecipazione del vincitore esiste, aggiorna il campo isWinner
      // e salva la partecipazione aggiornata
      if (winnerParticipation) {
        winnerParticipation.isWinner = true;
        await this.participationDAO.saveParticipation(winnerParticipation, transaction);
      }

      // Trova tutti i partecipanti validi all'asta
      const participants = await this.participationDAO.findValidParticipants(auctionId, transaction);
      
      // Rimborsa tutti i partecipanti che non sono il vincitore
      // Aggiunge il prezzo massimo all'importo del wallet di ogni partecipante non vincitore
      // e salva il wallet aggiornato
      for (const participant of participants) {
        if (participant.userId !== topBid.userId) {
          const wallet = await this.walletDAO.findByUserId(participant.userId, transaction);
          if (wallet) {
            wallet.balance += +maxPrice;
            await this.walletDAO.save(wallet, transaction);
          }
        }
      }

      // Aggiorna lo stato dell'asta a "closed"
      auction.status = 'closed';
      await this.auctionDAO.save(auction, transaction);   // Salva l'asta aggiornata

      // Restituisce l'ID del vincitore e l'importo finale dell'offerta
      // Questo oggetto sarà utilizzato per notificare il vincitore e l'importo finale
      return {
        winnerId: topBid.userId,
        finalAmount: topBid.amount,
      };
    });
  }


  /**
   * Aggiorna lo stato di un'asta.
   * Utilizza una transazione per garantire l'integrità dei dati.
   * 
   * @param auctionId L'ID dell'asta da aggiornare.
   * @param status Il nuovo stato dell'asta.
   * @returns L'asta aggiornata.
   */
  async updateStatus(auctionId: number, status: string) {
    const sequelize = this.getSequelize();
    return sequelize.transaction(async (transaction) => {
      return this.auctionDAO.updateStatus(auctionId, status, transaction);
    });
  }

  /**
   * Avvia un'asta.
   * Utilizza una transazione per garantire l'integrità dei dati.
   * 
   * @param auctionId L'ID dell'asta da avviare.
   * @returns Un messaggio di successo se l'asta è stata avviata con successo.
   */
  async startAuction(auctionId: number) {
    const sequelize = this.getSequelize();
    
    return sequelize.transaction(async (transaction) => {
      // Trova l'asta per ID
      const auction = await this.auctionDAO.findById(auctionId, transaction);
      
      // Controlla se l'asta esiste
      if (!auction) throw { status: 404, message: 'Asta non trovata' };
      
      // Controlla se l'asta è nello stato "open"
      if (auction.status !== 'open') throw { status: 400, message: 'Asta non nello stato open' };
      
      
      // // Controlla che la data e ora attuale sia successiva allo startTime dell'asta
      // const now = new Date();
      // const startTime = new Date(auction.startTime);
      // if (now < startTime) {
      //   return { notStarted: true, message: 'L\'asta non può essere avviata prima della data/ora di inizio prevista.' };
      // }
      
      // Conta i partecipanti validi all'asta
      const partecipanti = await this.participationDAO.countValidByAuction(auctionId, transaction);
      const maxPrice = Number(auction.maxPrice);    // Prezzo massimo dell'asta

      // Se il numero di partecipanti è inferiore al minimo richiesto, cancella l'asta
      // Rimborsa i partecipanti e aggiorna lo stato dell'asta a "cancelled"
      // Aggiunge il prezzo massimo e la tassa di iscrizione al wallet di ogni partecipante
      // e salva il wallet aggiornato
      if (partecipanti < auction.minParticipants) {
        auction.status = 'cancelled';
        await this.auctionDAO.save(auction, transaction);
        // Trova tutti i partecipanti validi all'asta
        const participants = await this.participationDAO.findValidParticipants(auctionId, transaction);

        // Rimborsa i partecipanti
        for (const participant of participants) {
            const wallet = await this.walletDAO.findByUserId(participant.userId, transaction);
            if (wallet) {
              wallet.balance += +maxPrice + +auction.entryFee;
              await this.walletDAO.save(wallet, transaction);
            }
        }

        return { closed: true, reason: 'Partecipanti insufficienti' };
      }

      // Se l'asta ha abbastanza partecipanti, aggiorna lo stato a "bidding"
      // e salva l'asta aggiornata
      auction.status = 'bidding';
      await this.auctionDAO.save(auction, transaction);
      return { started: true };
    });
  }

  
}