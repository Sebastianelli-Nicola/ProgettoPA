import { Router } from 'express';
import { placeBid } from '../controllers/bidController';
//import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = Router();

router.post('/:id/bid', authMiddlewareHandler.authWithRoles(['bid-participant']), placeBid);

export default router;
