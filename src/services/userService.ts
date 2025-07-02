import { UserDAO } from '../dao/userDAO';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type AllowedRole = "admin" | "bid-creator" | "bid-participant";

export class UserService {
  private userDAO = new UserDAO();

  async register(data: { email: string, password: string, role: AllowedRole, username: string }) {
    const { email, password, role, username } = data;

    if (!email || !password || !role || !username) {
      throw { status: 400, message: 'Dati mancanti' };
    }

    const exists = await this.userDAO.findByEmail(email);
    if (exists) {
      throw { status: 400, message: 'Email già in uso' };
    }

    const usernameExists = await this.userDAO.findByUsername(username);
    if (usernameExists) {
      throw { status: 400, message: 'Username già in uso' };
    }

    // Puoi decommentare per usare password hashata:
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const user = await this.userDAO.createUser({ email, password: hashedPassword, role, username });
    const user = await this.userDAO.createUser({ email, password, role, username });
    await this.userDAO.createWallet(user.id, 100);

    return { message: 'Registrazione completata' };
  }

  async login(email: string, password: string) {
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Credenziali non valide' };
    }

    // Se vuoi usare password hashata:
    // const match = await bcrypt.compare(password, user.password);
    // if (!match) {
    //   throw { status: 401, message: 'Credenziali non valide' };
    // }

    if (user.password !== password) {
      throw { status: 401, message: 'Credenziali non valide' };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    return { token };
  }
}