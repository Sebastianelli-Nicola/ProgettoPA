import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler';
import dotenv from 'dotenv';

/**
 * @overview
 * Questa suite di test verifica il corretto funzionamento del middleware `authWithRoles` fornito
 * da `authMiddlewareHandler`. Il middleware ha il compito di autenticare le richieste HTTP
 * tramite token JWT e di autorizzare l'accesso in base ai ruoli specificati.
 * 
 * I test coprono i seguenti casi:
 * - Mancanza dell'header di autorizzazione (Authorization header)
 * - Token JWT non valido
 * - Token valido ma con ruolo non autorizzato
 * - Token valido con ruolo autorizzato, in cui la richiesta procede senza errori
 * 
 * Il middleware, in caso di errori di autenticazione o autorizzazione, chiama `next()` con un errore
 * appropriato, mentre in caso di successo aggiunge i dati dell'utente alla richiesta e chiama `next()` senza errori.
 */

dotenv.config();

describe('authMiddlewareHandler.authWithRoles middleware', () => {
  const SECRET = process.env.JWT_SECRET || 'test-secret';

  const mockResponse = () => {
    return {} as Response;
  };

  const mockNext = () => jest.fn() as jest.MockedFunction<NextFunction>;

  // Test per Authorization header mancante
  it('dovrebbe rispondere con 401 se manca Authorization header', async () => {
    const req = {
      headers: {}
    } as Request;

    const res = {} as Response;
    const next = jest.fn();

    const middleware = authMiddlewareHandler.authWithRoles(['admin']);
    await middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(401);
    expect(error.message).toMatch(/autenticazione mancante/i);
  });

  // Test per token non valido
  it('dovrebbe rispondere con 401 se il token è non valido', async () => {
    const req = {
      headers: { authorization: 'Bearer tokenNonValido' }
    } as Request;

    const res = mockResponse();
    const next = mockNext();

    const middleware = authMiddlewareHandler.authWithRoles(['admin']);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 401,
      message: expect.stringMatching(/Token non valido/i)
    }));
  });

  // Test per token valido ma ruolo non autorizzato
  it('dovrebbe rispondere con 403 se il ruolo non è autorizzato', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` }
    } as Request;

    const res = mockResponse();
    const next = mockNext();

    const middleware = authMiddlewareHandler.authWithRoles(['admin']);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 403,
      message: expect.stringMatching(/Ruolo non autorizzato/i)
    }));
  });

  // Test per token valido e ruolo autorizzato
  it('dovrebbe chiamare next se il token è valido e il ruolo è autorizzato', async () => {
    const payload = { id: 42, role: 'admin' };
    const token = jwt.sign(payload, SECRET);

    const req = {
      headers: { authorization: `Bearer ${token}` }
    } as Request;

    const res = mockResponse();
    const next = mockNext();

    const middleware = authMiddlewareHandler.authWithRoles(['admin']);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // Nessun errore
    expect((req as any).user).toMatchObject(payload); // Utente impostato correttamente
  });
});
