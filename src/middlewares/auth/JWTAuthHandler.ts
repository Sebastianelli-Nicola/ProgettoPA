/**
 * @fileoverview Questo file definisce il middleware per l'autenticazione JWT.
 * 
 * Utilizza la classe BaseHandler per gestire la richiesta e verifica il token JWT.
 * Il middleware estrae il token dall'header Authorization, lo verifica e decodifica,
 * e aggiunge le informazioni dell'utente alla richiesta.
 * Se il token non è presente o non è valido, restituisce un errore
 * Se il token è valido, continua nella catena di handler chiamando il metodo `handle` della classe BaseHandler.  
 * 
 */
import { BaseHandler } from '../BaseHandler'; // importa la tua classe BaseHandler
import jwt from 'jsonwebtoken';
import { ErrorFactory, ErrorType } from '../../factory/errorFactory';
import { Request, Response, NextFunction } from 'express';

/**
 * Interfaccia per la richiesta autenticata.
 * Estende l'interfaccia Request di Express per includere le informazioni dell'utente.
 */
export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

/**
 * Classe che gestisce l'autenticazione JWT.
 * Estende la classe BaseHandler per implementare il metodo `handle`.
 * Il metodo `handle` verifica la presenza del token JWT nell'header Authorization,
 * lo decodifica e aggiunge le informazioni dell'utente alla richiesta.
 */
export class JWTAuthHandler extends BaseHandler {

  /**
   * Gestisce la richiesta di autenticazione JWT.
   * Verifica il token JWT e aggiunge le informazioni dell'utente alla richiesta.
   * Se il token non è presente o non è valido, restituisce un errore.
   * 
   * @param req - La richiesta HTTP
   * @param res - La risposta HTTP
   * @param next - La funzione per passare al prossimo middleware
   */
  public handle(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization; // ottiene l'header Authorization

    if (!authHeader) {
      return next(ErrorFactory.createError(ErrorType.MissingAuthHeader));
    }

    const token = authHeader.split(' ')[1]; // estrae il token dall'header

    if (!token) {
      return next(ErrorFactory.createError(ErrorType.MissingToken));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string }; // verifica e decodifica il token
      (req as AuthRequest).user = decoded; // aggiunge le informazioni dell'utente alla richiesta
      super.handle(req, res, next); // continua nella catena
    } catch {
      return next(ErrorFactory.createError(ErrorType.InvalidToken));
    }
  }
}
