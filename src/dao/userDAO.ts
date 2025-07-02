import { User } from '../models/User';
import { WalletDAO } from './walletDAO';


type AllowedRole = "admin" | "bid-creator" | "bid-participant";

export class UserDAO {
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async findByUsername(username: string) {
    return User.findOne({ where: { username } });
  }

  async createUser(data: { email: string, password: string, role: AllowedRole, username: string }) {
    return User.create(data);
  }

  async createWallet(userId: number, initialBalance: number) {
    const walletDAO = new WalletDAO();
    return walletDAO.create({ userId, balance: initialBalance });
  }
}
