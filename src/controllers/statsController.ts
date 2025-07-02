import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { Auction } from '../models/Auction';
import { Participation } from '../models/Participation';
import { Bid } from '../models/Bid';
import { Op } from 'sequelize';
import { StatsDAO } from '../dao/statsDAO'; 

export const getAuctionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const statsDAO = new StatsDAO();
    const stats = await statsDAO.getAuctionStats(from as string, to as string);
    res.json(stats);
  } catch (error) {
    console.error('Errore durante il recupero delle statistiche delle aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
} 

/**
 * Calcola le spese di un utente (partecipazioni e vincite) in un intervallo temporale.
 * Richiede autenticazione e ruolo 'bid-participant'.
 */
export const getUserExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    //const role = req.user?.role;
    const { from, to } = req.query;

    // Validazione date
    //const dateFilter: any = {};
    if (!userId) {
      res.status(400).json({ message: 'ID utente non valido o mancante' });
      return;
    }
    if (from && isNaN(Date.parse(from as string))) {
      res.status(400).json({ message: 'Parametro "from" non è una data valida' });
      return;
    }
    if (to && isNaN(Date.parse(to as string))) {
      res.status(400).json({ message: 'Parametro "to" non è una data valida' });
      return;
    }
    
    const statsDAO = new StatsDAO();
    const expenses = await statsDAO.getUserExpenses(userId, from as string, to as string);

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Errore nel calcolo delle spese:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};