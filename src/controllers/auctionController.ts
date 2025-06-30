import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { Wallet } from '../models/Wallet'; 
import { Bid } from '../models/Bid';
import { broadcastToAuction } from '../websocket/websockethandlers';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import { getSequelizeInstance } from '../DB/sequelize';
import { log } from 'console';

// Estendi l'interfaccia Request per includere 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Funzione per creare un'asta
// Permette di creare un'asta con i seguenti campi: 
// title, minParticipants, maxParticipants, entryFee, maxPrice, minIncrement, bidsPerParticipant, startTime, endTime, relaunchTime
export const createAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      minIncrement,
      bidsPerParticipant,
      startTime,
      endTime,
      relaunchTime,
      status
    } = req.body;

    if (
      !title || !minParticipants || !maxParticipants ||
      !entryFee || !maxPrice || !minIncrement ||
      !bidsPerParticipant || !startTime || !endTime || !relaunchTime
    ) {
      res.status(400).json({ message: 'Dati mancanti o incompleti' });
      return;
    }

    const newAuction = await Auction.create({
      title,
      minParticipants,
      maxParticipants,
      entryFee,
      maxPrice,
      minIncrement,
      bidsPerParticipant,
      startTime,
      endTime,
      relaunchTime,
      status,
    });

    res.status(201).json({ message: 'Asta creata con successo', auction: newAuction });
  } catch (error) {
    console.error('Errore creazione asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// Funzione per ottenere le aste
// Permette di filtrare per status (created, open, bidding, closed)
export const getAuctions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    // Ensure status is a string and matches allowed values
    const allowedStatuses = ['created', 'open', 'bidding', 'closed'];
    const statusStr = typeof status === 'string' && allowedStatuses.includes(status) ? status : undefined;
    const whereClause = statusStr ? { status: statusStr } : undefined;

    const auctions = await Auction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    res.json(auctions);
  } catch (error) {
    console.error('Errore lettura aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

/**
 * Funzione per unirsi a un'asta  
 * Permette agli utenti di unirsi a un'asta aperta
 * Richiede autenticazione JWT
 * Controlla se l'asta è aperta, se il numero massimo di partecipanti è stato raggiunto,
 * se l'utente ha un wallet valido e se ha abbastanza credito
 * Se l'utente è già iscritto, restituisce un errore
 * Se tutto va a buon fine, registra la partecipazione e aggiorna il saldo del wallet
 * @param req 
 * @param res 
 * @returns 
 */
export const joinAuction = async (req: Request, res: Response): Promise<void> => {
  

  // Inizializza la transazione
  const sequelize = getSequelizeInstance();
  const t = await sequelize.transaction();
  try {
    const userId = (req.user as any).id;
    const auctionId = req.body.auctionId;
    
    // Controlla se l'astaId è valido
    const auction = await Auction.findByPk(auctionId, { transaction: t });
    if (!auction) {
      await t.rollback();
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    // Controlla lo stato dell'asta
    if (auction.status !== 'open') {
      await t.rollback();
      res.status(400).json({ message: 'L\'asta non è aperta per le iscrizioni' });
      return;
    }

    // Controlla il numero di partecipanti
    const count = await Participation.count({ where: { auctionId }, transaction: t });
    if (count >= auction.maxParticipants) {
      await t.rollback();
      res.status(400).json({ message: 'Numero massimo di partecipanti raggiunto' });
      return;
    }


    // Controlla se l'utente ha un wallet valido
    const wallet = await Wallet.findOne({ where: { userId }, transaction: t });
    if (!wallet) {
      await t.rollback();
      res.status(404).json({ message: 'Wallet non trovato' });
      return;
    }

    // Controlla se l'utente ha abbastanza credito
    const costoTotale = +auction.entryFee + +auction.maxPrice;
    log('Costo totale:', costoTotale);
    if (wallet.balance < costoTotale) {
      await t.rollback();
      res.status(400).json({ message: 'Credito insufficiente' });
      return;
    }

    // Controlla se l'utente è già iscritto all'asta
    const existing = await Participation.findOne({ where: { userId, auctionId }, transaction: t });
    if (existing) {
      await t.rollback();
      res.status(400).json({ message: 'Utente già iscritto' });
      return;
    }

    // Registra la partecipazione
    await Participation.create({ userId, auctionId, fee: auction.entryFee }, { transaction: t });
    wallet.balance -= costoTotale;
    // Aggiorna il saldo del wallet
    await wallet.save({ transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Partecipazione registrata con successo' });
  } catch (err) {
    await t.rollback();
    console.error('Errore iscrizione:', err);
    res.status(500).json({ message: 'Errore interno' });
  }
};



/**
 * Funzione per chiudere un'asta
 * Permette di chiudere un'asta e selezionare il vincitore  
 * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono chiudere un'asta
 * Richiede autenticazione JWT
 * Questa funzione chiude l'asta, seleziona il vincitore e rimborsa gli altri partecipanti
 * Se l'asta è già chiusa o non è nello stato 'bidding', restituisce un errore
 * Se non ci sono offerte valide, restituisce un errore 
 * @param req 
 * @param res 
 * @returns 
 */
export const closeAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  const sequelize = getSequelizeInstance();
  const t = await sequelize.transaction();

  try {
    const auctionId = parseInt(req.params.id);
    const auction = await Auction.findByPk(auctionId, { transaction: t });

    // Controlla se l'asta esiste
    if (!auction) {
      await t.rollback();
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    // Controlla se l'asta è nello stato 'bidding'
    if (auction.status !== 'bidding') {
      await t.rollback();
      res.status(400).json({ message: 'L\'asta non è nello stato "bidding"' });
      return;
    }

    // Controlla se ci sono offerte valide
    const topBid = await Bid.findOne({
      where: { auctionId },
      order: [['amount', 'DESC'], ['createdAt', 'ASC']],
      transaction: t
    });

    // Se non ci sono offerte valide, restituisce un errore
    // Se non ci sono offerte, restituisce un errore
    if (!topBid) {
      await t.rollback();
      res.status(400).json({ message: 'Nessuna offerta valida trovata' });
      return;
    }

    const finalAmount = Number(topBid.amount);
    const maxPrice = Number(auction.maxPrice);

  
    const winnerWallet = await Wallet.findOne({ where: { userId: topBid.userId }, transaction: t });
    // Controlla se il wallet del vincitore esiste
    if (winnerWallet) {
      const refund = maxPrice - finalAmount;
      winnerWallet.balance += refund;
      await winnerWallet.save({ transaction: t });
    }

    // Segna il vincitore nella partecipazione
    // Trova la partecipazione del vincitore
    const winnerParticipation = await Participation.findOne({
      where: { auctionId, userId: topBid.userId },
      transaction: t
    });

    // Se la partecipazione del vincitore esiste, segna come vincitore
    // Se non esiste, non fa nulla
    if (winnerParticipation) {
      winnerParticipation.isWinner = true;
      await winnerParticipation.save({ transaction: t });
    }

    // Rimborsa tutti gli altri partecipanti validi
    const participants = await Participation.findAll({
      where: { auctionId, isValid: true },
      transaction: t
    });

    // Rimborsa tutti i partecipanti che non sono il vincitore
    // Per ogni partecipante, se non è il vincitore, rimborsa l'importo totale
    // (maxPrice + entryFee)
    for (const participant of participants) {
      if (participant.userId !== topBid.userId) {
        const wallet = await Wallet.findOne({ where: { userId: participant.userId }, transaction: t });
        if (wallet) {
          wallet.balance += +maxPrice + +auction.entryFee; // Rimborso totale per chi non ha vinto
          await wallet.save({ transaction: t });
        }
      }
    }

    // Chiude l'asta
    auction.status = 'closed';
    await auction.save({ transaction: t });

    await t.commit();

    // Notifica ai client che l'asta è chiusa e il vincitore
    // Invia un messaggio a tutti i client connessi che sono iscritti all'asta
    // broadcastToAuction è una funzione che invia un messaggio a tutti i client connessi
    // che sono iscritti all'asta specificata
    broadcastToAuction(auctionId, {
      type: 'auction_closed',
      winnerId: topBid.userId,
      finalAmount: topBid.amount,
    });

    // Risponde con un messaggio di successo
    // Risponde con un messaggio di successo e i dettagli del vincitore
    res.status(200).json({
      message: 'Asta chiusa con successo',
      winnerId: topBid.userId,
      finalAmount: topBid.amount,
    });
  } catch (error) {
    await t.rollback();
    console.error('Errore chiusura asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};



// Funzione per aggiornare lo stato di un'asta
// Permette di aggiornare lo stato di un'asta (created, open, bidding, closed)
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono aggiornare lo stato di un'asta
// Richiede autenticazione JWT
export const updateAuctionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['created', 'open', 'bidding', 'closed'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Stato non valido. Ammessi: created, open, bidding, closed' });
      return;
    }

    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    auction.status = status as any;
    await auction.save();

    res.status(200).json({ message: 'Stato dell\'asta aggiornato con successo', auction });
  } catch (error) {
    console.error('Errore aggiornamento stato asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};


/**
 * Funzione per avviare un'asta
 * Permette di avviare un'asta se ci sono abbastanza partecipanti
 * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono avviare un'asta
 * Richiede autenticazione JWT
 * Controlla se l'asta è nello stato 'open'
 * Se l'asta ha meno partecipanti del minimo richiesto, la chiude e notifica i client
 * Se l'asta ha abbastanza partecipanti, la avvia e notifica i client
 * Se l'asta non esiste o non è nello stato 'open', restituisce un errore
 * @param req 
 * @param res 
 * @returns 
 */
export const startAuction = async (req: any, res: any): Promise<void> => {
  const sequelize = getSequelizeInstance();
  const transaction = await sequelize.transaction();
  try {
    const auctionId = parseInt(req.params.id);
    const auction = await Auction.findByPk(auctionId, { transaction });

    // Controlla se l'asta esiste
    if (!auction) {
      await transaction.rollback();
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    // Controlla se l'asta è nello stato 'open'
    if (auction.status !== 'open') {
      await transaction.rollback();
      res.status(400).json({ message: 'Asta non nello stato open' });
      return;
    }

    
    const partecipanti = await Participation.count({ where: { auctionId, isValid: true }, transaction });

    // Controlla se ci sono abbastanza partecipanti
    // Se il numero di partecipanti è inferiore al minimo richiesto, chiude l'asta
    // e notifica i client
    if (partecipanti < auction.minParticipants) {
      auction.status = 'closed';
      await auction.save({ transaction });

      await transaction.commit();

      // Notifica ai client che l'asta è chiusa per partecipanti insufficienti
      // Invia un messaggio a tutti i client connessi che sono iscritti all'asta
      // broadcastToAuction è una funzione che invia un messaggio a tutti i client connessi
      // che sono iscritti all'asta specificata
      broadcastToAuction(auctionId, {
        type: 'auction_closed',
        reason: 'Partecipanti insufficienti',
      });

      res.status(200).json({ message: 'Asta chiusa per partecipanti insufficienti' });
      return;
    }

    auction.status = 'bidding';
    await auction.save({ transaction });

    await transaction.commit();

    // Notifica ai client che l'asta è iniziata
    // Invia un messaggio a tutti i client connessi che sono iscritti all'asta
    // broadcastToAuction è una funzione che invia un messaggio a tutti i client con connessi
    // che sono iscritti all'asta specificata
    broadcastToAuction(auctionId, {
      type: 'auction_started',
      auctionId,
    });

    res.status(200).json({ message: 'Asta avviata' });
  } catch (err) {
    await transaction.rollback();
    console.error('Errore startAuction:', err);
    res.status(500).json({ message: 'Errore interno' });
  }
};



export const getAuctionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { from, to, format } = req.query;

         if (!userId) {
           res.status(401).json({ message: 'Utente non autenticato' });
           return;
         }

         //Validazione date
         if (from && isNaN(Date.parse(from as string))) {
           res.status(400).json({ message: 'Parametro "from" non è una data valida' });
           return;
         }
         if (to && isNaN(Date.parse(to as string))) {
           res.status(400).json({ message: 'Parametro "to" non è una data valida' });
           return;
     }

        // Costruisci il filtro per il range temporale
        const where: any = {};
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from as string);
            if (to) where.createdAt[Op.lte] = new Date(to as string);
        }

        // Trova tutte le partecipazioni dell'utente
        const participations = await Participation.findAll({
            where: { userId },
            include: [{
                model: Auction,
                where,
            }]
        });

        // Prepara i dati per la risposta
        const history = participations.map(p => ({
            auctionId: p.auctionId,
            //title: p.auction.title,
            //status: p.auction.status,
            //startTime: p.auction.startTime,
            //endTime: p.auction.endTime,
            isWinner: p.isWinner,
        }));

        if (format === 'pdf') {
            // Esporta in PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="auction-history.pdf"');
            doc.text('Storico aste');
            history.forEach(item => {
                doc.text(`Asta: ${item.auctionId} | Stato:  | Vincitore: ${item.isWinner ? 'Sì' : 'No'}`);
            });
            doc.end();
            doc.pipe(res);
        } else {
            // Esporta in JSON
            res.json({ history });
        }
    } catch (error) {
       console.error('Errore recupero storico aste:', error);
       res.status(500).json({ message: 'Errore interno del server' });  
     }
};