/**
 * @fileoverview Questo file definisce il modello per le aste utilizzando Sequelize.
 * 
 * Il modello rappresenta le aste nel database e include attributi come titolo, numero minimo e massimo di partecipanti, 
 * quota di iscrizione, prezzo massimo, incremento minimo, numero di puntate disponibili per partecipante, stato dell'asta, 
 * orari di inizio e fine, e durata della fase di rilancio.
 * Gli stati possibili dell'asta sono: 'created', 'open', 'bidding', 'closed', 'cancelled'.
 */

import { Model, DataTypes, Optional } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';  
import { User } from './User';

interface AuctionAttributes {
    id: number;
    creatorId: number;
    title: string;
    minParticipants: number;
    maxParticipants: number;
    entryFee: number; //quota di iscrizione
    maxPrice: number; //prezzo massimo dell'asta
    minIncrement: number; //incremento minimo dell'asta
    bidsPerParticipant: number; //numero di puntate disponibili per partecipante
    status: 'created' | 'open' | 'bidding' | 'closed' | 'cancelled'; //stato dell'asta
    startTime: Date;
    endTime: Date;
    relaunchTime: number; //durata della fase rilancio in minuti
    createdAt?: Date; //timestamp di creazione
    updatedAt?: Date; //timestamp di aggiornamento
}

// Definisce gli attributi per la creazione di una nuova asta
export interface AuctionCreationAttributes extends Optional<AuctionAttributes, 'id' | 'status' | 'endTime'> {}

export class Auction extends Model<AuctionAttributes, AuctionCreationAttributes> implements AuctionAttributes {
    public id!: number;
    public creatorId!: number;
    public title!: string;
    public minParticipants!: number;
    public maxParticipants!: number;
    public entryFee!: number;
    public maxPrice!: number;
    public minIncrement!: number;
    public bidsPerParticipant!: number;
    public status!: 'created' | 'open' | 'bidding' | 'closed' | 'cancelled'; // stato dell'asta
    public startTime!: Date;
    public endTime!: Date;
    public relaunchTime!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

// Inizializza il modello Auction
// Utilizza sequelize.define per definire il modello con i suoi attributi e opzioni
Auction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false},
  title: { type: DataTypes.STRING, allowNull: false },
  minParticipants: { type: DataTypes.INTEGER, allowNull: false },
  maxParticipants: { type: DataTypes.INTEGER, allowNull: false },
  entryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  maxPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minIncrement: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  bidsPerParticipant: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('created', 'open', 'bidding', 'closed'), defaultValue: 'created' },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  relaunchTime: { type: DataTypes.INTEGER, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  tableName: 'auctions',
  modelName: 'Auction',
  timestamps: true, // Abilita createdAt e updatedAt
});

//Auction.hasMany(Participation);

// Relazione: Un'Asta appartiene a un Utente (il creatore)
Auction.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// (opzionale) Un utente può aver creato molte aste
User.hasMany(Auction, { foreignKey: 'creatorId', as: 'createdAuctions' });