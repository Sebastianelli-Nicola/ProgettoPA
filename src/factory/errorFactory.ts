import { StatusCodes } from 'http-status-codes'

/** Tipi di errore usati nel progetto */
export enum ErrorType {
  Authentication,
  Authorization,
  InvalidUserId,
  Validation,
  AuctionNotFound,
  ParticipationNotFound,
  WalletNotFound,
  BidsViewNotAllowed,      
  BidsViewNotAuthorized,
  NotParticipant,       
  BidLimitReached,
  InsufficientBalance,
  MissingData,
  InvalidFromDate, 
  InvalidToDate, 
  AuctionNotOpen,              
  MaxParticipantsReached,      
  AlreadyJoined,   
  MissingCredentials,
  MissingAuthHeader,
  MissingPayloadHeader,
  MissingToken,
  InvalidToken,
  MalformedPayload,
  RouteNotFound,
  ServiceUnavailable,
  BadRequest,
  UserNotFound,
  EmailAlreadyUse,
  UsernameAlreadyUse,
  NotFound,
  Generic
}

export interface AppError {
  name: string;
  message: string;
  status: number;
  stack?: string;
}

/** Errore base personalizzato */
export class ApplicationError extends Error implements AppError {
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

class InvalidUserIdError extends ApplicationError {
  constructor(message = 'ID utente non valido o mancante') {
    super('InvalidUserIdError', message, StatusCodes.UNAUTHORIZED);
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

class BidsViewNotAllowedError extends ApplicationError {
  constructor(message = 'Non puoi visualizzare i rilanci: asta non in fase di rilancio') {
    super('BidsViewNotAllowedError', message, StatusCodes.FORBIDDEN);
  }
}

class BidsViewNotAuthorizedError extends ApplicationError {
  constructor(message = 'Non sei autorizzato a visualizzare i rilanci di questa asta') {
    super('BidsViewNotAuthorizedError', message, StatusCodes.FORBIDDEN);
  }
}

class NotParticipantError extends ApplicationError {
  constructor(message = 'Non hai partecipato a questa asta') {
    super('NotParticipantError', message, StatusCodes.FORBIDDEN);
  }
}

class BidLimitReachedError extends ApplicationError {
  constructor(message = 'Hai esaurito le offerte disponibili per questa asta') {
    super('BidLimitReachedError', message, StatusCodes.FORBIDDEN);
  }
}

class InvalidFromDateError extends ApplicationError {
  constructor(message = 'Parametro "from" non è una data valida') {
    super('InvalidFromDateError', message, StatusCodes.BAD_REQUEST);
  }
}

class InvalidToDateError extends ApplicationError {
  constructor(message = 'Parametro "to" non è una data valida') {
    super('InvalidToDateError', message, StatusCodes.BAD_REQUEST);
  }
}

class AuctionNotOpenError extends ApplicationError {
  constructor(message = "L'asta non è aperta per le iscrizioni") {
    super('AuctionNotOpenError', message, StatusCodes.BAD_REQUEST);
  }
}

class MaxParticipantsReachedError extends ApplicationError {
  constructor(message = 'Numero massimo di partecipanti raggiunto') {
    super('MaxParticipantsReachedError', message, StatusCodes.BAD_REQUEST);
  }
}

class AlreadyJoinedError extends ApplicationError {
  constructor(message = 'Utente già iscritto') {
    super('AlreadyJoinedError', message, StatusCodes.BAD_REQUEST);
  }
}

class InsufficientBalanceError extends ApplicationError {
  constructor(message = 'Credito insufficiente') {
    super('InsufficientBalanceError', message, StatusCodes.PAYMENT_REQUIRED);
  }
}

class MissingDataError extends ApplicationError {
  constructor(message = 'Dati mancanti') {
    super('MissingDataError', message, StatusCodes.BAD_REQUEST);
  }
}

class MissingCredentialsError extends ApplicationError {
  constructor(message = 'Email e password sono obbligatori') {
    super('MissingCredentialsError', message, StatusCodes.BAD_REQUEST);
  }
}

class MissingAuthHeaderError extends ApplicationError {
  constructor(message = 'Header di autenticazione mancante') {
    super('MissingAuthHeaderError', message, StatusCodes.UNAUTHORIZED);
  }
}

class MissingPayloadHeaderError extends ApplicationError {
  constructor(message = 'Header payload mancante') {
    super('MissingPayloadHeaderError', message, StatusCodes.BAD_REQUEST);
  }
}

class MissingTokenError extends ApplicationError {
  constructor(message = 'Token mancante') {
    super('MissingTokenError', message, StatusCodes.UNAUTHORIZED);
  }
}

class InvalidTokenError extends ApplicationError {
  constructor(message = 'Token non valido') {
    super('InvalidTokenError', message, StatusCodes.UNAUTHORIZED);
  }
}

class MalformedPayloadError extends ApplicationError {
  constructor(message = 'Payload malformato') {
    super('MalformedPayloadError', message, StatusCodes.BAD_REQUEST);
  }
}

class RouteNotFoundError extends ApplicationError {
  constructor(message = 'Rotta non trovata') {
    super('RouteNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class ServiceUnavailableError extends ApplicationError {
  constructor(message = 'Servizio non disponibile') {
    super('ServiceUnavailableError', message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

class BadRequestError extends ApplicationError {
  constructor(message = 'Richiesta non valida') {
    super('BadRequestError', message, StatusCodes.BAD_REQUEST);
  }
}

class UserNotFoundError extends ApplicationError {
  constructor(message = 'Utente non trovato') {
    super('UserNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class EmailAlreadyUseError extends ApplicationError {
  constructor(message = 'Email già in uso') {
    super('EmailAlreadyUseError', message, StatusCodes.CONFLICT);
  }
}

class UsernameAlreadyUse extends ApplicationError {
  constructor(message = 'Username già in uso') {
    super('UsernameAlreadyUseError', message, StatusCodes.CONFLICT);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Risorsa non trovata') {
    super('NotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

class GenericError extends ApplicationError {
  constructor(message = 'Errore interno del server') {
    super('GenericError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/** Factory per generare errori in modo centralizzato */
export class ErrorFactory {
  static createError(type: ErrorType, message?: string): AppError {
    switch (type) {
      case ErrorType.Authentication:
        return new AuthenticationError(message);
      case ErrorType.Authorization:
        return new AuthorizationError(message);
      case ErrorType.InvalidUserId:
        return new InvalidUserIdError(message);
      case ErrorType.Validation:
        return new ValidationError(message);
      case ErrorType.AuctionNotFound:
        return new AuctionNotFoundError(message);
      case ErrorType.ParticipationNotFound:
        return new ParticipationNotFoundError(message);
      case ErrorType.WalletNotFound:
        return new WalletNotFoundError(message);
      case ErrorType.BidsViewNotAllowed:
        return new BidsViewNotAllowedError(message);
      case ErrorType.BidsViewNotAuthorized:
        return new BidsViewNotAuthorizedError(message);
      case ErrorType.NotParticipant:
        return new NotParticipantError(message);
      case ErrorType.BidLimitReached:
        return new BidLimitReachedError(message);
      case ErrorType.InvalidFromDate:
        return new InvalidFromDateError(message);
      case ErrorType.InvalidToDate:
        return new InvalidToDateError(message);
      case ErrorType.AuctionNotOpen:
        return new AuctionNotOpenError(message);
      case ErrorType.MaxParticipantsReached:
        return new MaxParticipantsReachedError(message);
      case ErrorType.AlreadyJoined:
        return new AlreadyJoinedError(message);
      case ErrorType.InsufficientBalance:
        return new InsufficientBalanceError(message);
      case ErrorType.MissingData:
        return new MissingDataError(message);
      case ErrorType.MissingCredentials:
        return new MissingCredentialsError(message);
      case ErrorType.MissingAuthHeader:
        return new MissingAuthHeaderError(message);
      case ErrorType.MissingPayloadHeader:
        return new MissingPayloadHeaderError(message);
      case ErrorType.MissingToken:
        return new MissingTokenError(message);
      case ErrorType.InvalidToken:
        return new InvalidTokenError(message);
      case ErrorType.MalformedPayload:
        return new MalformedPayloadError(message);
      case ErrorType.RouteNotFound:
        return new RouteNotFoundError(message);
      case ErrorType.ServiceUnavailable:
        return new ServiceUnavailableError(message);
      case ErrorType.BadRequest:
        return new BadRequestError(message);
      case ErrorType.UserNotFound:
        return new UserNotFoundError(message);
      case ErrorType.EmailAlreadyUse:
        return new EmailAlreadyUseError(message);
      case ErrorType.UsernameAlreadyUse:
        return new UsernameAlreadyUse(message);
      case ErrorType.NotFound:
        return new NotFoundError(message);
      default:
        return new GenericError(message);
    }
  }
}


// import { StatusCodes } from 'http-status-codes';

// /** Tipi di errore usati nel progetto */
// export enum ErrorType {
//   Authentication,
//   Authorization,
//   Validation,
//   AuctionNotFound,
//   ParticipationNotFound,
//   WalletNotFound,
//   InsufficientBalance,
//   Generic
// }

// export interface IAppError {
//   name: string;
//   message: string;
//   status: number;
//   stack?: string;
// }

// /** Errore base personalizzato */
// export class ApplicationError extends Error implements IAppError {
//   public status: number;

//   constructor(name: string, message: string, status: number) {
//     super(message);
//     this.name = name;
//     this.status = status;
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// // Errori specifici
// class AuthenticationError extends ApplicationError {
//   constructor(message = 'Utente non autenticato') {
//     super('AuthenticationError', message, StatusCodes.UNAUTHORIZED);
//   }
// }

// class AuthorizationError extends ApplicationError {
//   constructor(message = 'Accesso negato') {
//     super('AuthorizationError', message, StatusCodes.FORBIDDEN);
//   }
// }

// class ValidationError extends ApplicationError {
//   constructor(message = 'Errore di validazione') {
//     super('ValidationError', message, StatusCodes.BAD_REQUEST);
//   }
// }

// class AuctionNotFoundError extends ApplicationError {
//   constructor(message = 'Asta non trovata') {
//     super('AuctionNotFoundError', message, StatusCodes.NOT_FOUND);
//   }
// }

// class ParticipationNotFoundError extends ApplicationError {
//   constructor(message = 'Partecipazione non trovata') {
//     super('ParticipationNotFoundError', message, StatusCodes.NOT_FOUND);
//   }
// }

// class WalletNotFoundError extends ApplicationError {
//   constructor(message = 'Wallet non trovato') {
//     super('WalletNotFoundError', message, StatusCodes.NOT_FOUND);
//   }
// }

// class InsufficientBalanceError extends ApplicationError {
//   constructor(message = 'Credito insufficiente') {
//     super('InsufficientBalanceError', message, StatusCodes.PAYMENT_REQUIRED);
//   }
// }

// class GenericError extends ApplicationError {
//   constructor(message = 'Errore interno del server') {
//     super('GenericError', message, StatusCodes.INTERNAL_SERVER_ERROR);
//   }
// }

// /** Factory per generare errori in modo centralizzato */
// export class ErrorFactory {
//   static createError(type: ErrorType, message?: string): IAppError {
//     switch (type) {
//       case ErrorType.Authentication:
//         return new AuthenticationError(message);
//       case ErrorType.Authorization:
//         return new AuthorizationError(message);
//       case ErrorType.Validation:
//         return new ValidationError(message);
//       case ErrorType.AuctionNotFound:
//         return new AuctionNotFoundError(message);
//       case ErrorType.ParticipationNotFound:
//         return new ParticipationNotFoundError(message);
//       case ErrorType.WalletNotFound:
//         return new WalletNotFoundError(message);
//       case ErrorType.InsufficientBalance:
//         return new InsufficientBalanceError(message);
//       default:
//         return new GenericError(message);
//     }
//   }
// }
