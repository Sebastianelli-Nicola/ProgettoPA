/**
 *  @fileoverview Questo file definisce le rotte per la gestione delle offerte sulle aste.
 */

import { Router } from 'express';
import { placeBid } from '../controllers/bidController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = Router(); //

/**
 * Rotta POST per effettuare un'offerta su un'asta
 * Questa rotta consente agli utenti autenticati con ruolo 'bid-participant' di effettuare un'offerta su un'asta.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 * @param {string} id - ID dell'asta su cui si vuole fare un'offerta
 * @returns {object} - Dettagli dell'offerta effettuata
 */
router.post('/:id/bid', authMiddlewareHandler.authWithRoles(['bid-participant']), placeBid);

export default router;
