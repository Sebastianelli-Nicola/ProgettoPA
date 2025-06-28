import { Router } from 'express';
import { placeBid } from '../controllers/bidController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:id/bid', authenticateJWT, authorizeRoles('bid-participant'), placeBid);

export default router;
