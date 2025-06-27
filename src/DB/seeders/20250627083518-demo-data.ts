'use strict';

import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // 1. USERS
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword1',
        role: 'admin',
        wallet: 1000,
      },
      {
        id: 2,
        username: 'creator1',
        email: 'creator1@example.com',
        password: 'hashedpassword2',
        role: 'bid-creator',
        wallet: 800,
      },
      {
        id: 3,
        username: 'participant1',
        email: 'participant1@example.com',
        password: 'hashedpassword3',
        role: 'bid-partecipant',
        wallet: 500,
      },
      {
        id: 4,
        username: 'participant2',
        email: 'participant2@example.com',
        password: 'hashedpassword4',
        role: 'bid-partecipant',
        wallet: 600,
      },
    ]);

    // 2. WALLETS (uno per partecipant1 e partecipant2)
    await queryInterface.bulkInsert('wallets', [
      { id: 1, userId: 3, balance: 500 },
      { id: 2, userId: 4, balance: 600 },
    ]);

    // 3. AUCTIONS
    await queryInterface.bulkInsert('auctions', [
      {
        id: 1,
        title: 'Auction 1',
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        relaunchTime: 5,
      },
    ]);

    // 4. PARTICIPATIONS
    await queryInterface.bulkInsert('participations', [
      {
        id: 1,
        userId: 3,
        auctionId: 1,
        fee: 50,
        isWinner: false,
        isValid: true,
      },
      {
        id: 2,
        userId: 4,
        auctionId: 1,
        fee: 50,
        isWinner: false,
        isValid: true,
      },
    ]);

    // 5. BIDS
    await queryInterface.bulkInsert('bids', [
      { id: 1, userId: 3, auctionId: 1 },
      { id: 2, userId: 4, auctionId: 1 },
      { id: 3, userId: 3, auctionId: 1 },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('bids', {}, {});
    await queryInterface.bulkDelete('participations', {}, {});
    await queryInterface.bulkDelete('auctions', {}, {});
    await queryInterface.bulkDelete('wallets', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
  },
};
