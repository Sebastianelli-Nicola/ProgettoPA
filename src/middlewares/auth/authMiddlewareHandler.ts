import { Handler } from '../Handler';
import { JWTAuthHandler } from './JWTAuthHandler';
import { RoleHandler } from './RoleHandler';
import { Request, Response, NextFunction } from 'express';


/**
 * Converte la chain di handler in un middleware Express compatibile.
 */
const composeHandler = (firstHandler: Handler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    firstHandler.handle(req, res, next);
  };
};

/**
 * Classe che costruisce una chain di handler preconfigurata
 */
export class authMiddlewareHandler {
  /**
   * Restituisce un middleware Express basato su JWT + Role handler
   * @param allowedRoles Ruoli autorizzati
   */
  static authWithRoles(allowedRoles: string[]) {
    const jwt = new JWTAuthHandler();
    const role = new RoleHandler(allowedRoles);
    jwt.setNext(role);
    return composeHandler(jwt);
  }

  /**
   * Restituisce solo un middleware per autenticazione JWT
   */
  static jwtOnly() {
    const jwt = new JWTAuthHandler();
    return composeHandler(jwt);
  }
  
}