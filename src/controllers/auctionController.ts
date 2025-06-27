// src/controllers/auctionController.ts
import { Request, Response } from 'express';
import { Auction } from '../models/Auction';

export const createAuction = async (req: Request, res: Response): Promise<void> => {
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
      relaunchTime
    } = req.body;

    // Validazione base (puoi migliorare con zod o Joi)
    if (
      !title || !minParticipants || !maxParticipants ||
      !entryFee || !maxPrice || !minIncrement || !bidsPerParticipant ||
      !startTime || !endTime || !relaunchTime
    ) {
      res.status(400).json({ message: 'Dati incompleti' });
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
      status: 'created', // valore default, ma puoi sovrascriverlo
    });

    res.status(201).json({ message: 'Asta creata con successo', auction: newAuction });
  } catch (error) {
    console.error('Errore durante la creazione asta:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};
