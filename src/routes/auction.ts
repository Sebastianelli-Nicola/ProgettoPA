import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { createAuction } from '../controllers/auctionController';


const router = Router();

router.post(
  '/auction',
  authenticateJWT,
  authorizeRoles('admin', 'bid-creator'),
  createAuction
);

export default router;