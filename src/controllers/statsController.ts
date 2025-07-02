import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { StatsService } from '../services/statsService';
import PDFDocument from 'pdfkit';

const statsService = new StatsService();

export const getAuctionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const stats = await statsService.getAuctionStats(from as string, to as string);
    res.json(stats);
  } catch (error) {
    console.error('Errore durante il recupero delle statistiche delle aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

export const getUserExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { from, to } = req.query;

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

    const expenses = await statsService.getUserExpenses(userId, new Date(from as string), new Date(to as string));
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Errore nel calcolo delle spese:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// Funzione per recuperare lo storico delle aste di un utente
export const getAuctionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { from, to, format } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
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

    const history = await statsService.getAuctionHistory(
      userId,
      from ? new Date(from as string) : undefined,
      to ? new Date(to as string) : undefined
    );

    console.log('FORMAT:', format);

    const formatParam = Array.isArray(format) ? format[0] : format;
    const formatNormalized = typeof formatParam === 'string' ? formatParam.trim().toLowerCase() : '';

    if (formatNormalized === 'pdf') {
      console.log('Generazione PDF per lo storico aste');
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="auction-history.pdf"');
      doc.pipe(res);
      doc.text('Storico aste aggiudicate:', { underline: true });
      if (history.won.length === 0) doc.text('Nessuna');
      history.won.forEach(item => {
        doc.text(`Asta: ${item.id} | Titolo: ${item.title} | Stato: ${item.status} | Vincitore: Sì`);
      });
      doc.moveDown();
      doc.text('Storico aste NON aggiudicate:', { underline: true });
      if (history.lost.length === 0) doc.text('Nessuna');
      history.lost.forEach(item => {
        doc.text(`Asta: ${item.id} | Titolo: ${item.title} | Stato: ${item.status} | Vincitore: No`);
      });
      doc.end();
    } else {
      // Default: JSON
      res.json({
        won: history.won,
        lost: history.lost
      });
    }
  } catch (error) {
    console.error('Errore recupero storico aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// import { Request, Response } from 'express';
// import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
// import { Auction } from '../models/Auction';
// import { Participation } from '../models/Participation';
// import { Bid } from '../models/Bid';
// import { Op } from 'sequelize';
// import { StatsDAO } from '../dao/statsDAO'; 

// export const getAuctionStats = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { from, to } = req.query;
//     const statsDAO = new StatsDAO();
//     const stats = await statsDAO.getAuctionStats(from as string, to as string);
//     res.json(stats);
//   } catch (error) {
//     console.error('Errore durante il recupero delle statistiche delle aste:', error);
//     res.status(500).json({ message: 'Errore interno del server' });
//   }
// } 

// /**
//  * Calcola le spese di un utente (partecipazioni e vincite) in un intervallo temporale.
//  * Richiede autenticazione e ruolo 'bid-participant'.
//  */
// export const getUserExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.id;
//     //const role = req.user?.role;
//     const { from, to } = req.query;

//     // Validazione date
//     //const dateFilter: any = {};
//     if (!userId) {
//       res.status(400).json({ message: 'ID utente non valido o mancante' });
//       return;
//     }
//     if (from && isNaN(Date.parse(from as string))) {
//       res.status(400).json({ message: 'Parametro "from" non è una data valida' });
//       return;
//     }
//     if (to && isNaN(Date.parse(to as string))) {
//       res.status(400).json({ message: 'Parametro "to" non è una data valida' });
//       return;
//     }
    
//     const statsDAO = new StatsDAO();
//     const expenses = await statsDAO.getUserExpenses(userId, from as string, to as string);

//     res.status(200).json(expenses);
//   } catch (error) {
//     console.error('Errore nel calcolo delle spese:', error);
//     res.status(500).json({ message: 'Errore interno del server' });
//   }
// };