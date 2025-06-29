import { Request, Response } from 'express';
import { Wallet } from '../models/Wallet';
import { AuthRequest } from '../middlewares/authMiddleware';

// Ottieni il saldo del wallet dell'utente autenticato
// Richiede autenticazione JWT
export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const wallet = await Wallet.findOne({ where: { userId } });
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

// Ricarica il wallet di un utente
// Richiede autenticazione JWT e autorizzazione per il ruolo 'admin' 
export const rechargeWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      res.status(404).json({ message: 'Wallet non trovato' });
      return;
    }

    wallet.balance += Number(amount);
    await wallet.save();

    res.status(200).json({ message: 'Ricarica completata', balance: wallet.balance });
  } catch (error) {
    console.error('Errore ricarica wallet:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};



