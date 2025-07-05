import { StatsService } from '../services/statsService';  // Aggiorna il path se serve

describe('StatsService - getUserExpenses', () => {
  let service: StatsService;

  beforeEach(() => {
    service = new StatsService();

    // Mock del statsDAO interno
    service['statsDAO'] = {
      findParticipations: jest.fn(),
      findWinningBid: jest.fn(),
    } as any;
  });

  it('calcola correttamente la spesa totale per un utente con partecipazioni e vittorie', async () => {
    const userId = 123;
    const from = new Date('2024-01-01');
    const to = new Date('2024-03-31');

    (service['statsDAO'].findParticipations as jest.Mock).mockResolvedValue([
      { fee: '10.50', isWinner: true, auctionId: 1 },
      { fee: 5.00, isWinner: false, auctionId: 2 },
      { fee: '7.25', isWinner: true, auctionId: 3 },
    ]);

    (service['statsDAO'].findWinningBid as jest.Mock).mockImplementation(async (userId, auctionId) => {
      if (auctionId === 1) return { amount: '100.00' };
      if (auctionId === 3) return { amount: 50 };
      return null;
    });

    const result = await service.getUserExpenses(userId, from, to);

    expect(result).toEqual({
      userId: 123,
      totalParticipationFees: '22.75',  // 10.50 + 5.00 + 7.25
      totalWinningSpending: '150.00',   // 100 + 50
      total: '172.75',                  // 22.75 + 150.00
      from,
      to,
    });
  });

  it('restituisce zero se nessuna partecipazione', async () => {
    (service['statsDAO'].findParticipations as jest.Mock).mockResolvedValue([]);
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
