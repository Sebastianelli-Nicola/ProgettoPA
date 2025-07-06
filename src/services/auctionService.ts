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
  private auctionDAO = AuctionDAO.getInstance();
  private participationDAO = ParticipationDAO.getInstance();
  private walletDAO = WalletDAO.getInstance();
  private bidDAO = BidDAO.getInstance();

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

      data.startTime = new Date(new Date(data.startTime).setSeconds(0, 0));
      data.endTime = new Date(new Date(data.startTime).getTime() + data.relaunchTime * 60000);

       
      //data.endTime = new Date(startTime.getTime() + data.relaunchTime * 60000); // Calcola endTime aggiungendo relaunchTime in minuti
     
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
        { key: 'maxPrice', value: data.maxPrice },
        { key: 'minIncrement', value: data.bidIncrement },
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
      if (data.maxPrice <= data.bidIncrement) {
        throw ErrorFactory.createError(
          ErrorType.Validation,
          'Il campo "maxPrice" deve essere maggiore di "bidIncrement".'
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
      if (!auction){
        throw ErrorFactory.createError(ErrorType.AuctionNotFound);
      } 

      // Controlla se l'asta è nello stato "open"
      if (auction.status !== 'open') {
        throw ErrorFactory.createError(ErrorType.AuctionNotOpen);
      }
      const count = await this.participationDAO.countByAuction(auctionId, transaction); // Conta i partecipanti all'asta
      
      // Controlla se il numero di partecipanti ha raggiunto il massimo consentito
      if (count >= auction.maxParticipants) {
        throw ErrorFactory.createError(ErrorType.MaxParticipantsReached);
      }

      const wallet = await this.walletDAO.findByUserId(userId, transaction);  // Trova il wallet dell'utente
      
      // Controlla se il wallet esiste
      if (!wallet){
        throw ErrorFactory.createError(ErrorType.WalletNotFound);
      } 

      const costoTotale = +auction.entryFee + +auction.maxPrice; // Calcola il costo totale per unirsi all'asta
      
      // Controlla se il saldo del wallet è sufficiente per coprire il costo
      if (wallet.balance < costoTotale){
        throw ErrorFactory.createError(ErrorType.InsufficientBalance);
      }

      // Trova la partecipazione esistente
      const existing = await this.participationDAO.findParticipation(userId, auctionId, transaction);

      // Controlla se l'utente è già iscritto all'asta
      if (existing) {
        throw ErrorFactory.createError(ErrorType.AlreadyJoined);
      }

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
    const sequelize = this.getSequelize();

    return sequelize.transaction(async (transaction) => {

      // 1. Recupera l'asta
      const auction = await this.auctionDAO.findById(auctionId, transaction);
      if (!auction) throw ErrorFactory.createError(ErrorType.AuctionNotFound);

      // Controlla che l'asta sia nello stato corretto
      if (auction.status !== 'bidding') {
        throw ErrorFactory.createError(ErrorType.InvalidAuctionStatus, 'L\'asta non è nello stato "bidding"');
      }

      // 2. Recupera tutte le puntate ordinate per data
      const bids = await this.bidDAO.findBidsByAuctionId(auctionId, transaction);
      if (!bids.length) {
        console.warn(`Nessuna puntata per auctionId ${auctionId}, impossibile determinare vincitore.`);
        auction.status = 'closed';
        await this.auctionDAO.save(auction, transaction);
        return { winnerId: null, finalAmount: 0 };
      }

      // 3. Conta quante puntate ha fatto ciascun utente
      const bidCountByUser: Record<number, number> = {};
      for (const bid of bids) {
        bidCountByUser[bid.userId] = (bidCountByUser[bid.userId] || 0) + 1;
      }

      // 4. Trova il numero massimo di puntate
      let maxBidCount = Math.max(...Object.values(bidCountByUser));

      // 4. Trova il numero massimo di puntate fatte da un singolo utente
      // let maxBidCount = 0;
      // for (const count of Object.values(bidCountByUser)) {
      //   if (count > maxBidCount) maxBidCount = count;
      // }

      // 5. Trova tutti gli utenti con il numero massimo di puntate
      const candidates = Object.entries(bidCountByUser)
        .filter(([_, count]) => count === maxBidCount)
        .map(([userId]) => Number(userId));

      // 6. Risolvi eventuale parità: vince chi ha puntato per ultimo tra i candidati
      let winnerId: number | undefined;
      for (let i = bids.length - 1; i >= 0; i--) {
        if (candidates.includes(bids[i].userId)) {
          winnerId = bids[i].userId;
          break;
        }
      }

      if (!winnerId) throw ErrorFactory.createError(ErrorType.WinnerNotFound);

      // 7. Calcola il prezzo finale dell’oggetto
      const totalBids = bids.length;
      const increment = Number(auction.bidIncrement);
      const finalAmount = totalBids * increment;
      const maxPrice = Number(auction.maxPrice);

      // 8. Rimborsa differenza al vincitore
      const winnerWallet = await this.walletDAO.findByUserId(winnerId, transaction);
      if (winnerWallet) {
        const refund = parseFloat((maxPrice - finalAmount).toFixed(2));
        if (refund > 0) {
          winnerWallet.balance = parseFloat(Number(winnerWallet.balance).toFixed(2));
          winnerWallet.balance += refund;
          await this.walletDAO.save(winnerWallet, transaction);
        }
      }

      // 9. Marca la partecipazione del vincitore
      const winnerParticipation = await this.participationDAO.findParticipation(winnerId, auctionId, transaction);
      if (winnerParticipation) {
        winnerParticipation.isWinner = true;
        await this.participationDAO.saveParticipation(winnerParticipation, transaction);
      }

      // 10. Rimborsa tutti gli altri partecipanti
      const participants = await this.participationDAO.findValidParticipants(auctionId, transaction);
      for (const participant of participants) {
        if (participant.userId !== winnerId) {
          const wallet = await this.walletDAO.findByUserId(participant.userId, transaction);
          if (wallet) {
            wallet.balance = parseFloat(Number(wallet.balance).toFixed(2));
            const totalRefund =
              parseFloat(Number(maxPrice).toFixed(2)) +
              parseFloat(Number(auction.entryFee).toFixed(2));
            wallet.balance += totalRefund;
            await this.walletDAO.save(wallet, transaction);
          }
        }
      }

      // 11. Chiudi l’asta
      auction.status = 'closed';
      await this.auctionDAO.save(auction, transaction);

      // 12. Restituisci i risultati
      return {
        winnerId,
        finalAmount,
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
      if (!auction) throw ErrorFactory.createError(ErrorType.AuctionNotFound);
      
      // Controlla se l'asta è nello stato "open"
      if (auction.status !== 'open') throw ErrorFactory.createError(ErrorType.AuctionNotOpen);
      
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
              wallet.balance = parseFloat(Number(wallet.balance).toFixed(2));

              const totalRefund =
                parseFloat(Number(maxPrice).toFixed(2)) +
                parseFloat(Number(auction.entryFee).toFixed(2));

              wallet.balance += totalRefund;
              await this.walletDAO.save(wallet, transaction);
            }
        }

        return { closed: true, reason: 'Partecipanti insufficienti' };
      }

      // Se l'asta ha abbastanza partecipanti, aggiorna lo stato a "bidding"
      // e salva l'asta aggiornata

      // Imposta lo stato dell'asta su 'bidding' (fase di rilancio)
      auction.status = 'bidding';

      // Registra l'orario di inizio della fase di rilancio come orario attuale
      auction.startTime = new Date(new Date().setSeconds(0, 0));

      // Calcola e imposta l'orario di fine della fase di rilancio
      // a partire da ora, sommando il tempo di durata in minuti
      auction.endTime = new Date(new Date(auction.startTime).getTime() + auction.relaunchTime * 60000);

      // Salva le modifiche nel database
      await this.auctionDAO.save(auction, transaction);
      return { started: true };

    })

  }

}
