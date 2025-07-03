/**
 * @fileoverview Questo file definisce i middleware per l'autenticazione e l'autorizzazione degli utenti.
 * Utilizza una chain di handler per gestire l'autenticazione JWT e i ruoli degli utenti.
 * I middleware sono utilizzati per proteggere le rotte e garantire che solo gli utenti autorizzati possano accedere a determinate risorse. 
 * La classe `authMiddlewareHandler` fornisce metodi per creare middleware basati su JWT e ruoli specifici.
 * La funzione `composeHandler` converte la chain di handler in un middleware Express compatibile.
 * 
 */

import { Handler } from '../Handler';
import { JWTAuthHandler } from './JWTAuthHandler';
import { RoleHandler } from './RoleHandler';
import { Request, Response, NextFunction } from 'express';

/**
 * Comprime la chain di handler in un middleware Express compatibile.
 * @param firstHandler Il primo handler della chain
 * @returns Un middleware Express che gestisce la richiesta
 */
const composeHandler = (firstHandler: Handler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    firstHandler.handle(req, res, next); // Inizia la catena di handler
  };
};

/**
 * Classe che gestisce i middleware di autenticazione e autorizzazione.
 * Fornisce metodi per creare middleware basati su JWT e ruoli specifici.
 */
export class authMiddlewareHandler {
  /**
   * Restituisce un middleware Express basato su JWT + Role handler
   * @param allowedRoles Ruoli autorizzati
   */
  static authWithRoles(allowedRoles: string[]) {
    const jwt = new JWTAuthHandler(); // Crea un handler per l'autenticazione JWT
    const role = new RoleHandler(allowedRoles); // Crea un handler per la gestione dei ruoli
    jwt.setNext(role); // Imposta il prossimo handler nella chain
    return composeHandler(jwt); // Comprime la chain in un middleware Express
  }

  /**
   * Restituisce solo un middleware per autenticazione JWT
   */
  static jwtOnly() {
    const jwt = new JWTAuthHandler(); // Crea un handler per l'autenticazione JWT
    return composeHandler(jwt); // Comprime la chain in un middleware Express
  }
  
}