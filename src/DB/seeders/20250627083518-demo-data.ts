'use strict';

import { QueryInterface } from 'sequelize';

function roundToMinute(date: Date) {
  date.setSeconds(0, 0);
  return date;
}

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const now = roundToMinute(new Date());

    const auctionStartNow = new Date(now);
    const auctionStartIn1Min = new Date(now.getTime() + 60_000);
    const auctionStartIn2Min = new Date(now.getTime() + 2 * 60_000);
    const auctionEndIn3Min = new Date(now.getTime() + 3 * 60_000);
    const auctionEndIn10Min = new Date(now.getTime() + 10 * 60_000);
    const auctionEndIn12Min = new Date(now.getTime() + 12 * 60_000);


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
        title: 'Auction OPEN to BIDDING soon',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        // startTime: auctionStartNow,
        // endTime: new Date(auctionStartNow.getTime() + 2 * 60_000),
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auction in BIDDING phase',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'bidding',
        startTime: auctionStartIn2Min,
        endTime: auctionEndIn3Min,
        relaunchTime: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auction CLOSED already',
        creatorId: 3,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'closed',
        startTime: new Date(now.getTime() - 10 * 60_000),
        endTime: new Date(now.getTime() - 5 * 60_000),
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auction OPEN to BIDDING soon2',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'open',
        // startTime: auctionStartNow,
        // endTime: new Date(auctionStartNow.getTime() + 2 * 60_000),
        startTime: auctionEndIn10Min,
        endTime: auctionEndIn12Min,
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auction in BIDDING phase2',
        creatorId: 2,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'bidding',
        startTime: auctionEndIn10Min,
        endTime: auctionEndIn12Min,
        relaunchTime: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auction CLOSED already2',
        creatorId: 3,
        minParticipants: 2,
        maxParticipants: 5,
        entryFee: 50,
        maxPrice: 1000,
        minIncrement: 10,
        bidsPerParticipant: 3,
        status: 'closed',
        startTime: new Date(now.getTime() - 10 * 60_000),
        endTime: new Date(now.getTime() - 5 * 60_000),
        relaunchTime: 2,
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
    ]);

    // 5. BIDS
    await queryInterface.bulkInsert('bids', [
      { userId: 6, auctionId: 2, amount: 120, createdAt: now, updatedAt: now },
      { userId: 5, auctionId: 2, amount: 130, createdAt: now, updatedAt: now },
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


// 'use strict';

// import { QueryInterface } from 'sequelize';

// export default {
//   up: async (queryInterface: QueryInterface): Promise<void> => {
//     // === 1. USERS ===
//     await queryInterface.bulkInsert('users', [
//       {
//         username: 'admin',
//         email: 'admin@example.com',
//         password: '$2a$12$APxKgz4UxmM6YmsLc/aAYusKhfczJ4em7VSAO98GH.NuweQfQkySa', // hashedpassword1
//         role: 'admin',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'creator1',
//         email: 'creator1@example.com',
//         password: '$2a$12$mNVyw4u1BoTXDxyVLvS5e.zQFS1MvEkMvpAlV.66DBnC4V6JyAMw2',  //hashedpassword2
//         role: 'bid-creator',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'participant1',
//         email: 'participant1@example.com',
//         password: '$2a$12$cUlz/RMcXH7O8ffJRQLOG.ZIr38F4bpSfp25q4uBQ8FyrlzzlPHvO', // hashedpassword3
//         role: 'bid-participant',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]);

//     // === 2. WALLETS ===
//     await queryInterface.bulkInsert('wallets', [
//       { userId: 1, balance: 1000 },
//       { userId: 2, balance: 1000 },
//       { userId: 3, balance: 2000 },
//     ]);

//     const now = new Date();
//     const past = new Date(now.getTime() - 10 * 60 * 1000);
//     const nearPast = new Date(now.getTime() - 2 * 60 * 1000);
//     const future = new Date(now.getTime() + 15 * 60 * 1000);
//     const nearFuture = new Date(now.getTime() + 2 * 60 * 1000);

//     // === 3. AUCTIONS ===
//     await queryInterface.bulkInsert('auctions', [
//       {
//         title: 'To be moved to BIDDING',
//         creatorId: 2,
//         minParticipants: 1,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 500,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'open',
//         startTime: nearPast,
//         endTime: future,
//         relaunchTime: 2,
//         createdAt: now,
//         updatedAt: now,
//       },
//       {
//         title: 'To be CLOSED by scheduler',
//         creatorId: 2,
//         minParticipants: 1,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 500,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'bidding',
//         startTime: past,
//         endTime: nearPast,
//         relaunchTime: 2,
//         createdAt: now,
//         updatedAt: now,
//       },
//       {
//         title: 'Not started yet',
//         creatorId: 2,
//         minParticipants: 1,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 500,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'open',
//         startTime: future,
//         endTime: new Date(future.getTime() + 15 * 60 * 1000),
//         relaunchTime: 2,
//         createdAt: now,
//         updatedAt: now,
//       },
//       {
//         title: 'Already closed',
//         creatorId: 2,
//         minParticipants: 1,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 500,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'closed',
//         startTime: past,
//         endTime: past,
//         relaunchTime: 2,
//         createdAt: now,
//         updatedAt: now,
//       },
//       {
//         title: 'Cancelled auction',
//         creatorId: 2,
//         minParticipants: 1,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 500,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'cancelled',
//         startTime: past,
//         endTime: future,
//         relaunchTime: 2,
//         createdAt: now,
//         updatedAt: now,
//       },
//     ]);

//     // === 4. PARTICIPATIONS (solo per le aste rilevanti) ===
//     await queryInterface.bulkInsert('participations', [
//       {
//         userId: 3,
//         auctionId: 1, // "To be moved to BIDDING"
//         fee: 50,
//         isWinner: false,
//         isValid: true,
//         createdAt: now,
//         updatedAt: now,
//       },
//       {
//         userId: 3,
//         auctionId: 2, // "To be CLOSED by scheduler"
//         fee: 50,
//         isWinner: false,
//         isValid: true,
//         createdAt: now,
//         updatedAt: now,
//       },
//     ]);

//     // === 5. BIDS ===
//     await queryInterface.bulkInsert('bids', [
//       {
//         userId: 3,
//         auctionId: 2, // "To be CLOSED by scheduler"
//         amount: 100,
//         createdAt: past,
//         updatedAt: past,
//       },
//       {
//         userId: 3,
//         auctionId: 2,
//         amount: 200,
//         createdAt: new Date(past.getTime() + 60000),
//         updatedAt: new Date(past.getTime() + 60000),
//       },
//     ]);
//   },

//   down: async (queryInterface: QueryInterface): Promise<void> => {
//     await queryInterface.bulkDelete('bids', {}, {});
//     await queryInterface.bulkDelete('participations', {}, {});
//     await queryInterface.bulkDelete('auctions', {}, {});
//     await queryInterface.bulkDelete('wallets', {}, {});
//     await queryInterface.bulkDelete('users', {}, {});
//   },
// };


// 'use strict';

// import { QueryInterface } from 'sequelize';

// export default {
//   up: async (queryInterface: QueryInterface): Promise<void> => {
//     // 1. USERS
//     await queryInterface.bulkInsert('users', [
//       {
//         username: 'admin',
//         email: 'admin@example.com',
//         password: '$2a$12$x6YXp2X.36M59.qnYn5rTO7oNDqX9tcMxaOKRFtl8EBmJcEEs2vea', //hasedpassword1
//         role: 'admin',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'creator1',
//         email: 'creator1@example.com',
//         password: 'hashedpassword2',
//         role: 'bid-creator',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'creator2',
//         email: 'creator2@example.com',
//         password: 'hashedpassword5',
//         role: 'bid-creator',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'participant1',
//         email: 'participant1@example.com',
//         password: '$2a$12$DrioUc0J5gL53xN0dhI4T.TrgCPhb5GL1qfCZ1MwMNO4eSyCD0aCS', //'hashedpassword3',
//         role: 'bid-participant',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         username: 'participant2',
//         email: 'participant2@example.com',
//         password: 'hashedpassword4',
//         role: 'bid-participant',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]);

//     // 2. WALLETS (uno per partecipant1 e partecipant2)
//     await queryInterface.bulkInsert('wallets', [
//       { userId: 2, balance: 2000 }, // Creator1 wallet
//       { userId: 3, balance: 500 },  // Creator2 wallet
//       { userId: 4, balance: 500 },  // Participant1 wallet
//       { userId: 5, balance: 1600 }, // Participant2 wallet
//       { userId: 1, balance: 1000 }, // Admin wallet
//     ]);

//     // 3. AUCTIONS
//     await queryInterface.bulkInsert('auctions', [
//       {
//         title: 'Auction 1',
//         creatorId: 2, // creator1
//         minParticipants: 2,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 1000,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'open',
//         startTime: new Date(),
//         endTime: new Date(Date.now() + 3600000),
//         relaunchTime: 5,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         title: 'Auction 2',
//         creatorId: 2, // creator1
//         minParticipants: 2,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 1000,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'closed',
//         startTime: new Date(),
//         endTime: new Date(Date.now() + 3600000),
//         relaunchTime: 5,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         title: 'Auction 3',
//         creatorId: 3, // creator2
//         minParticipants: 2,
//         maxParticipants: 5,
//         entryFee: 50,
//         maxPrice: 1000,
//         minIncrement: 10,
//         bidsPerParticipant: 3,
//         status: 'cancelled',
//         startTime: new Date(),
//         endTime: new Date(Date.now() + 3600000),
//         relaunchTime: 5,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]);

//     // 4. PARTICIPATIONS
//     await queryInterface.bulkInsert('participations', [
//       {
//         userId: 5,
//         auctionId: 2,
//         fee: 50,
//         isWinner: false,
//         isValid: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         userId: 5,
//         auctionId: 3,
//         fee: 50,
//         isWinner: true,
//         isValid: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         userId: 4,
//         auctionId: 1,
//         fee: 50,
//         isWinner: false,
//         isValid: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]);

//     // 5. BIDS
//     await queryInterface.bulkInsert('bids', [
//       { userId: 5, auctionId: 1, amount: 100 },
//       { userId: 5, auctionId: 1, amount: 150 },
//       { userId: 4, auctionId: 1, amount: 200 },
//     ]);
//   },

//   down: async (queryInterface: QueryInterface): Promise<void> => {
//     await queryInterface.bulkDelete('bids', {}, {});
//     await queryInterface.bulkDelete('participations', {}, {});
//     await queryInterface.bulkDelete('auctions', {}, {});
//     await queryInterface.bulkDelete('wallets', {}, {});
//     await queryInterface.bulkDelete('users', {}, {});
//   },
// };