import cron from 'node-cron';
import { Auction } from './models/Auction';
import { Op } from 'sequelize';
import { AuctionService } from './services/auctionService';
import { AuctionDAO } from '../src/dao/auctionDAO';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const auctionService = new AuctionService();
  const auctionDao = AuctionDAO.getInstance();
  

  console.log(`[${now.toISOString()}] 🔁 Avvio scheduler automatico aste...`);

  try {
    // 1. Aste da avviare (created/open -> bidding)
    const toOpen = await auctionDao.findAllStartTime(['created', 'open'], now);

    if (toOpen.length > 0) {
      console.log(`[${now.toISOString()}] 🟢 Trovate ${toOpen.length} aste da avviare.`);
    }

    for (const a of toOpen) {
      try {
        if (a.status !== 'open') {
          console.log(`⏩ Asta ${a.id} non è nello stato 'open', ignorata.`);
          continue;
        }

        await auctionService.moveToBiddingPhase(a.id);
        console.log(`✅ Asta ${a.id} passata a 'bidding' o 'cancelled'.`);
      } catch (err) {
        console.error(`❌ Errore avvio asta ${a.id}:`, err);
      }
    }

    // 2. Aste da chiudere (bidding -> closed)
    const toClose = await auctionDao.findAllEndTime(['bidding'], now);

    if (toClose.length > 0) {
      console.log(`[${now.toISOString()}] 🔴 Trovate ${toClose.length} aste da chiudere.`);
    }

    for (const a of toClose) {
      try {
        await auctionService.finalizeAuction(a.id);
        console.log(`✅ Asta ${a.id} chiusa correttamente.`);
      } catch (err) {
        console.error(`❌ Errore chiusura asta ${a.id}:`, err);
      }
    }

    console.log(`[${now.toISOString()}] ✅ Scheduler completato.`);

  } catch (err) {
    console.error(`[${now.toISOString()}] ❌ Errore generale nello scheduler:`, err);
  }
});



// import cron from 'node-cron';
// import { Auction } from './models/Auction';
// import { Op, Sequelize } from 'sequelize';
// import { AuctionService } from './services/auctionService';

// cron.schedule('* * * * *', async () => {
//   const now = new Date();
//   const auctionService = new AuctionService();

//   console.log('cron 0')

//   try {
//     const toOpen = await Auction.findAll({
//       where: {
//         status: { [Op.in]: ['created', 'open'] },
//         startTime: { [Op.lte]: now },
//       },
//     });

//     console.log('cron toOpen:', toOpen.map(a => a.id))

//     console.log('cron 1')

//     for (const a of toOpen) {
//       console.log('Aste da avviare:', toOpen.length);
//       await auctionService.moveToBiddingPhase(a.id);
//     }

//     console.log('cron 2')

//     const toClose = await Auction.findAll({
//       where: { status: 'bidding', endTime: { [Op.lte]: now } },
//     });

//     console.log('cron 3')

//     for (const a of toClose) await auctionService.finalizeAuction(a.id);

//     console.log('cron fine')

//   } catch (e) {
//     console.error('Errore cron scheduler:', e);
//   }
// });
