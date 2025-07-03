/**
 * @fileoverview Controller per la gestione del wallet utente.
 * 
 * Fornisce funzioni per ottenere il saldo e ricaricare il wallet.
 * Ogni funzione gestisce la logica di business e restituisce risposte HTTP appropriate.
 */


import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { WalletService } from '../services/walletService';

const walletService = new WalletService();


/**
 * Restituisce il saldo del wallet dell'utente autenticato.
 * Verifica la presenza dell'ID utente e l'esistenza del wallet.
 */
export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Controlla che l'utente sia autenticato
    if (!userId) {
      res.status(400).json({ message: 'ID utente non valido o mancante' });
      return;
    }

    const wallet = await walletService.getWalletBalance(userId);

    // Controlla che il wallet esista
    if (!wallet) {
      res.status(404).json({ message: 'Wallet non trovato' });
      return;
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    console.error('Errore recupero wallet:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};


/**
 * Ricarica il wallet di un utente.
 * Richiede userId e amount nel body della richiesta.
 */
export const rechargeWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    // Verifica la presenza e validità dei dati
    if (!userId || !amount || isNaN(Number(amount))) {
      res.status(400).json({ message: 'Dati mancanti o non validi' });
      return;
    }

    const wallet = await walletService.rechargeWallet(userId, Number(amount));

    res.status(200).json({ message: 'Ricarica completata', balance: wallet.balance });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Errore ricarica wallet:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }
};

