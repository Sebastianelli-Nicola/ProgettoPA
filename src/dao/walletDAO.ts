import { Wallet } from '../models/Wallet';

export class WalletDAO {
  async getBalance(userId: number, transaction?: any) {
    return Wallet.findOne({ where: { userId }, transaction });
  }

  async save(wallet: Wallet, transaction?: any): Promise<Wallet> {
    return wallet.save({ transaction });
  }

  async findByUserId(userId: number, transaction?: any): Promise<Wallet | null> {
    return Wallet.findOne({ where: { userId }, transaction });
  }

  async recharge(userId: number, amount: number, transaction?: any): Promise<Wallet> {
    const wallet = await Wallet.findOne({ where: { userId }, transaction });
    if (!wallet) {
      throw { status: 404, message: 'Wallet non trovato' };
    }
    wallet.balance += Number(amount);
    await wallet.save({ transaction });
    return wallet;
  }

  async create(data: { userId: number, balance: number }, transaction?: any): Promise<Wallet> {
    return Wallet.create(data, { transaction });
  }
}

// import { Wallet } from '../models/Wallet';

// export class WalletDAO {

//   async getBalance(userId: number) {
//     return Wallet.findOne({ where: { userId } });
//   }

//   async save(wallet: Wallet, transaction?: any): Promise<Wallet> {
//     return wallet.save({ transaction });
//   }

//   async findByUserId(userId: number, transaction?: any): Promise<Wallet | null> {
//     return Wallet.findOne({ where: { userId }, transaction });
//   }

//   /**
//    * Aggiunge un importo al saldo del wallet.
//    */
//     async recharge(userId: number, amount: number): Promise<Wallet> {
//     const wallet = await Wallet.findOne({ where: { userId } });
//     if (!wallet) {
//       throw { status: 404, message: 'Wallet non trovato' };
//     }

//     wallet.balance += Number(amount);
//     await wallet.save();

//     return wallet;
//   }

//   async create(data: { userId: number, balance: number }, transaction?: any): Promise<Wallet> {
//     return Wallet.create(data, { transaction });
//   }
// }
