/**
 * @fileoverview Questo file definisce l'interfaccia Handler per i middleware.
 * 
 * L'interfaccia Handler rappresenta un singolo handler nella catena di responsabilità.
 * I handler possono essere concatenati tra loro per formare una catena di responsabilità,
 * dove ogni handler può decidere se gestire la richiesta o passarla al successivo nella catena.
 * L'interfaccia include un metodo `setNext` per impostare il prossimo handler nella catena
 * e un metodo `handle` per gestire la richiesta.
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Interfaccia per i middleware che definisce i metodi per la gestione delle richieste.
 * I middleware possono essere concatenati tra loro per formare una catena di responsabilità.
 */
export interface Handler {
  setNext(handler: Handler): Handler; // Imposta il prossimo handler nella catena
  handle(req: Request, res: Response, next: NextFunction): void; // Gestisce la richiesta 
}
