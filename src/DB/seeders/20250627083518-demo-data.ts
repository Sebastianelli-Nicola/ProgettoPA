'use strict';

import { QueryInterface } from 'sequelize';

function roundToMinute(date: Date) {
  date.setSeconds(0, 0);
  return date;
}

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const now = roundToMinute(new Date());

    const auctionStartIn2Min = new Date(now.getTime() + 2 * 60_000);
    const auctionEndIn3Min = new Date(now.getTime() + 3 * 60_000);


    // 1. USERS
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$12$APxKgz4UxmM6YmsLc/aAYusKhfczJ4em7VSAO98GH.NuweQfQkySa', // hashedpassword1
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'creator2',
        email: 'creator2@example.com',
        password: '$2a$12$bW.vT2A.jk5v4XvPperWPuMovow2muoLp1O8OkdYiUC4aCMB1wc2q',  // hashedpassword4
        role: 'bid-creator',
        createdAt: now,
        updatedAt: now,
      },
      {
        username: 'creator1',
        email: 'creator1@example.com',
        password: '$2a$12$mNVyw4u1BoTXDxyVLvS5e.zQFS1MvEkMvpAlV.66DBnC4V6JyAMw2',  //hashedpassword2
        role: 'bid-creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'participant1',
        email: 'participant1@example.com',
        password: '$2a$12$cUlz/RMcXH7O8ffJRQLOG.ZIr38F4bpSfp25q4uBQ8FyrlzzlPHvO', // hashedpassword3
        role: 'bid-participant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'participant2',
        email: 'participant2@example.com',
        password: '$2a$12$Z1x6BoaNfjFUXSetdt1dg.6C7/aiMjMmJVbFSdrrfdoHQ9fXEqmhC',   // hashedpassword5
        role: 'bid-participant',
        createdAt: now,
        updatedAt: now,
      },
      {
        username: 'participant3',
        email: 'participant3@example.com',
        password: '$2a$12$l8ScfixTCwQey58tVWnVhOp11kGHy30Zmi4iPgXcrmnbQXr4rSrQS',  // hashedpassword6
        role: 'bid-participant',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 2. WALLETS
    await queryInterface.bulkInsert('wallets', [
      { userId: 1, balance: 1000 }, // Admin
      { userId: 2, balance: 2000 }, // Creator1
      { userId: 3, balance: 1000 }, // Creator2
      { userId: 4, balance: 1000 }, // Participant1
      { userId: 5, balance: 1600 }, // Participant2
      { userId: 6, balance: 2000 }, // Participant3
    ]);

    // 3. AUCTIONS
    await queryInterface.bulkInsert('auctions', [
      {
        title: 'Asta 1',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 2',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 200,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 3',
        creatorId: 3,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'closed',
        startTime: new Date(now.getTime() - 10 * 60_000),
        endTime: new Date(now.getTime() - 5 * 60_000),
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 4',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 5',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 6',
        creatorId: 3,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 10,
        bidsPerParticipant: 3,
        status: 'closed',
        startTime: new Date(now.getTime() - 10 * 60_000),
        endTime: new Date(now.getTime() - 5 * 60_000),
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Asta 7',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 3,
        entryFee: 50,
        maxPrice: 100,
        bidIncrement: 1,
        bidsPerParticipant: 3,
        status: 'open',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 4. PARTICIPATIONS
    await queryInterface.bulkInsert('participations', [
      { userId: 4, auctionId: 1, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 1, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 6, auctionId: 2, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 2, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 6, auctionId: 5, fee: 30, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 5, fee: 30, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 4, auctionId: 7, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 7, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
      { userId: 6, auctionId: 7, fee: 50, isWinner: false, isValid: true, createdAt: now, updatedAt: now },
    ]);

    // 5. BIDS
    await queryInterface.bulkInsert('bids', [
      { userId: 6, auctionId: 2, amount: 120, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 2, amount: 130, createdAt: now, updatedAt: now },
      { userId: 4, auctionId: 7, amount: 1, createdAt: new Date(now.getTime() + 121000), updatedAt: now }, // participant1
      { userId: 5, auctionId: 7, amount: 1, createdAt: new Date(now.getTime() + 122000), updatedAt: now }, // participant2
      { userId: 4, auctionId: 7, amount: 1, createdAt: new Date(now.getTime() + 123000), updatedAt: now }, // participant1
      { userId: 6, auctionId: 7, amount: 1, createdAt: new Date(now.getTime() + 124000), updatedAt: now }, // participant3
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