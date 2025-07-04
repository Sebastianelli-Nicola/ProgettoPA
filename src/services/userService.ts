/**
 * @fileoverview Servizio per gestire gli utenti.
 * 
 * Fornisce metodi per la registrazione, il login e la gestione dei profili utente.
 */

import { UserDAO } from '../dao/userDAO';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Tipo di ruolo consentito
type AllowedRole = "admin" | "bid-creator" | "bid-participant";


/**
 * Servizio per gestire gli utenti.
 */
export class UserService {
  private userDAO = UserDAO.getInstance();

  /**
   * Registra un nuovo utente.
   *
   * @param data I dati dell'utente da registrare.
   * @returns Un messaggio di conferma.
   */
  async register(data: { email: string, password: string, role: AllowedRole, username: string }) {
    const { email, password, role, username } = data;  // Destruttura i dati dell'utente

    // Controlla se mancano dati
    if (!email || !password || !role || !username) {
      throw { status: 400, message: 'Dati mancanti' };
    }

    // Controlla se l'email è già in uso
    const exists = await this.userDAO.findByEmail(email);
    if (exists) {
      throw { status: 400, message: 'Email già in uso' };
    }

    // Controlla se il nome utente è già in uso
    const usernameExists = await this.userDAO.findByUsername(username);
    if (usernameExists) {
      throw { status: 400, message: 'Username già in uso' };
    }

    // Puoi decommentare per usare password hashata:
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userDAO.createUser({ email, password: hashedPassword, role, username });

    // Crea il nuovo utente
    //const user = await this.userDAO.createUser({ email, password, role, username });
    await this.userDAO.createWallet(user.id, 100);   // Crea un nuovo portafoglio con un saldo iniziale di 100

    return { message: 'Registrazione completata' };
  }

  /**
   * Effettua il login di un utente.
   *
   * @param email L'email dell'utente.
   * @param password La password dell'utente.
   * @returns Un token JWT se il login ha successo.
   */
  async login(email: string, password: string) {
    const user = await this.userDAO.findByEmail(email);   // Trova l'utente per email

    // Controlla se l'utente esiste
    if (!user) {
      throw { status: 401, message: 'Credenziali non valide' };
    }

    // Se vuoi usare password hashata:
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
    throw { status: 401, message: 'Credenziali non valide' };
    }

    // Controlla se la password è corretta
    // if (user.password !== password) {
    //   throw { status: 401, message: 'Credenziali non valide' };
    // }

    // Crea un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    return { token };  // Restituisce il token JWT
  }
}