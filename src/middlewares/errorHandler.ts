import { Request, Response, NextFunction } from 'express';

// Questo middleware gestisce gli errori generati durante l'elaborazione delle richieste.

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Errore:', err.message);

  res.status(500).json({
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
