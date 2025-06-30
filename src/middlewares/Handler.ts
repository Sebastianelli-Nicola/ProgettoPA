
import { Request, Response, NextFunction } from 'express';

export interface Handler {
  setNext(handler: Handler): Handler;
  handle(req: Request, res: Response, next: NextFunction): void;
}
