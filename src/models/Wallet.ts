import { DataTypes, Model } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './user';

export class Wallet extends Model {
  public id!: number;
  public userId!: number;
  public balance!: number;
}

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
