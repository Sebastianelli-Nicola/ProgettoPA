import { AuthRequest } from '../middlewares/authMiddleware';
import { Auction } from '../models/Auction';
import { Request, Response } from 'express';

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

