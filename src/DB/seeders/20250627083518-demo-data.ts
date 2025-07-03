'use strict';

import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // 1. USERS
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword1',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'creator1',
        email: 'creator1@example.com',
        password: 'hashedpassword2',
        role: 'bid-creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'creator2',
        email: 'creator2@example.com',
        password: 'hashedpassword5',
        role: 'bid-creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'participant1',
        email: 'participant1@example.com',
        password: 'hashedpassword3',
        role: 'bid-participant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'participant2',
        email: 'participant2@example.com',
        password: 'hashedpassword4',
        role: 'bid-participant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // 2. WALLETS (uno per partecipant1 e partecipant2)
    await queryInterface.bulkInsert('wallets', [
      { userId: 2, balance: 2000 }, // Creator1 wallet
      { userId: 3, balance: 500 },  // Creator2 wallet
      { userId: 4, balance: 500 },  // Participant1 wallet
      { userId: 5, balance: 1600 }, // Participant2 wallet
      { userId: 1, balance: 1000 }, // Admin wallet
    ]);

    // 3. AUCTIONS
    await queryInterface.bulkInsert('auctions', [
      {
        title: 'Auction 1',
        creatorId: 2, // creator1
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Auction 2',
        creatorId: 2, // creator1
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'closed',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        relaunchTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Auction 3',
        creatorId: 3, // creator2
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'cancelled',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        relaunchTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // 4. PARTICIPATIONS
    await queryInterface.bulkInsert('participations', [
      {
        userId: 5,
        auctionId: 2,
        fee: 50,
        isWinner: false,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 5,
        auctionId: 3,
        fee: 50,
        isWinner: true,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 4,
        auctionId: 1,
        fee: 50,
        isWinner: false,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // 5. BIDS
    await queryInterface.bulkInsert('bids', [
      { userId: 5, auctionId: 1, amount: 100 },
      { userId: 5, auctionId: 1, amount: 150 },
      { userId: 4, auctionId: 1, amount: 200 },
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