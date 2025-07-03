/**
 * @fileoverview Definisce il modello User per la gestione degli utenti nel sistema.
 * 
 * Questo modello rappresenta gli utenti del sistema e include attributi come ID, username, email, password e ruolo.
 * Gli utenti possono avere diversi ruoli come 'admin', 'bid-creator' o 'bid-participant'.
 * Il modello è utilizzato per la registrazione, l'autenticazione e la gestione dei permessi degli utenti.
 * Le password degli utenti sono memorizzate in modo sicuro e gli utenti possono essere associati a partecipazioni 
 * e portafogli tramite relazioni definite nei modelli Participation e Wallet.      
 * Le relazioni tra gli utenti e le partecipazioni sono definite nei modelli Participation e Wallet.
 */

import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../DB/sequelize";

// Definizione dell'interfaccia per gli attributi del modello User
interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'bid-creator' | 'bid-participant';
    createdAt?: Date;
    updatedAt?: Date;
}

// Definisce gli attributi per la creazione di un nuovo utente
type UserCreationAttributes = Optional<UserAttributes, 'id'>;

/**
 * Classe che rappresenta un utente nel sistema.
 * Questa classe estende Model di Sequelize e implementa gli attributi definiti in UserAttributes
 */
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: 'admin' | 'bid-creator' | 'bid-participant';
    public createdAt?: Date;
    public updatedAt?: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

//Inizializzazione del modello Sequelize
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'bid-creator', 'bid-participant'),
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
    },
    {
        sequelize, // Passa l'istanza di Sequelize
        modelName: 'User',
        tableName: 'users',
        timestamps: true, // Abilita createdAt e updatedAt
    }
);

//User.hasOne(Wallet);
//User.hasMany(Participation);
