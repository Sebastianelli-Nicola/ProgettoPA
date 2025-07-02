import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/userDAO'; 

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role , username } = req.body;

    if (!email || !password || !role || !username) {
      res.status(400).json({ message: 'Dati mancanti' });
      return;
    }

    const userDAO = new UserDAO();

    // Controllo  email
    const exists = await userDAO.findByEmail(email);
    if (exists) {
      res.status(400).json({ message: 'Email già in uso' });
      return;
    }

    //Controllo username
    const usernameExists = await userDAO.findByUsername(username);
    if (usernameExists) {
      res.status(400).json({ message: 'Username già in uso' });
      return;
    }

    //const hashedPassword = await bcrypt.hash(password, 10);
    //const user = await User.create({ email, password: hashedPassword, role , username });
    const user = await userDAO.createUser({ email, password, role, username });
    await userDAO.createWallet(user.id, 100);

    res.status(201).json({ message: 'Registrazione completata' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const userDAO = new UserDAO();

    // Trova l’utente con quella email
    const user = await userDAO.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Confronto diretto delle password (in chiaro)
    if (user.password !== password) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Generazione token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

/*export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};*/

