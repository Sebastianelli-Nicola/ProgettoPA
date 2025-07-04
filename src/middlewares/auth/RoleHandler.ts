/**
 * @fileoverview Questo file definisce il middleware per la gestione dei ruoli degli utenti.
 * 
 * Utilizza la classe BaseHandler per gestire la richiesta e verifica se l'utente ha il ruolo autorizzato.
 * Il middleware controlla se l'utente è autenticato e se il suo ruolo è tra quelli autorizzati.
 * Se l'utente non è autenticato o il suo ruolo non è autorizzato, restituisce un errore.
 * Se l'utente è autenticato e il suo ruolo è autorizzato, continua nella catena di handler chiamando 
 * il metodo `handle` della classe BaseHandler.    
 * 
 */

import { BaseHandler } from '../BaseHandler'; // importa la tua classe BaseHandler
import { Request, Response, NextFunction } from 'express';
import { ErrorFactory, ErrorType } from '../../factory/errorFactory';

/**
 * Interfaccia per la richiesta autenticata.
 * Estende l'interfaccia Request di Express per includere le informazioni dell'utente.
 */
export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

/**
 * Classe che gestisce i permessi basati sui ruoli degli utenti.
 * Estende la classe BaseHandler per implementare il metodo `handle`.
 * Il metodo `handle` verifica se l'utente è autenticato e se il suo ruolo è tra quelli autorizzati.
 */
export class RoleHandler extends BaseHandler {
  // Lista dei ruoli autorizzati
  constructor(private allowedRoles: string[]) {
    super();
  }

  /**
   * Gestisce la richiesta di autorizzazione basata sui ruoli.
   * Verifica se l'utente è autenticato e se il suo ruolo è tra quelli autorizzati.
   * Se l'utente non è autenticato o il suo ruolo non è autorizzato, restituisce un errore.
   * 
   * @param req - La richiesta HTTP
   * @param res - La risposta HTTP
   * @param next - La funzione per passare al prossimo middleware
   */
  public handle(req: AuthRequest, res: Response, next: NextFunction): void {
    
    // Verifica se l'utente è autenticato 
    if (!req.user) {
      return next(ErrorFactory.createError(ErrorType.Authentication));
    }

    // Verifica se il ruolo dell'utente è tra quelli autorizzati
    if (!this.allowedRoles.includes(req.user.role)) {
      return next(ErrorFactory.createError(ErrorType.Authorization, 'Accesso negato. Ruolo non autorizzato'));
    }

    super.handle(req, res, next); // continua nella catena di handler
  }
}
