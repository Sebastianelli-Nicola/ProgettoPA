// src/controllers/auctionController.ts
import { Request, Response } from 'express';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { Wallet } from '../models/Wallet'; 

// Estendi l'interfaccia Request per includere 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

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
