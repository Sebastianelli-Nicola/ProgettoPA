import { Request, Response, NextFunction } from 'express';
import { Handler } from './Handler';

export abstract class BaseHandler implements Handler {
  private nextHandler: Handler | null = null;

  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    if (this.nextHandler) {
      this.nextHandler.handle(req, res, next);
    } else {
      next();
    }
  }
}
