import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';
import { WalletService } from '../services/walletService';

const walletService = new WalletService();

export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: 'ID utente non valido o mancante' });
      return;
    }

    const wallet = await walletService.getWalletBalance(userId);

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

export const rechargeWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, amount } = req.body;

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

// import { Request, Response } from 'express';
// import { WalletDAO } from '../dao/walletDAO';
// import { AuthRequest } from '../middlewares/auth/JWTAuthHandler';

// // Ottieni il saldo del wallet dell'utente autenticato
// // Richiede autenticazione JWT
// export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       res.status(400).json({ message: 'ID utente non valido o mancante' });
//       return;
//     }

//     //const wallet = await Wallet.findOne({ where: { userId } });
//     const walletDAO = new WalletDAO();
//     const wallet = await walletDAO.getBalance(userId);
    
//     if (!wallet) {
//       res.status(404).json({ message: 'Wallet non trovato' });
//       return;
//     }

//     res.status(200).json({ balance: wallet.balance });
//   } catch (error) {
//     console.error('Errore recupero wallet:', error);
//     res.status(500).json({ message: 'Errore interno del server' });
//   }
// };

// // Ricarica il wallet di un utente
// // Richiede autenticazione JWT e autorizzazione per il ruolo 'admin' 
// export const rechargeWallet = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const { userId, amount } = req.body;

//     //const wallet = await Wallet.findOne({ where: { userId } });

//     if (!userId || !amount || isNaN(Number(amount))) {
//       res.status(400).json({ message: 'Dati mancanti o non validi' });
//       return;
//     }

//     const walletDAO = new WalletDAO();
//     const wallet = await walletDAO.recharge(userId, Number(amount));

//     res.status(200).json({ message: 'Ricarica completata', balance: wallet.balance });
//   } catch (error: any) {
//     if (error.status) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       console.error('Errore ricarica wallet:', error);
//       res.status(500).json({ message: 'Errore interno del server' });
//     }
//   }
// };