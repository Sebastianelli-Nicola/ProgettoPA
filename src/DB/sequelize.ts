import { Sequelize } from 'sequelize';

//Istanza singelton di sequelize
let sequelize: Sequelize | null = null; 

//Funzione per inizializzare una sola volta Sequelize
export const getSequelizeInstance = (): Sequelize => {
    if (!sequelize) {
        sequelize = new Sequelize('asta_snap', 'postgres', 'postgres', {
            dialect: 'postgres',
            host: '127.0.0.1',
            logging: false, // Disabilita il logging per evitare output eccessivo
        });
    }
    
    return sequelize;
};