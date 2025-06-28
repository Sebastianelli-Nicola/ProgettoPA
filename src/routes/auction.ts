import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { createAuction, getAuctions, joinAuction} from '../controllers/auctionController';
import { closeAuction, updateAuctionStatus } from '../controllers/auctionController';

const router = Router();

// Route per creare un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono creare un'asta
// Richiede autenticazione JWT
router.post('/', authenticateJWT, authorizeRoles('admin', 'bid-creator'), createAuction);

// Route per ottenere le aste
// Permette di filtrare per status (created, open, bidding, closed)
router.get('/', getAuctions);

// Route per unirsi a un'asta
// Solo gli utenti con ruolo 'bid-participant' possono unirsi a un'asta
router.post(
  '/join',
  authenticateJWT,
  authorizeRoles('bid-participant'),
  joinAuction
);

// Route per chiudere un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono chiudere un'asta
// Richiede autenticazione JWT
router.post(
  '/:id/close',
  authenticateJWT,
  authorizeRoles('admin', 'bid-creator'),
  closeAuction
);

// Route per aggiornare lo status di un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono aggiornare lo status di un'asta
// Richiede autenticazione JWT
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin', 'bid-creator'), updateAuctionStatus);


export default router;