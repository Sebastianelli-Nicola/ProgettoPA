import { AuctionService } from '../services/auctionService';

/**
 * @overview
 * Questa suite di test verifica il comportamento del metodo `joinAuction` della classe `AuctionService`.
 * Il metodo gestisce la logica di partecipazione degli utenti a un'asta, includendo controlli su:
 * - Stato dell'asta (deve essere "open" per permettere la partecipazione)
 * - Numero massimo di partecipanti
 * - Saldo del wallet dell'utente (deve essere sufficiente per pagare la quota di ingresso)
 * - Prevenzione di partecipazioni duplicate
 * 
 * I test usano DAO (Data Access Object) mockati per simulare l'interazione con il database e
 * mockano anche le transazioni di Sequelize per verificare la corretta gestione atomica delle operazioni.
 * 
 * I casi testati includono:
 * - Rifiuto della partecipazione se l'asta non è in stato "open"
 * - Rifiuto della partecipazione se il wallet ha saldo insufficiente
 * - Accettazione della partecipazione se tutte le condizioni sono soddisfatte,
 *   con verifica delle chiamate ai DAO e aggiornamenti del saldo.
 */


// Mock DAO
const mockAuctionDAO = {
  findById: jest.fn(),
  create: jest.fn(),
  getAuctions: jest.fn(),
  updateStatus: jest.fn(),
  save: jest.fn(),
  findAllClosed: jest.fn(),
};

const mockParticipationDAO = {
  countByAuction: jest.fn(),
  findParticipation: jest.fn(),
  createParticipation: jest.fn(),
};

const mockWalletDAO = {
  findByUserId: jest.fn(),
  save: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(),
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

describe('AuctionService joinAuction', () => {
  let service: AuctionService;

  beforeEach(() => {
    service = new AuctionService();
    // Iniettiamo i DAO mock nel servizio
    (service as any).auctionDAO = mockAuctionDAO;
    (service as any).participationDAO = mockParticipationDAO;
    (service as any).walletDAO = mockWalletDAO;
    (service as any).getSequelize = jest.fn(() => mockSequelize);

    // Mock transaction: esegue la callback con mockTransaction e ritorna risultato
    mockSequelize.transaction.mockImplementation(async (cb) => {
      return cb(mockTransaction);
    });

    jest.clearAllMocks();
  });

  it("consente partecipazione solo se l'asta è in stato open", async () => {
    const invalidStatuses = ['closed', 'cancelled', 'created'];

    for (const status of invalidStatuses) {
      mockAuctionDAO.findById.mockResolvedValueOnce({
        status,
        maxParticipants: 10,
        entryFee: 10,
        maxPrice: 100,
      });
      mockParticipationDAO.countByAuction.mockResolvedValueOnce(0);

      try {
        await service.joinAuction(1, 1);
        throw new Error('Expected error was not thrown');
      } catch (err: any) {
        // Controlla proprietà type oppure name o messaggio
        expect(err.type || err.name || err.message).toBeDefined();
        expect(err.type || err.name || err.message).toEqual(
          expect.stringContaining('AuctionNotOpen')
        );
      }
    }

    // Caso valido: stato open
    mockAuctionDAO.findById.mockResolvedValueOnce({
      status: 'open',
      maxParticipants: 10,
      entryFee: 10,
      maxPrice: 100,
    });
    mockParticipationDAO.countByAuction.mockResolvedValueOnce(0);
    mockWalletDAO.findByUserId.mockResolvedValueOnce({ balance: 1000 });
    mockParticipationDAO.findParticipation.mockResolvedValueOnce(null);
    mockParticipationDAO.createParticipation.mockResolvedValueOnce({});
    mockWalletDAO.save.mockResolvedValueOnce({});

    const result = await service.joinAuction(1, 1);
    expect(result).toEqual({ message: 'Partecipazione registrata con successo' });
  });

  it('rifiuta se il wallet è insufficiente', async () => {
    mockAuctionDAO.findById.mockResolvedValue({
      status: 'open',
      maxParticipants: 10,
      entryFee: 10,
      maxPrice: 100,
    });
    mockParticipationDAO.countByAuction.mockResolvedValue(0);
    mockWalletDAO.findByUserId.mockResolvedValue({ balance: 50 }); // troppo poco
    mockParticipationDAO.findParticipation.mockResolvedValue(null);

    try {
      await service.joinAuction(1, 1);
      throw new Error('Expected error was not thrown');
    } catch (err: any) {
      expect(err.type || err.name || err.message).toBeDefined();
      expect(err.type || err.name || err.message).toEqual(
        expect.stringContaining('InsufficientBalance')
      );
    }
  });

  it('accetta la partecipazione se tutto è corretto', async () => {
    mockAuctionDAO.findById.mockResolvedValue({
      status: 'open',
      maxParticipants: 10,
      entryFee: 10,
      maxPrice: 100,
    });
    mockParticipationDAO.countByAuction.mockResolvedValue(0);
    mockWalletDAO.findByUserId.mockResolvedValue({ balance: 150 });
    mockParticipationDAO.findParticipation.mockResolvedValue(null);
    mockParticipationDAO.createParticipation.mockResolvedValue({});
    mockWalletDAO.save.mockResolvedValue({});

    const res = await service.joinAuction(1, 1);
    expect(res).toEqual({ message: 'Partecipazione registrata con successo' });
    // Verifica che i DAO siano stati chiamati con i parametri giusti
    expect(mockParticipationDAO.createParticipation).toHaveBeenCalledWith(
      { userId: 1, auctionId: 1, fee: 10 },
      mockTransaction
    );
    expect(mockWalletDAO.save).toHaveBeenCalledWith(
      expect.objectContaining({ balance: 40 }),
      mockTransaction
    );
  });
});
