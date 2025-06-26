"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelizeInstance = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//Istanza singelton di sequelize
let sequelize = null;
//Funzione per inizializzare una sola volta Sequelize
const getSequelizeInstance = () => {
    if (!sequelize) {
        sequelize = new sequelize_1.Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
            dialect: 'postgres', logging: false,
        });
        /*sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'postgres', {
            dialect: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            logging: false, // Disabilita il logging per evitare output eccessivo
        });*/
    }
    return sequelize;
};
exports.getSequelizeInstance = getSequelizeInstance;
