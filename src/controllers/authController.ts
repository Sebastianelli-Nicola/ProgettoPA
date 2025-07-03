/**
 * @fileoverview Controller per la gestione dell'autenticazione utente.
 * 
 * Fornisce le funzioni per la registrazione e il login degli utenti.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */

import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();


/**
 * Registra un nuovo utente.
 * Riceve i dati dal body della richiesta, li passa al servizio e restituisce il risultato.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);     // Utente creato con successo
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Errore interno del server' });
  }
};


/**
 * Effettua il login di un utente.
 * Riceve email e password dal body, li passa al servizio e restituisce il risultato (token o dati utente).
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);     // Login riuscito, restituisce token/dati utente
  } catch (error: any) {
    console.error('Errore login:', error);
    res.status(error.status || 500).json({ message: error.message || 'Errore interno del server' });
  }
};



