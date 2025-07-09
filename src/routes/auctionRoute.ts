/**
 * @fileoverview Questo file definisce le rotte per la gestione delle aste.
 * Le rotte consentono di creare, ottenere, unirsi, chiudere, aggiornare lo status e avviare aste.
 */

import { Router } from 'express';
import { createAuction, getAuctions, joinAuction} from '../controllers/auctionController';
import { updateAuctionStatus , startAuction, closeAuction} from '../controllers/auctionController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler';    

const router = Router();

/**
 * Rotta POST per creare un'asta
 * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono creare un'asta
 * Richiede autenticazione JWT
 */
router.post('/', authMiddlewareHandler.authWithRoles(['bid-creator']), createAuction);

/**
 * Rotta GET per ottenere le aste
 * Permette di filtrare le aste in base al parametro status
 * Non richiede autenticazione
 */
router.get('/', getAuctions);

/**
 * Rotta POST per unirsi a un'asta
 * Solo gli utenti con ruolo 'bid-participant' possono unirsi a un'asta
 * Richiede autenticazione JWT
 */
router.post('/join', authMiddlewareHandler.authWithRoles(['bid-participant']), joinAuction);

/**
 * Rotta POST per chiudere un'asta
 * Solo gli utenti con ruolo 'admin' o 'bid-creator' possono chiudere un'asta
 * Richiede autenticazione JWT
 * @param {string} id - ID dell'asta da chiudere
 */
router.post('/close', authMiddlewareHandler.authWithRoles(['admin', 'bid-creator']), closeAuction);

/**
 * Rotta PATCH per aggiornare lo status di un'asta da created a open
 * Solo gli utenti con ruolo 'bid-creator' possono aggiornare lo status di un'asta
 * Richiede autenticazione JWT
 * @param {string} id - ID dell'asta da aggiornare
 */
router.patch('/', authMiddlewareHandler.authWithRoles(['bid-creator']), updateAuctionStatus);

/**
 * Rotta POST per avviare un'asta
 * Solo gli utenti con ruolo 'admin' possono avviare un'asta
 * Richiede autenticazione JWT
 * @param {string} id - ID dell'asta da avviare
 */
router.post('/start', authMiddlewareHandler.authWithRoles(['bid-creator']), startAuction);


export default router;