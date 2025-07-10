import { StatsService } from '../services/statsService';

/**
 * @overview
 * Test suite per `StatsService.getUserExpenses`, che calcola le spese totali sostenute da un utente
 * in base alle partecipazioni alle aste e alle vittorie ottenute.
 *
 * I test coprono:
 * - Il calcolo della somma delle fee di partecipazione.
 * - Il calcolo dell'importo totale speso in offerte vincenti.
 * - La restituzione di un oggetto aggregato con i totali e gli estremi temporali.
 * - La gestione del caso in cui l'utente non abbia partecipato ad alcuna asta.
 *
 * I DAO `participationDAO` e `bidDAO` sono mockati con Jest per garantire l’isolamento e il controllo completo dei dati.
 */


describe('StatsService - getUserExpenses', () => {
  let service: StatsService;

  beforeEach(() => {
    service = new StatsService();

    service['participationDAO'] = {
      findAllByUserWithDateAndAuction: jest.fn(),
    } as any;

    service['bidDAO'] = {
      findTopBidByAuction: jest.fn(),
    } as any;
  });

  it('calcola correttamente la spesa totale per un utente con partecipazioni e vittorie', async () => {
    const userId = 123;
    const from = new Date('2024-01-01');
    const to = new Date('2024-03-31');

    (service['participationDAO'].findAllByUserWithDateAndAuction as jest.Mock).mockResolvedValue([
      { fee: '10.50', isWinner: true, auctionId: 1 },
      { fee: 5.00, isWinner: false, auctionId: 2 },
      { fee: '7.25', isWinner: true, auctionId: 3 },
    ]);

    (service['bidDAO'].findTopBidByAuction as jest.Mock).mockImplementation(async (auctionId) => {
      if (auctionId === 1) return { amount: '100.00' };
      if (auctionId === 3) return { amount: 50 };
      return null;
    });

    const result = await service.getUserExpenses(userId, from, to);

    expect(result).toEqual({
      userId: 123,
      totalParticipationFees: '22.75',
      totalWinningSpending: '150.00',
      total: '172.75',
      from,
      to,
    });
  });

  it('restituisce zero se nessuna partecipazione', async () => {
    (service['participationDAO'].findAllByUserWithDateAndAuction as jest.Mock).mockResolvedValue([]);

    const result = await service.getUserExpenses(456);

    expect(result).toEqual({
      userId: 456,
      totalParticipationFees: '0.00',
      totalWinningSpending: '0.00',
      total: '0.00',
      from: null,
      to: null,
    });
  });
});
