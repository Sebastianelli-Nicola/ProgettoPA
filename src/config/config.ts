import dotenv from 'dotenv';
dotenv.config();

export = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'asta_snap',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
  },
};

/*const config = {
    development: {
        username: 'postgres',
        password: 'postgres',
        database: 'asta_snap',
        host: '127.0.0.1',
        dialect: 'postgres',
        }
};

export = config;*/