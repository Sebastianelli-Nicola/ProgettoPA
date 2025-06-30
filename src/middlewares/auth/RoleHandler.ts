import { BaseHandler } from '../BaseHandler'; // importa la tua classe BaseHandler
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export class RoleHandler extends BaseHandler {
  constructor(private allowedRoles: string[]) {
    super();
  }

  public handle(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    if (!this.allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Accesso negato. Ruolo non autorizzato' });
      return;
    }

    super.handle(req, res, next);
  }
}
