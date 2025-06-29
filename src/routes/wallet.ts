import express from 'express';
import { getWalletBalance, rechargeWallet } from '../controllers/walletController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authenticateJWT, getWalletBalance);
router.post('/recharge', authenticateJWT, authorizeRoles('admin'), rechargeWallet);

export default router;
