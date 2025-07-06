import cron from 'node-cron';
import { Auction } from './models/Auction';
import { Op } from 'sequelize';
import { broadcastToAuction } from './websocket/websockethandlers';
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

    for (const auction of toOpen) {
      try {
        if (auction.status !== 'open') {
          console.log(`⏩ Asta ${auction.id} non è nello stato 'open', ignorata.`);
          continue;
        }

        const result = await auctionService.startAuction(auction.id);

        // Notifica la chiusura per partecipanti insufficienti
        if (result.closed) {
          broadcastToAuction(auction.id, {
            type: 'auction_closed',
            reason: result.reason,
          });
          console.log(`🚫 Asta ${auction.id} chiusa: ${result.reason}`);
        } else if (result.started) {
          broadcastToAuction(auction.id, {
            type: 'auction_started',
            auctionId: auction.id,
          });
          console.log(`🚀 Asta ${auction.id} avviata con successo (passata a 'bidding' o 'cancelled').`);
        }
      } catch (err) {
        console.error(`❌ Errore avvio asta ${auction.id}:`, err);
      }
    }

    // 2. Aste da chiudere (bidding -> closed)
    const toClose = await auctionDao.findAllEndTime(['bidding'], now);

    if (toClose.length > 0) {
      console.log(`[${now.toISOString()}] 🔴 Trovate ${toClose.length} aste da chiudere.`);
    }

    for (const auction of toClose) {
      try {
        const result = await auctionService.closeAuction(auction.id);
        // Notifica la chiusura dell'asta tramite websocket
        broadcastToAuction(auction.id, {
          type: 'auction_closed',
          winnerId: result.winnerId,
          finalAmount: result.finalAmount,
        });
        console.log(`✅ Asta ${auction.id} chiusa correttamente.`);
      } catch (err) {
        console.error(`❌ Errore chiusura asta ${auction.id}:`, err);
      }
    }

    console.log(`[${now.toISOString()}] ✅ Scheduler completato.`);

  } catch (err) {
    console.error(`[${now.toISOString()}] ❌ Errore generale nello scheduler:`, err);
  }
});


