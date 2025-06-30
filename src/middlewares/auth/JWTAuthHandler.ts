
import { BaseHandler } from '../BaseHandler'; // importa la tua classe BaseHandler
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export class JWTAuthHandler extends BaseHandler {
  public handle(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'Token non fornito' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
      (req as AuthRequest).user = decoded;
      super.handle(req, res, next); // continua nella catena
    } catch {
      res.status(403).json({ message: 'Token non valido o scaduto' });
    }
  }
}
