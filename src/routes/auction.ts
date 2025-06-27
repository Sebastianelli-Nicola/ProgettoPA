import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { createAuction, getAuctions, joinAuction} from '../controllers/auctionController';


const router = Router();

// Route per creare un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono creare un'asta
// Richiede autenticazione JWT
router.post('/', authenticateJWT, authorizeRoles('admin', 'bid-creator'), createAuction);

// Route per ottenere le aste
// Permette di filtrare per status (created, open, bidding, closed)
router.get('/', getAuctions);

// Route per creare un'asta
// Solo gli utenti con ruolo 'admin' o 'bid-creator' possono creare un'asta
// Richiede autenticazione JWT
router.post('/', authenticateJWT, authorizeRoles('admin', 'bid-creator'), createAuction);

// Route per ottenere le aste
// Permette di filtrare per status (created, open, bidding, closed)
router.get('/', getAuctions);


router.post(
  '/join',
  authenticateJWT,
  authorizeRoles('bid-partecipant'),
  joinAuction
);

export default router;