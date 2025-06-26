// Descrizione: Gestione delle rotte di autenticazione per la registrazione degli utent

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Wallet } from '../models/wallet';

const router = Router();

// Endpoint di registrazione
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Verifica che i campi siano presenti
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Dati mancanti' });
    }

    // Verifica se l'utente esiste già
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'Email già utilizzata' });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea l'utente
    const user = await User.create({
      email,
      password: hashedPassword,
      role, // Il ruolo deve essere uno tra: admin, bid-creator, bid-participant
    });

    // (Opzionale) Crea un wallet associato all'utente, con balance iniziale (ad es. 100 token)
    await Wallet.create({ userId: user.id, balance: 100 });

    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Inserisci email e password' });
    }

    // Cerca l'utente tramite email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Confronta la password inviata con quella hashata nel DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Genera il token JWT. Il payload include l'id e il ruolo.
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

export default router;
