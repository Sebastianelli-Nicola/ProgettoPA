import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
      /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // USERS
    await queryInterface.createTable('users', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('admin', 'bid-creator', 'bid-participant'),
        allowNull: false
      },
      //wallet: { type: DataTypes.INTEGER, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    // AUCTIONS
    await queryInterface.createTable('auctions', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      creatorId: { type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: DataTypes.STRING, allowNull: false },
      minParticipants: { type: DataTypes.INTEGER, allowNull: false },
      maxParticipants: { type: DataTypes.INTEGER, allowNull: false },
      entryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      maxPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      bidIncrement: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      bidsPerParticipant: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM('created', 'open', 'bidding', 'closed', 'cancelled'),
        defaultValue: 'created'
      },
      startTime: { type: DataTypes.DATE, allowNull: false },
      endTime: { type: DataTypes.DATE, allowNull: false },
      relaunchTime: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    // WALLETS
    await queryInterface.createTable('wallets', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    // BIDS
    await queryInterface.createTable('bids', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      auctionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'auctions', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    // PARTICIPATIONS
    await queryInterface.createTable('participations', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      auctionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'auctions', key: 'id' },
        onDelete: 'CASCADE',
      },
      fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      isWinner: { type: DataTypes.BOOLEAN, defaultValue: false },
      isValid: { type: DataTypes.BOOLEAN, defaultValue: true },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, 
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
       /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('participations');
    await queryInterface.dropTable('bids');
    await queryInterface.dropTable('wallets');
    await queryInterface.dropTable('auctions');
    await queryInterface.dropTable('users');
  },
};
