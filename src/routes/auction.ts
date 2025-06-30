import { Router } from 'express';
//import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { createAuction, getAuctions, joinAuction} from '../controllers/auctionController';
import { closeAuction, updateAuctionStatus , startAuction, getAuctionHistory } from '../controllers/auctionController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler';    

const router = Router();

// Route per creare un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono creare un'asta
// Richiede autenticazione JWT
//router.post('/', authenticateJWT, authorizeRoles('admin', 'bid-creator'), createAuction);
router.post(
  '/',
  authMiddlewareHandler.authWithRoles(['admin', 'bid-creator']),
  createAuction
);

// Route per ottenere le aste
// Permette di filtrare per status (created, open, bidding, closed)
router.get('/', getAuctions);
  
// Route per unirsi a un'asta
// Solo gli utenti con ruolo 'bid-participant' possono unirsi a un'asta
router.post(
  '/join',
  authMiddlewareHandler.authWithRoles(['bid-participant']),
  joinAuction
);

// Route per chiudere un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono chiudere un'asta
// Richiede autenticazione JWT
router.post('/:id/close', authMiddlewareHandler.authWithRoles(['admin', 'bid-creator']), closeAuction);

// Route per aggiornare lo status di un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono aggiornare lo status di un'asta
// Richiede autenticazione JWT
router.patch('/:id/status', authMiddlewareHandler.authWithRoles(['admin', 'bid-creator']), updateAuctionStatus);

// Route per avviare un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono avviare un'asta
// Richiede autenticazione JWT
router.post('/:id/start', authMiddlewareHandler.authWithRoles(['admin', 'bid-creator']), startAuction);

// Route per ottenere le aste chiuse
// Permette di filtrare per data di chiusura
// Richiede autenticazione JWT
router.get('/history', authMiddlewareHandler.authWithRoles(['bid-participant']), getAuctionHistory);

export default router;