/**
 * @fileoverview Questo file definisce le rotte per la gestione delle statistiche delle aste.
 */

import { Router } from 'express';
import { getAuctionStats, getUserExpenses } from '../controllers/statsController';
import { getAuctionHistory } from '../controllers/statsController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = Router();

/** 
 * Rotta GET per ottenere le statistiche delle aste
 * Questa rotta consente agli utenti autenticati con ruolo 'admin' di visualizzare le statistiche delle aste.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 */
router.get('/', authMiddlewareHandler.authWithRoles(['admin']), getAuctionStats);

/** 
 * Rotta GET per ottenere le spese dell'utente
 * Questa rotta consente agli utenti autenticati con ruolo 'bid-participant' di visualizzare le proprie spese.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 */
router.get('/expenses', authMiddlewareHandler.authWithRoles(['bid-participant']), getUserExpenses);

/**
 * Rotta GET per ottenere lo storico delle aste
 * Questa rotta consente agli utenti autenticati con ruolo 'bid-participant' di visualizzare lo storico delle aste.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 */
router.get('/history', authMiddlewareHandler.authWithRoles(['bid-participant']), getAuctionHistory);

export default router;
