/**
 * @fileoverview Controller per la gestione dell'autenticazione utente.
 * 
 * Fornisce le funzioni per la registrazione e il login degli utenti.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */

import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import HTTPStatus from 'http-status-codes';

const userService = new UserService();


/**
 * Registra un nuovo utente.
 * Riceve i dati dal body della richiesta, li passa al servizio e restituisce il risultato.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userService.register(req.body);
    res.status(HTTPStatus.CREATED).json(result);     // Utente creato con successo
  } catch (error: any) {
    next(error);
  }
};


/**
 * Effettua il login di un utente.
 * Riceve email e password dal body, li passa al servizio e restituisce il risultato (token o dati utente).
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ErrorFactory.createError(ErrorType.MissingCredentials));
    }
    
    const result = await userService.login(email, password);
    res.status(HTTPStatus.OK).json(result); // Login riuscito, restituisce token/dati utente
  } catch (error: any) {
    console.error('Errore login:', error);
    next(error);
  }
};



