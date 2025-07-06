import express from 'express';
import { getWalletBalance, rechargeWallet } from '../controllers/walletController';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler'; 

const router = express.Router();

/**
 * Rotta per ottenere il saldo del wallet dell'utente autenticato
 * Questa rotta consente agli utenti autenticati di visualizzare il proprio saldo del wallet.
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido
 * prima di consentire l'accesso alla rotta.
 */
router.get('/', authMiddlewareHandler.authWithRoles(['bid-participant']), getWalletBalance);


/**
 * Rotta per ricaricare il wallet, accessibile solo agli utenti admin
 * Questa rotta consente a un admin di ricaricare il wallet di un utente
 * Il middleware authMiddlewareHandler verifica la presenza di un token JWT valido
 * e authorizeRoles verifica che l'utente abbia il ruolo di admin.
 */
router.post('/recharge', authMiddlewareHandler.authWithRoles(['admin']), rechargeWallet);

export default router;
