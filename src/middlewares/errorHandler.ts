import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../factory/errorFactory'; // Assicurati che il path sia corretto

/**
 * Middleware globale per la gestione degli errori.
 * Gestisce sia errori personalizzati (estensione di ApplicationError)
 * che errori generici non gestiti.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se è un errore gestito dalla factory
  if (err instanceof ApplicationError) {
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

  res.status(500).json({
    error: {
      name: 'InternalServerError',
      message: 'Errore interno del server',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
  });
};
