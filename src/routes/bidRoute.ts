/**
 *  @fileoverview Questo file definisce le rotte per la gestione delle offerte sulle aste.
 */

import { Router } from 'express';
import { placeBid, getBidsForAuction} from '../controllers/bidController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = Router(); //

/**
 * Rotta POST per effettuare un'offerta su un'asta
 * Questa rotta consente agli utenti autenticati con ruolo 'bid-participant' di effettuare un'offerta su un'asta.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 * @param {string} id - ID dell'asta su cui si vuole fare un'offerta
 * @returns {object} - Dettagli dell'offerta effettuata
 */
router.post('/', authMiddlewareHandler.authWithRoles(['bid-participant']), placeBid);

/**
 * Rotta GET per visualizzare l'elenco dei rilanci di un'asta.
 * Accessibile solo ai partecipanti o al creatore, solo se l'asta è in fase "bidding".
 */
router.get('/all', authMiddlewareHandler.authWithRoles(['bid-participant', 'bid-creator']), getBidsForAuction);

export default router;
