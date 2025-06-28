import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { Wallet } from '../models/Wallet'; 
import { Bid } from '../models/Bid';
import { broadcastToAuction } from '../websocket/websockethandlers';

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

// Funzione per unirsi a un'asta
// Permette agli utenti di unirsi a un'asta se l'asta è aperta
export const joinAuction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).id; // Assicurati che l'ID utente sia disponibile nel token JWT
    const auctionId = req.body.auctionId;
    
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    } 

    //L'asta deve essere nello stato aperta
    if (auction.status !== 'open') {
      res.status(400).json({ message: 'L\'asta non è aperta per le iscrizioni' });
      return;
    }

    //controllo numero partecipanti
    const count = await Participation.count({ where: { auctionId } });
    if (count >= auction.maxParticipants) {
      res.status(400).json({ message: 'Numero massimo di partecipanti raggiunto' });
      return;
    }

    //Wallet dell'utente
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      res.status(404).json({ message: 'Wallet non trovato' });
      return;
    }

    const costoIscrizione = auction.entryFee;
    const costoMassimo = auction.maxPrice;
    const creditoNecessario = +costoIscrizione + +costoMassimo;

    if (wallet.balance < creditoNecessario) {
      res.status(400).json({ message: wallet.balance + ' ' + creditoNecessario + 'Credito insufficiente per partecipare all\'asta' });
      return;
    }

    //verifica se l'utente è già iscritto all'asta
    const existingParticipation = await Participation.findOne({ where: { userId, auctionId } });
    if (existingParticipation) {
      res.status(400).json({ message: 'Utente già iscritto all\'asta' });
      return;
    }

    //creazione partecipazione all'asta e prenotazione
    await Participation.create({ userId, auctionId, fee: auction.entryFee });
    wallet.balance -= creditoNecessario; // Deduzione del credito
    await wallet.save(); // Salvataggio del wallet aggiornato

    res.status(200).json({ message: 'Partecipazione all\'asta avvenuta con successo' });
  } catch (error) {
    console.error('Errore durante l\'iscrizione all\'asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

/**
 * Chiude un'asta, imposta lo stato a 'closed' e seleziona il vincitore
 */
export const closeAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Recupera l'asta
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    if (auction.status === 'closed') {
      res.status(400).json({ message: 'L\'asta è già chiusa' });
      return;
    }

    if (auction.status !== 'bidding') {
      res.status(400).json({ message: 'L\'asta deve essere nello stato "bidding" per essere chiusa' });
      return;
    }

    // Recupera il bid più alto
    const topBid = await Bid.findOne({
      where: { auctionId },
      order: [['amount', 'DESC'], ['createdAt', 'ASC']],
    });

    if (!topBid) {
      res.status(400).json({ message: 'Nessuna offerta valida trovata' });
      return;
    }

    // Imposta la partecipazione del vincitore come "isWinner = true"
    const participation = await Participation.findOne({
      where: { auctionId, userId: topBid.userId },
    });

    if (participation) {
      participation.isWinner = true;
      await participation.save();
    }

    // Chiude l'asta
    auction.status = 'closed';
    await auction.save();

    // Notifica via WebSocket a tutti i client connessi
    broadcastToAuction(auctionId, {
      type: 'auction_closed',
      winnerId: topBid.userId,
      finalAmount: topBid.amount,
    });

    // Risposta al client
    res.status(200).json({
      message: 'Asta chiusa con successo',
      winnerId: topBid.userId,
      finalAmount: topBid.amount,
    });
  } catch (error) {
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

// Funzione per avviare un'asta
// Permette di avviare un'asta se ha almeno il numero minimo di partecipanti  
export const startAuction = async (req: any, res: any): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);

    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      res.status(404).json({ message: 'Asta non trovata' });
      return;
    }

    if (auction.status !== 'open') {
      res.status(400).json({ message: 'L\'asta non è nello stato "open"' });
      return;
    }

    const partecipanti = await Participation.count({
      where: { auctionId, isValid: true }
    });

    /*if (partecipanti < auction.minParticipants) {
      auction.status = 'cancelled';
      await auction.save();

      // Notifica ai client
      broadcastToAuction(auctionId, {
        type: 'auction_cancelled',
        reason: 'Numero partecipanti insufficiente'
      });

      res.status(200).json({ message: 'Asta annullata per partecipanti insufficienti' });
      return;
    }*/

    if (partecipanti < auction.minParticipants) {
      auction.status = 'closed';
      await auction.save();

      broadcastToAuction(auctionId, {
        type: 'auction_closed',
        reason: 'Partecipanti insufficienti',
      });

      res.status(200).json({
        message: 'Asta chiusa per partecipanti insufficienti',
      });
      return;
    }

    // Passa a bidding
    auction.status = 'bidding';
    await auction.save();

    broadcastToAuction(auctionId, {
      type: 'auction_started',
      auctionId: auction.id,
    });

    res.status(200).json({ message: 'Asta avviata con successo' });

  } catch (error) {
    console.error('Errore avvio asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

