'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('users', {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
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
            // createdAt: {
            //   type: DataTypes.DATE,
            //   allowNull: false,
            //   defaultValue: DataTypes.NOW,
            // },
            // updatedAt: {
            //   type: DataTypes.DATE,
            //   allowNull: false,
            //   defaultValue: DataTypes.NOW,
            // }
        });
    },
    down: async (queryInterface) => {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('users');
    }
};
