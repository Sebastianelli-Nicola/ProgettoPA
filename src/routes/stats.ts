import { Router } from 'express';
import { getAuctionStats, getUserExpenses } from '../controllers/statsController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  getAuctionStats
);

router.get('/expenses', authenticateJWT, authorizeRoles('bid-participant'), getUserExpenses);

export default router;
