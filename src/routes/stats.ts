import { Router } from 'express';
import { getAuctionStats } from '../controllers/statsController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  getAuctionStats
);

export default router;
