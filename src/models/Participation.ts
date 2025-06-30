import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';
import { Auction } from './Auction';

interface ParticipationAttributes {
    id: number;
    userId: number;
    auctionId: number;
    fee: number; // quota di partecipazione
    isWinner: boolean; // indica se l'utente è il vincitore dell'asta
    isValid: boolean; // indica se la partecipazione è valida (può essere false se l'asta viene annullata)
    createdAt?: Date; // timestamp di creazione
    updatedAt?: Date; // timestamp di aggiornamento
}

type ParticipationCreationAttributes = Omit<ParticipationAttributes, 'id' | 'isWinner' | 'isValid'>;
//type ParticipationInstance = Model<ParticipationAttributes> & { Auction: Auction; };

export class Participation extends Model<ParticipationAttributes, ParticipationCreationAttributes> implements ParticipationAttributes {
  public id!: number;
  public userId!: number;
  public auctionId!: number;
  public fee!: number;
  public isWinner!: boolean;
  public isValid!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

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
  modelName: 'Participation',
  tableName: 'participations',
  timestamps: true,
});

User.hasMany(Participation, { foreignKey: 'userId' });
Participation.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Participation, { foreignKey: 'auctionId' });
Participation.belongsTo(Auction, { foreignKey: 'auctionId' });
