import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { createAuction, joinAuction } from '../controllers/auctionController';


const router = Router();

router.post(
  '/auction',
  authenticateJWT,
  authorizeRoles('admin', 'bid-creator'),
  createAuction
);

router.post(
  '/join',
  authenticateJWT,
  authorizeRoles('bid-partecipant'),
  joinAuction
);

export default router;