import { DataTypes, Model } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';

interface WalletAttributes {
  id: number;
  userId: number;
  balance: number;
  createdAt?: Date; // timestamp di creazione
  updatedAt?: Date; // timestamp di aggiornamento
}   

type WalletCreationAttributes = Omit<WalletAttributes, 'id'>;

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public balance!: number;
  public createdAt?: Date;  
  public updatedAt?: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

Wallet.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  timestamps: true, // Abilita createdAt e updatedAt
});

User.hasOne(Wallet, { foreignKey: 'userId', as: 'userWallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

