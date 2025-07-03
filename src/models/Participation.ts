/**
 * @fileoverview Definisce il modello Participation per le partecipazioni degli utenti alle aste.
 * Questo modello rappresenta le partecipazioni degli utenti alle aste e include attributi come l'ID dell'utente, 
 * l'ID dell'asta, la quota di partecipazione, se l'utente è il vincitore dell'asta e se la partecipazione è valida.
 * Le partecipazioni sono associate agli utenti e alle aste tramite le chiavi esterne userId e auctionId.
 * Le partecipazioni sono utilizzate per registrare gli utenti che partecipano a un'asta e per determinare il vincitore dell'asta.
 * Le partecipazioni sono collegate agli utenti e alle aste tramite le relazioni definite nei modelli User e Auction.
 */

import { Model, DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';
import { Auction } from './Auction';

// Definisce gli attributi del modello Participation
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

// Definisce gli attributi per la creazione di una nuova partecipazione
type ParticipationCreationAttributes = Omit<ParticipationAttributes, 'id' | 'isWinner' | 'isValid'>;

/**
 * Classe che rappresenta una partecipazione di un utente a un'asta.
 * Questa classe estende Model di Sequelize e implementa gli attributi definiti in ParticipationAttributes.
 */
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

// Inizializza il modello Participation
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

// Definisce le relazioni tra i modelli
// Un utente può avere molte partecipazioni, e una partecipazione appartiene a un utente
User.hasMany(Participation, { foreignKey: 'userId' });
Participation.belongsTo(User, { foreignKey: 'userId' });

// Un'asta può avere molte partecipazioni, e una partecipazione appartiene a un'asta
Auction.hasMany(Participation, { foreignKey: 'auctionId' });
Participation.belongsTo(Auction, { foreignKey: 'auctionId' });
