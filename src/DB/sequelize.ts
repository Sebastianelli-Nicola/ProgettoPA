/**
 * @fileoverview Modulo per la configurazione e l'istanza di Sequelize.
 * 
 * Questo modulo gestisce la connessione a un database PostgreSQL utilizzando Sequelize.
 * Fornisce un'istanza singleton di Sequelize che può essere utilizzata in tutta l'applicazione.
 * L'istanza viene inizializzata una sola volta e le credenziali del database sono lette da un file .env.
 * Utilizza le variabili d'ambiente per configurare la connessione al database.
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

//Istanza singelton di sequelize
let sequelize: Sequelize | null = null; 

/**
 * Funzione per ottenere l'istanza di Sequelize.
 * @returns L'istanza di Sequelize configurata per il database PostgreSQL.
 */
export const getSequelizeInstance = (): Sequelize => {
    if (!sequelize) {
        sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
            dialect: 'postgres', logging: false,
        }); // Configura Sequelize per utilizzare PostgreSQL
    }
    
    return sequelize;
};