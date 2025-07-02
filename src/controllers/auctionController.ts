import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { broadcastToAuction } from '../websocket/websockethandlers';
import PDFDocument from 'pdfkit';
import { AuctionService } from '../services/auctionService';

const auctionService = new AuctionService();

// Funzione per creare un'asta
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

    const newAuction = await auctionService.createAuction({
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
export const getAuctions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const auctions = await auctionService.getAuctions(typeof status === 'string' ? status : undefined);
    res.json(auctions);
  } catch (error) {
    console.error('Errore lettura aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// Funzione per unirsi a un'asta
export const joinAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const auctionId = req.body.auctionId;
    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }
    const result = await auctionService.joinAuction(userId, auctionId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// Funzione per chiudere un'asta
export const closeAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.closeAuction(auctionId);

    broadcastToAuction(auctionId, {
      type: 'auction_closed',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });

    res.status(200).json({
      message: 'Asta chiusa con successo',
      winnerId: result.winnerId,
      finalAmount: result.finalAmount,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Funzione per aggiornare lo stato di un'asta
export const updateAuctionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const { status } = req.body;
    const auction = await auctionService.updateStatus(auctionId, status);
    res.status(200).json({ message: 'Stato dell\'asta aggiornato con successo', auction });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Funzione per avviare un'asta
export const startAuction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const auctionId = parseInt(req.params.id);
    const result = await auctionService.startAuction(auctionId);

    if (result.closed) {
      broadcastToAuction(auctionId, {
        type: 'auction_closed',
        reason: result.reason,
      });
      res.status(200).json({ message: 'Asta chiusa per partecipanti insufficienti' });
    } else if (result.started) {
      broadcastToAuction(auctionId, {
        type: 'auction_started',
        auctionId,
      });
      res.status(200).json({ message: 'Asta avviata' });
    }
  } catch (err: any) {
    console.error('Errore startAuction:', err);
    res.status(err.status || 500).json({ message: err.message || 'Errore interno' });
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

    const history = await auctionService.getAuctionHistory(
      userId,
      from ? new Date(from as string) : undefined,
      to ? new Date(to as string) : undefined
    );

    /*if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="auction-history.pdf"');
      doc.text('Storico aste');
      history.forEach(item => {
        doc.text(`Asta: ${item.id} | Stato: ${item.status} | Vincitore: ${item.isWinner ? 'Sì' : 'No'}`);
      });
      doc.end();
      doc.pipe(res);
    } else {
      res.json({ history });
    }*/
  } catch (error) {
    console.error('Errore recupero storico aste:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};


// import { Request, Response } from 'express';
// import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
// import { Auction } from '../models/Auction';
// import { Participation } from '../models/Participation';
// import { Wallet } from '../models/Wallet'; 
// import { Bid } from '../models/Bid';
// import { broadcastToAuction } from '../websocket/websockethandlers';
// import PDFDocument from 'pdfkit';
// import { AuctionDAO } from '../dao/auctionDAO'

// // Estendi l'interfaccia Request per includere 'user'
// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//     }
//   }
// }

// // Funzione per creare un'asta
// // Permette di creare un'asta con i seguenti campi: 
// // title, minParticipants, maxParticipants, entryFee, maxPrice, minIncrement, bidsPerParticipant, startTime, endTime, relaunchTime
// export const createAuction = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const {
//       title,
//       minParticipants,
//       maxParticipants,
//       entryFee,
//       maxPrice,
//       minIncrement,
//       bidsPerParticipant,
//       startTime,
//       endTime,
//       relaunchTime,
//       status
//     } = req.body;

//     if (
//       !title || !minParticipants || !maxParticipants ||
//       !entryFee || !maxPrice || !minIncrement ||
//       !bidsPerParticipant || !startTime || !endTime || !relaunchTime
//     ) {
//       res.status(400).json({ message: 'Dati mancanti o incompleti' });
//       return;
//     }

//     const auctionDAO = new AuctionDAO();
//     const newAuction = await auctionDAO.create({
//       title,
//       minParticipants,
//       maxParticipants,
//       entryFee,
//       maxPrice,
//       minIncrement,
//       bidsPerParticipant,
//       startTime,
//       endTime,
//       relaunchTime,
//       status,
//     });

//     res.status(201).json({ message: 'Asta creata con successo', auction: newAuction });
//   } catch (error) {
//     console.error('Errore creazione asta:', error);
//     res.status(500).json({ message: 'Errore interno del server' });
//   }
// };

// // Funzione per ottenere le aste
// // Permette di filtrare per status (created, open, bidding, closed)
// export const getAuctions = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { status } = req.query;
//     const auctionDAO = new AuctionDAO();
//     const auctions = await auctionDAO.getAuctions(typeof status === 'string' ? status : undefined);

//     res.json(auctions);
//   } catch (error) {
//     console.error('Errore lettura aste:', error);
//     res.status(500).json({ message: 'Errore interno del server' });
//   }
// };

// /**
//  * Funzione per unirsi a un'asta  
//  * Permette agli utenti di unirsi a un'asta aperta
//  * Richiede autenticazione JWT
//  * Controlla se l'asta è aperta, se il numero massimo di partecipanti è stato raggiunto,
//  * se l'utente ha un wallet valido e se ha abbastanza credito
//  * Se l'utente è già iscritto, restituisce un errore
//  * Se tutto va a buon fine, registra la partecipazione e aggiorna il saldo del wallet
//  * @param req 
//  * @param res 
//  * @returns 
//  */
// export const joinAuction = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = (req.user as any).id;
//     const auctionId = req.body.auctionId;

//     const auctionDAO = new AuctionDAO();
//     const result = await auctionDAO.joinAuction(userId, auctionId);
//     res.status(200).json(result);
//   } catch (err: any) {
//     if (err.status) {
//       res.status(err.status).json({ message: err.message });
//     } else {
//       console.error('Errore iscrizione:', err);
//       res.status(500).json({ message: 'Errore interno' });
//     }
//   }
// };



// /**
//  * Funzione per chiudere un'asta
//  * Permette di chiudere un'asta e selezionare il vincitore  
//  * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono chiudere un'asta
//  * Richiede autenticazione JWT
//  * Questa funzione chiude l'asta, seleziona il vincitore e rimborsa gli altri partecipanti
//  * Se l'asta è già chiusa o non è nello stato 'bidding', restituisce un errore
//  * Se non ci sono offerte valide, restituisce un errore 
//  * @param req 
//  * @param res 
//  * @returns 
//  */
// export const closeAuction = async (req: AuthRequest, res: Response): Promise<void> => {
//    try {
//     const auctionId = parseInt(req.params.id);
//     const auctionDAO = new AuctionDAO();
//     const result = await auctionDAO.closeAuction(auctionId);

//     // Notifica ai client che l'asta è chiusa e il vincitore
//     broadcastToAuction(auctionId, {
//       type: 'auction_closed',
//       winnerId: result.winnerId,
//       finalAmount: result.finalAmount,
//     });

//     res.status(200).json({
//       message: 'Asta chiusa con successo',
//       winnerId: result.winnerId,
//       finalAmount: result.finalAmount,
//     });
//   } catch (error: any) {
//     if (error.status) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       console.error('Errore chiusura asta:', error);
//       res.status(500).json({ message: 'Errore interno del server' });
//     }
//   }
// };



// // Funzione per aggiornare lo stato di un'asta
// // Permette di aggiornare lo stato di un'asta (created, open, bidding, closed)
// // Solo gli utenti con ruolo 'admin' o 'bid-creator' possono aggiornare lo stato di un'asta
// // Richiede autenticazione JWT
// export const updateAuctionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const auctionId = parseInt(req.params.id);
//     const { status } = req.body;

//   //   
  
//   const auctionDAO = new AuctionDAO();
//   const auction = await auctionDAO.updateStatus(auctionId, status);
//   res.status(200).json({ message: 'Stato dell\'asta aggiornato con successo', auction });
//   } catch (error: any) {
//     if (error.status) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       console.error('Errore aggiornamento stato asta:', error);
//       res.status(500).json({ message: 'Errore interno del server' });
//     }
//   }
// };


// /**
//  * Funzione per avviare un'asta
//  * Permette di avviare un'asta se ci sono abbastanza partecipanti
//  * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono avviare un'asta
//  * Richiede autenticazione JWT
//  * Controlla se l'asta è nello stato 'open'
//  * Se l'asta ha meno partecipanti del minimo richiesto, la chiude e notifica i client
//  * Se l'asta ha abbastanza partecipanti, la avvia e notifica i client
//  * Se l'asta non esiste o non è nello stato 'open', restituisce un errore
//  * @param req 
//  * @param res 
//  * @returns 
//  */
// export const startAuction = async (req: any, res: any): Promise<void> => {
//   try {
//     const auctionId = parseInt(req.params.id);
//     const auctionDAO = new AuctionDAO();
//     const result = await auctionDAO.startAuction(auctionId);

//     if (result.closed) {
//       broadcastToAuction(auctionId, {
//         type: 'auction_closed',
//         reason: result.reason,
//       });
//       res.status(200).json({ message: 'Asta chiusa per partecipanti insufficienti' });
//     } else if (result.started) {
//       broadcastToAuction(auctionId, {
//         type: 'auction_started',
//         auctionId,
//       });
//       res.status(200).json({ message: 'Asta avviata' });
//     }
//   } catch (err: any) {
//     console.error('Errore startAuction:', err);
//     res.status(err.status || 500).json({ message: err.message || 'Errore interno' });
//   }
// };


// /**
//  * Funzione per recuperare lo storico delle aste di un utente
//  * Permette di recuperare lo storico delle aste a cui l'utente ha partecipato
//  * Richiede autenticazione JWT
//  * Controlla se l'utente è autenticato
//  *
//  * @param req 
//  * @param res 
//  * @returns 
//  */
// export const getAuctionHistory = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId = req.user.id;
//         const { from, to, format } = req.query;

//          if (!userId) {
//            res.status(401).json({ message: 'Utente non autenticato' });
//            return;
//          }

//          //Validazione date
//          if (from && isNaN(Date.parse(from as string))) {
//            res.status(400).json({ message: 'Parametro "from" non è una data valida' });
//            return;
//          }
//          if (to && isNaN(Date.parse(to as string))) {
//            res.status(400).json({ message: 'Parametro "to" non è una data valida' });
//            return;
//      }

//         const auctionDAO = new AuctionDAO();
//         const history = await auctionDAO.getAuctionHistory(userId, from ? new Date(from as string) : undefined, to ? new Date(to as string) : undefined);

//         if (format === 'pdf') {
//             // Esporta in PDF
//             const doc = new PDFDocument();
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', 'attachment; filename="auction-history.pdf"');
//             doc.text('Storico aste');
//             history.forEach(item => {
//                 doc.text(`Asta: ${item.auctionId} | Stato: ${item.status} | Vincitore: ${item.isWinner ? 'Sì' : 'No'}`);
//             });
//             doc.end();
//             doc.pipe(res);
//         } else {
//             // Esporta in JSON
//             res.json({ history });
//         }
//     } catch (error) {
//        console.error('Errore recupero storico aste:', error);
//        res.status(500).json({ message: 'Errore interno del server' });  
//      }
// };


