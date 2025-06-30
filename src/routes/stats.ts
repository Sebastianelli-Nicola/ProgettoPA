import { Router } from 'express';
import { getAuctionStats, getUserExpenses } from '../controllers/statsController';
//import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = Router();

/** 
 * Rotta per ottenere le statistiche delle aste
 * Questa rotta consente agli utenti autenticati con ruolo 'admin' di visualizzare le statistiche delle aste.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 */
router.get('/', authMiddlewareHandler.authWithRoles(['admin']), getAuctionStats);

/** 
 * Rotta per ottenere le spese dell'utente
 * Questa rotta consente agli utenti autenticati con ruolo 'bid-participant' di visualizzare le proprie spese.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido e il ruolo dell'utente.
 */
router.get('/expenses', authMiddlewareHandler.authWithRoles(['bid-participant']), getUserExpenses);

export default router;
