/**
 * @fileoverview Servizio per la gestione delle statistiche.
 * 
 * Fornisce metodi per ottenere statistiche sulle aste e sulle spese degli utenti.
 */

import { StatsDAO } from '../dao/statsDAO';
import { Op } from 'sequelize';   
import PDFDocument from 'pdfkit';
import { BidDAO } from '../dao/bidDAO';

/**
 * Servizio per la gestione delle statistiche.
 */
export class StatsService {
  private statsDAO = StatsDAO.getInstance();

  /**
   * Ottiene le statistiche delle aste.
   *
   * @param from La data di inizio (opzionale).
   * @param to La data di fine (opzionale).
   * @returns Le statistiche delle aste.
   */
  async getAuctionStats(from?: string, to?: string) {
    const dateFilter: any = {};  // Filtro per le date

    // Aggiunge il filtro per le date se fornito
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt[Op.gte] = new Date(from);   // Filtro per la data di inizio. Op.gte serve per "maggiore o uguale"
      if (to) dateFilter.createdAt[Op.lte] = new Date(to);  // Filtro per la data di fine. Op.lte serve per "minore o uguale"
    }

    // Trova le aste e le puntate corrispondenti
    const auctions = await this.statsDAO.findAuctionsWithBids(dateFilter);

    let completedCount = 0;   // Conteggio delle aste completate
    let cancelledCount = 0;   // Conteggio delle aste annullate
    let totalBidsMassime = 0;  // Conteggio totale delle puntate massime
    let totaleBidsEffettuate = 0; // Inizializza il conteggio delle puntate effettuate
    let sommaRapporti = 0; // somma dei rapporti delle puntate
    const bidDAO = BidDAO.getInstance();

    // Calcola le statistiche per ogni asta
    for (const auction of auctions) {
        // Verifica lo stato dell'asta e incrementa i contatori
        if (auction.status === 'closed') {  
         completedCount++;
         totalBidsMassime = auction.maxParticipants * auction.bidsPerParticipant;  // Conteggio totale delle puntate massime
         totaleBidsEffettuate = await bidDAO.countByAuction(auction.id); // Conteggio totale delle puntate effettuate
         sommaRapporti += totalBidsMassime > 0 ? totaleBidsEffettuate / totalBidsMassime : 0;
        } 
        else if (auction.status === 'cancelled') cancelledCount++;
    }

    // Calcola il rapporto medio delle puntate
    const averageBidRatio = sommaRapporti / auctions.length;
    console.log( 'Total Bids Effettuate:', totaleBidsEffettuate, 'Total Bids Massime:', totalBidsMassime, 'Average Bid Ratio:' , averageBidRatio );

    // Restituisce le statistiche delle aste
    return {
      intervallo: { from, to },
      asteCompletate: completedCount,
      asteAnnullate: cancelledCount,
      mediaRapportoPuntate: averageBidRatio.toFixed(2),
    };
  }


  /**
   * Ottiene le spese di un utente.
   *
   * @param userId L'ID dell'utente.
   * @param from La data di inizio (opzionale).
   * @param to La data di fine (opzionale).
   * @returns Le spese dell'utente.
   */
  async getUserExpenses(userId: number, from?: Date, to?: Date) {
  // Recupera tutte le partecipazioni dell'utente nel periodo specificato
  const participations = await this.statsDAO.findParticipations(userId, from, to);

  let totalFees = 0;
  let totalSpentOnWins = 0;

  for (const p of participations) {
    const fee = typeof p.fee === 'string' ? parseFloat(p.fee) : p.fee;
    totalFees += fee;

    if (p.isWinner) {
      const winningBid = await this.statsDAO.findWinningBid(userId, p.auctionId);
      if (winningBid) {
        const amount = typeof winningBid.amount === 'string' ? parseFloat(winningBid.amount) : winningBid.amount;
        totalSpentOnWins += amount;
      }
    }
  }


    return {
    userId,
    totalParticipationFees: totalFees.toFixed(2),       
    totalWinningSpending: totalSpentOnWins.toFixed(2),   
    total: (totalFees + totalSpentOnWins).toFixed(2),    
    from: from || null,
    to: to || null,
  };
}

  /**
   * Ottiene lo storico delle aste alle quali si è partecipato distinguendo per quelle che 
   * sono state aggiudicate e non. 
   * 
   * @param userId L'ID dell'utente.
   * @param from La data di inizio (opzionale).
   * @param to La data di fine (opzionale). 
   * @returns Lo storico delle a cui a particpato l'utente
   */
  async getAuctionHistory(userId: number, from?: Date, to?: Date) {
    return this.statsDAO.getAuctionHistory(userId, from, to);
  }


  /**
   * Genera un PDF con lo storico delle aste vinte e perse.
   * 
   * @param history Oggetto con le aste vinte e perse
   * @returns Istanza di PDFDocument pronta per essere inviata come stream
   */
  generateAuctionHistoryPDF(history: { won: any[]; lost: any[] }) {
    const doc = new PDFDocument();
    doc.text('Storico aste aggiudicate:', { underline: true });
    if (history.won.length === 0) doc.text('Nessuna');
    history.won.forEach(item => {
      doc.text(`Asta: ${item.id} | Titolo: ${item.title} | Stato: ${item.status} | Vincitore: Sì | Costo Totale (inclusa fee): ${item.totalCost} | Data e Ora di aggiudicazione: ${item.endTime}`);
    });
    doc.moveDown();
    doc.text('Storico aste NON aggiudicate:', { underline: true });
    if (history.lost.length === 0) doc.text('Nessuna');
    history.lost.forEach(item => {
      doc.text(`Asta: ${item.id} | Titolo: ${item.title} | Stato: ${item.status} | Vincitore: No | Costo Totale (inclusa fee): ${item.totalCost} | Data e Ora di aggiudicazione: ${item.endTime}`);
    });
    return doc;
  }

}