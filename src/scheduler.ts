import cron from 'node-cron';
import { Auction } from './models/Auction';
import { Op, Sequelize } from 'sequelize';
import { AuctionService } from './services/auctionService';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const auctionService = new AuctionService();

  try {
    const toOpen = await Auction.findAll({
      where: {
        status: { [Op.in]: ['created', 'open'] },
        startTime: { [Op.lte]: now },
      },
    });
    for (const a of toOpen) {
      console.log('Aste da avviare:', toOpen.length);
      await auctionService.moveToBiddingPhase(a.id);
    }

    const toClose = await Auction.findAll({
      where: { status: 'bidding', endTime: { [Op.lte]: now } },
    });
    for (const a of toClose) await auctionService.finalizeAuction(a.id);

  } catch (e) {
    console.error('Errore cron scheduler:', e);
  }
});
