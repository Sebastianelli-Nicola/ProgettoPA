import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';
import { Auction } from './Auction';

export class Participation extends Model {
  public id!: number;
  public userId!: number;
  public auctionId!: number;
  public fee!: number;
  public isWinner!: boolean;
  public isValid!: boolean;
}

Participation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fee: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isWinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // diventa false se l’asta viene annullata
  }
}, {
  sequelize: getSequelizeInstance(),
  modelName: 'Participation',
  timestamps: true,
});

User.hasMany(Participation, { foreignKey: 'userId' });
Participation.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Participation, { foreignKey: 'auctionId' });
Participation.belongsTo(Auction, { foreignKey: 'auctionId' });
