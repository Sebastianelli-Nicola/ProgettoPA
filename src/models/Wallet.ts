/**
 * @fileoverview Questo file definisce il modello per i portafogli degli utenti utilizzando Sequelize.
 * 
 * Il modello rappresenta i portafogli degli utenti nel database e include attributi come l'ID dell'utente, 
 * il saldo del portafoglio e i timestamp di creazione e aggiornamento.
 * I portafogli sono utilizzati per gestire il saldo degli utenti e le transazioni associate.
 * Le relazioni tra gli utenti e i portafogli sono definite nei modelli User e Wallet.
 * I portafogli sono collegati agli utenti tramite la chiave esterna userId.
 * Gli utenti possono avere un solo portafoglio, e ogni portafoglio appartiene a un singolo utente.
 * Le operazioni sui portafogli possono includere l'aggiunta o la rimozione di fondi, il controllo del saldo e altre transazioni finanziarie.
 */

import { DataTypes, Model } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';
import { User } from './User';

// Definisce gli attributi del modello Wallet
interface WalletAttributes {
  id: number;
  userId: number;
  balance: number;
  createdAt?: Date; // timestamp di creazione
  updatedAt?: Date; // timestamp di aggiornamento
}   

// Definisce gli attributi per la creazione di un nuovo portafoglio
type WalletCreationAttributes = Omit<WalletAttributes, 'id'>;

/**
 * Classe che rappresenta un portafoglio di un utente.
 * Questa classe estende Model di Sequelize e implementa gli attributi definiti in WalletAttributes
 */
export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public balance!: number;
  public createdAt?: Date;  
  public updatedAt?: Date;
}

// Istanza singleton di sequelize
const sequelize = getSequelizeInstance();

// Inizializza il modello Wallet
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

// Definisce le relazioni tra i modelli
// Un utente può avere un solo portafoglio, e un portafoglio appartiene a un utente
User.hasOne(Wallet, { foreignKey: 'userId', as: 'userWallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

