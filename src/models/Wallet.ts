import { DataTypes, Model } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';

interface WalletAttributes {
  id: number;
  userId: number;
  balance: number;
}   

type WalletCreationAttributes = Omit<WalletAttributes, 'id'>;

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public balance!: number;
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
  }
}, {
  sequelize: getSequelizeInstance(),
  modelName: 'Wallet',
});

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId' });
