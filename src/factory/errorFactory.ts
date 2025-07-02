import { StatusCodes } from 'http-status-codes';

/** Tipi di errore usati nel progetto */
export enum ErrorType {
  Authentication,
  Authorization,
  Validation,
  AuctionNotFound,
  ParticipationNotFound,
  WalletNotFound,
  InsufficientBalance,
  Generic
}

export interface IAppError {
  name: string;
  message: string;
  status: number;
  stack?: string;
}

/** Errore base personalizzato */
export class ApplicationError extends Error implements IAppError {
  public status: number;

  constructor(name: string, message: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errori specifici
class AuthenticationError extends ApplicationError {
  constructor(message = 'Utente non autenticato') {
    super('AuthenticationError', message, StatusCodes.UNAUTHORIZED);
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message = 'Accesso negato') {
    super('AuthorizationError', message, StatusCodes.FORBIDDEN);
  }
}

class ValidationError extends ApplicationError {
  constructor(message = 'Errore di validazione') {
    super('ValidationError', message, StatusCodes.BAD_REQUEST);
  }
}

class AuctionNotFoundError extends ApplicationError {
  constructor(message = 'Asta non trovata') {
    super('AuctionNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class ParticipationNotFoundError extends ApplicationError {
  constructor(message = 'Partecipazione non trovata') {
    super('ParticipationNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class WalletNotFoundError extends ApplicationError {
  constructor(message = 'Wallet non trovato') {
    super('WalletNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class InsufficientBalanceError extends ApplicationError {
  constructor(message = 'Credito insufficiente') {
    super('InsufficientBalanceError', message, StatusCodes.PAYMENT_REQUIRED);
  }
}

class GenericError extends ApplicationError {
  constructor(message = 'Errore interno del server') {
    super('GenericError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/** Factory per generare errori in modo centralizzato */
export class ErrorFactory {
  static createError(type: ErrorType, message?: string): IAppError {
    switch (type) {
      case ErrorType.Authentication:
        return new AuthenticationError(message);
      case ErrorType.Authorization:
        return new AuthorizationError(message);
      case ErrorType.Validation:
        return new ValidationError(message);
      case ErrorType.AuctionNotFound:
        return new AuctionNotFoundError(message);
      case ErrorType.ParticipationNotFound:
        return new ParticipationNotFoundError(message);
      case ErrorType.WalletNotFound:
        return new WalletNotFoundError(message);
      case ErrorType.InsufficientBalance:
        return new InsufficientBalanceError(message);
      default:
        return new GenericError(message);
    }
  }
}
