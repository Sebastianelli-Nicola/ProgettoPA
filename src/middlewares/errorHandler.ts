/**
 * @fileoverview Middleware globale per la gestione degli errori in Express.
 * 
 * Questo middleware intercetta gli errori generati durante l'elaborazione delle richieste
 * e restituisce una risposta JSON con i dettagli dell'errore.
 * Gestisce sia errori personalizzati (estensione di ApplicationError)
 * che errori generici non gestiti.
 * 
 */

import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../factory/errorFactory'; // Assicurati che il path sia corretto

/**
 * Middleware per la gestione degli errori in Express.
 * Intercetta gli errori e restituisce una risposta JSON con i dettagli dell'errore.
 *
 * @param err - L'errore da gestire
 * @param req - La richiesta HTTP
 * @param res - La risposta HTTP
 * @param next - La funzione per passare al prossimo middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se è un errore gestito dalla factory
  if (err instanceof ApplicationError) {
    // Imposta lo status dell'errore se non è già definito
    res.status(err.status).json({
      error: {
        name: err.name,
        message: err.message, 
      },
    });
    return;
  }

  // Errore generico o sconosciuto
  console.error('Errore non gestito:', err);

  // Restituisce un errore generico
  res.status(500).json({
    error: {
      name: 'InternalServerError',
      message: 'Errore interno del server',
    },
  });
};
