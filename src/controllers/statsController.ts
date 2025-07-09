/**
 * @fileoverview Controller per la gestione delle statistiche e dello storico delle aste.
 * 
 * Fornisce funzioni per ottenere statistiche sulle aste, spese utente e storico aste (anche in PDF).
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */

import { Request, Response, NextFunction} from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { StatsService } from '../services/statsService';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import HTTPStatus from 'http-status-codes';

const statsService = new StatsService();


/**
 * Restituisce le statistiche sulle aste in un intervallo di date.
 * Accetta parametri di query 'from' e 'to' per filtrare il periodo.
 */
export const getAuctionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.query;

    if (from && isNaN(Date.parse(from as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidFromDate));
    }
    if (to && isNaN(Date.parse(to as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidToDate));
    }

    const stats = await statsService.getAuctionStats(from as string, to as string);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};


/**
 * Restituisce le spese di un utente in un intervallo di date.
 * Richiede autenticazione e parametri di query opzionali 'from' e 'to'.
 */
export const getUserExpenses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { from, to } = req.query;

    // Verifica che l'utente sia autenticato
    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Verifica validità delle date
    if (from && isNaN(Date.parse(from as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidFromDate));
    }
    if (to && isNaN(Date.parse(to as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidToDate));
    }

    const expenses = await statsService.getUserExpenses(userId, new Date(from as string), new Date(to as string));
    res.status(HTTPStatus.OK).json(expenses);
  } catch (error) {
    next(error);
  }
};

/**
 * Restituisce lo storico delle aste di un utente, sia vinte che perse.
 * Supporta il formato JSON (default) o PDF (se richiesto tramite query 'format=pdf').
 */
export const getAuctionHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { from, to, format } = req.query;

    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    if (from && isNaN(Date.parse(from as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidFromDate));
    }
    if (to && isNaN(Date.parse(to as string))) {
      return next(ErrorFactory.createError(ErrorType.InvalidToDate));
    }

    const history = await statsService.getAuctionHistory(
      userId,
      from ? new Date(from as string) : undefined,
      to ? new Date(to as string) : undefined
    );


    // Normalizza il parametro format per gestire PDF o JSON
    const formatParam = Array.isArray(format) ? format[0] : format;
    const formatNormalized = typeof formatParam === 'string' ? formatParam.trim().toLowerCase() : '';

    if (formatNormalized === 'pdf') {
      // Delega la generazione del PDF al servizio
      const doc = statsService.generateAuctionHistoryPDF(history);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="auction-history.pdf"');
      doc.pipe(res);
      doc.end();
    } else {
      // Default: restituisce lo storico in formato JSON
      res.json({
        won: history.won,
        lost: history.lost
      });
    }
  } catch (error) {
    next(error);
  }
};

