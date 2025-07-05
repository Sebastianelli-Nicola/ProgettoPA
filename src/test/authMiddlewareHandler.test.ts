import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddlewareHandler } from '../middlewares/auth/authMiddlewareHandler';
import dotenv from 'dotenv';

dotenv.config();

describe('authMiddlewareHandler.authWithRoles middleware', () => {
  const SECRET = process.env.JWT_SECRET || 'test-secret';

  const mockResponse = () => {
    return {} as Response;
  };

  const mockNext = () => jest.fn() as jest.MockedFunction<NextFunction>;

//   test('dovrebbe rispondere con 401 se manca Authorization header', async () => {
//     const req = {
//       headers: {}
//     } as Request;

//     const res = mockResponse();
//     const next = mockNext();

//     const middleware = authMiddlewareHandler.authWithRoles(['admin']);
//     await middleware(req, res, next);

//     expect(next).toHaveBeenCalledWith(expect.objectContaining({
//       status: 401,
//       message: expect.stringMatching(/Authorization header mancante/i)
//     }));
//   });
    test('dovrebbe rispondere con 401 se manca Authorization header', async () => {
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


  test('dovrebbe rispondere con 401 se il token è non valido', async () => {
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

  test('dovrebbe rispondere con 403 se il ruolo non è autorizzato', async () => {
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

  test('dovrebbe chiamare next se il token è valido e il ruolo è autorizzato', async () => {
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
