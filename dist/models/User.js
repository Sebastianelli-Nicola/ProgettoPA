"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../DB/sequelize");
class User extends sequelize_1.Model {
}
exports.User = User;
//istanza singleton di sequelize
const sequelize = (0, sequelize_2.getSequelizeInstance)();
//Inizializzazione del modello Sequelize
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'bid-creator', 'bid-partecipant'),
        allowNull: false,
    },
    wallet: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0, // Valore predefinito per il portafoglio
    },
}, {
    sequelize, // Passa l'istanza di Sequelize
    modelName: 'User',
    tableName: 'users',
    //timestamps: true, // Abilita createdAt e updatedAt
});
