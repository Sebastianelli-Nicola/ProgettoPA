/**
 * @fileoverview Controller per la gestione del wallet utente.
 * 
 * Fornisce funzioni per ottenere il saldo e ricaricare il wallet.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */


import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { WalletService } from '../services/walletService';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';
import HTTPStatus from 'http-status-codes';

const walletService = new WalletService();


/**
 * Restituisce il saldo del wallet dell'utente autenticato.
 * Verifica la presenza dell'ID utente e l'esistenza del wallet.
 */
export const getWalletBalance = async (req: AuthRequest, res: Response, next:NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Controlla che l'utente sia autenticato
    if (!userId) {
      return next(ErrorFactory.createError(ErrorType.InvalidUserId));
    }

    const wallet = await walletService.getWalletBalance(userId);

    // Controlla che il wallet esista
    if (!wallet) {
      return next(ErrorFactory.createError(ErrorType.WalletNotFound));
    }

    res.status(HTTPStatus.OK).json({ balance: wallet.balance });
  } catch (error) {
    next(error);
  }
};


/**
 * Ricarica il wallet di un utente.
 * Richiede userId e amount nel body della richiesta.
 */
export const rechargeWallet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    // Verifica la presenza e validità dei dati
    if (!userId || !amount || isNaN(Number(amount))) {
       return next(ErrorFactory.createError(ErrorType.Validation, 'Dati mancanti o non validi'));
    }

    const wallet = await walletService.rechargeWallet(userId, Number(amount));

    res.status(HTTPStatus.OK).json({ message: 'Ricarica completata', balance: wallet.balance });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

