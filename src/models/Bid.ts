import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './user';
import { Auction } from './auction';

export class Bid extends Model {
  public id!: number;
  public userId!: number;
  public auctionId!: number;
  public createdAt!: Date;
}

Bid.init({
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
  }
}, {
  sequelize: getSequelizeInstance(),
  modelName: 'Bid',
  timestamps: true,
});

User.hasMany(Bid, { foreignKey: 'userId' });
Bid.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId' });
