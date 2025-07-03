/**
 *  @fileoverview Questo file definisce le rotte per la gestione dell'autenticazione degli utenti.
 */

import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

/**
 * Rotta POST per il login
 * Permette agli utenti di autenticarsi e ottenere un token JWT
 */
router.post('/login', login);

/**
 * Rotta POST per la registrazione
 * Permette agli utenti di registrarsi e ottenere un token JWT
 */
router.post('/register', register);


export default router;