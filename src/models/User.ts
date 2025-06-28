import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../DB/sequelize";
import { Wallet } from "./Wallet";
import { Participation } from "./Participation";

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

//Specifica campi opzionali per la creazione di un nuovo utente
type UserCreationAttributes = Optional<UserAttributes, 'id' >;

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
