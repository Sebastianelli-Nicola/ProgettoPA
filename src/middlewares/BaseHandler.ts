/**
 * @fileoverview Classe base per la gestione dei middleware.
 * 
 * Questa classe implementa il pattern Chain of Responsibility per la gestione dei middleware in Express.
 * Permette di concatenare più handler e di passare la richiesta attraverso di essi.
 * Se un handler non gestisce la richiesta, passa al successivo nella catena. 
 */

import { Request, Response, NextFunction } from 'express';
import { Handler } from './Handler';

/**
 * Interfaccia per i middleware che gestiscono le richieste.
 * Definisce il metodo `handle` che deve essere implementato da ogni handler.
 */
export abstract class BaseHandler implements Handler {
  private nextHandler: Handler | null = null; // Prossimo handler nella catena

  /**
   * Imposta il prossimo handler nella catena.
   * @param handler Il prossimo handler da impostare.
   * @returns Il prossimo handler.
   */
  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Gestisce la richiesta passando al prossimo handler nella catena.
   * @param req - La richiesta HTTP
   * @param res - La risposta HTTP
   * @param next - La funzione per passare al prossimo middleware
   */
  public handle(req: Request, res: Response, next: NextFunction): void {
    if (this.nextHandler) {
      this.nextHandler.handle(req, res, next); // Passa la richiesta al prossimo handler nella catena
    } else {
      next(); // Se non ci sono altri handler, chiama next per passare al prossimo middleware
    }
  }
}
