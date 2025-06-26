import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

//Istanza singelton di sequelize
let sequelize: Sequelize | null = null; 

//Funzione per inizializzare una sola volta Sequelize
export const getSequelizeInstance = (): Sequelize => {
    if (!sequelize) {
        sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
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