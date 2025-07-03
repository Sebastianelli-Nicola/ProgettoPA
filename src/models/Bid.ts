/**
 * @fileoverview Questo file definisce il modello per le puntate utilizzando Sequelize.
 * 
 * Il modello rappresenta le puntate fatte dagli utenti sulle aste e include attributi come l'ID dell'utente, 
 * l'ID dell'asta, l'importo della puntata e i timestamp di creazione e aggiornamento.
 * Le puntate sono associate agli utenti e alle aste tramite le chiavi esterne userId e auctionId.
 * Le puntate sono utilizzate per registrare le offerte fatte dagli utenti durante le aste
 * e per determinare il vincitore dell'asta in base all'importo della puntata.
 * Le puntate sono collegate agli utenti e alle aste tramite le relazioni definite nei modelli User e Auction.
 * 
 */

import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';
import { Auction } from './Auction';

// Definisce gli attributi del modello Bid
interface BidAttributes {
    id: number;
    userId: number;
    auctionId: number;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Definisce gli attributi per la creazione di una nuova puntata
type BidCreationAttributes = Omit<BidAttributes, 'id' | 'createdAt'>;

/**
 * Classe che rappresenta una puntata nel sistema.
 */
export class Bid extends Model<BidAttributes, BidCreationAttributes> implements BidAttributes {
  public id!: number;
  public userId!: number;
  public auctionId!: number;
  public amount!: number; 
  public createdAt!: Date;
  public updatedAt!: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

// Inizializza il modello Bid
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
  modelName: 'Bid',
  tableName: 'bids',
  timestamps: true,
});

// Definisce le relazioni tra i modelli
// Un utente può avere molte puntate, e una puntata appartiene a un utente
User.hasMany(Bid, { foreignKey: 'userId' });
Bid.belongsTo(User, { foreignKey: 'userId' });

// Un'asta può avere molte puntate, e una puntata appartiene a un'asta
Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId' });
