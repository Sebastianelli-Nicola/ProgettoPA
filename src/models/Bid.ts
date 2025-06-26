import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';
import { Auction } from './Auction';

interface BidAttributes {
    id: number;
    userId: number;
    auctionId: number;
    createdAt: Date;
}

type BidCreationAttributes = Omit<BidAttributes, 'id' | 'createdAt'>;

export class Bid extends Model<BidAttributes, BidCreationAttributes>    implements BidAttributes {
  public id!: number;
  public userId!: number;
  public auctionId!: number;
  public createdAt!: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

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
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Bid',
  timestamps: true,
});

User.hasMany(Bid, { foreignKey: 'userId' });
Bid.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId' });
