/**
 * @fileoverview
 * 
 * Questo file definisce una struttura centralizzata per la gestione degli errori
 * personalizzati nell'applicazione, specificando tipi di errore (enum `ErrorType`),
 * una classe base per gli errori (`ApplicationError`), e una factory (`ErrorFactory`)
 * per generare istanze di errore coerenti con il tipo.
 * Viene anche gestita l’associazione con gli status HTTP attraverso il modulo `http-status-codes`.
 */

import { StatusCodes } from 'http-status-codes'

/** Enum che rappresenta i tipi di errore utilizzabili */
export enum ErrorType {
  Authentication,
  Authorization,
  InvalidUserId,
  Validation,
  AuctionNotFound,
  ParticipationNotFound,
  WalletNotFound,
  WinnerNotFound, 
  BidsViewNotAllowed,      
  BidsViewNotAuthorized,
  NotParticipant,      
  BidLimitReached,
  InsufficientBalance,
  MissingData,
  InvalidFromDate, 
  InvalidToDate, 
  InvalidRole,
  InvalidAuctionStatus,
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
  AuctionStartFailed,
  AuctionCloseFailed,
  InvalidDateRange,
  MigrationOrSeed,
  Scheduler,
  Generic
}

/** Interfaccia che rappresenta la struttura comune per gli errori */
export interface AppError {
  name: string;
  message: string;
  status: number;
  stack?: string;
}


/** 
 * Classe base per tutti gli errori personalizzati 
 * Estende la classe `Error` nativa e implementa l'interfaccia `AppError`
 */
export class ApplicationError extends Error implements AppError {
  public status: number;

  constructor(name: string, message: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Di seguito vengono definite varie classi specifiche di errore,
// ognuna estende ApplicationError e rappresenta un errore specifico dell'app.

/** Errore per autenticazione mancante o fallita */
class AuthenticationError extends ApplicationError {
  constructor(message = 'Utente non autenticato') {
    super('AuthenticationError', message, StatusCodes.UNAUTHORIZED);
  }
}

/** Errore per mancanza di autorizzazione */
class AuthorizationError extends ApplicationError {
  constructor(message = 'Accesso negato') {
    super('AuthorizationError', message, StatusCodes.FORBIDDEN);
  }
}

/** Errore per ID utente non valido */
class InvalidUserIdError extends ApplicationError {
  constructor(message = 'ID utente non valido o mancante') {
    super('InvalidUserIdError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore di validazione generico */
class ValidationError extends ApplicationError {
  constructor(message = 'Errore di validazione') {
    super('ValidationError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per asta non trovata */
class AuctionNotFoundError extends ApplicationError {
  constructor(message = 'Asta non trovata') {
    super('AuctionNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per partecipazione non trovata */
class ParticipationNotFoundError extends ApplicationError {
  constructor(message = 'Partecipazione non trovata') {
    super('ParticipationNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per wallet non trovato */
class WalletNotFoundError extends ApplicationError {
  constructor(message = 'Wallet non trovato') {
    super('WalletNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per tentata visualizzazione rilanci in fase non valida */
class BidsViewNotAllowedError extends ApplicationError {
  constructor(message = 'Non puoi visualizzare i rilanci: asta non in fase di rilancio') {
    super('BidsViewNotAllowedError', message, StatusCodes.FORBIDDEN);
  }
}

/** Errore per accesso non autorizzato alla visualizzazione dei rilanci */
class BidsViewNotAuthorizedError extends ApplicationError {
  constructor(message = 'Non sei autorizzato a visualizzare i rilanci di questa asta') {
    super('BidsViewNotAuthorizedError', message, StatusCodes.FORBIDDEN);
  }
}

/** Errore per utente non partecipante all’asta */
class NotParticipantError extends ApplicationError {
  constructor(message = 'Non hai partecipato a questa asta') {
    super('NotParticipantError', message, StatusCodes.FORBIDDEN);
  }
}

/** Errore per vincitore non trovato */
class WinnerNotFoundError extends ApplicationError {
  constructor(message = 'Nessun vincitore trovato') {
    super('WinnerNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per superamento limite di rilanci */
class BidLimitReachedError extends ApplicationError {
  constructor(message = 'Hai esaurito le offerte disponibili per questa asta') {
    super('BidLimitReachedError', message, StatusCodes.FORBIDDEN);
  }
}

/** Errore per parametro "from" non valido */
class InvalidFromDateError extends ApplicationError {
  constructor(message = 'Parametro "from" non è una data valida') {
    super('InvalidFromDateError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per parametro "to" non valido */
class InvalidToDateError extends ApplicationError {
  constructor(message = 'Parametro "to" non è una data valida') {
    super('InvalidToDateError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per ruolo non valido */
class InvalidRoleError extends ApplicationError {
  constructor(message = 'Il ruolo può essere solo: admin, bid-creator o bid-participant') {
    super('InvalidRoleError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per stato asta non valido */
class InvalidAuctionStatusError extends ApplicationError {
  constructor(message = 'L\'asta non è nello stato corretto') {
    super('InvalidAuctionStatusError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per tentata iscrizione ad asta non aperta */
class AuctionNotOpenError extends ApplicationError {
  constructor(message = "L'asta non è aperta per le iscrizioni") {
    super('AuctionNotOpenError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per raggiungimento limite massimo di partecipanti */
class MaxParticipantsReachedError extends ApplicationError {
  constructor(message = 'Numero massimo di partecipanti raggiunto') {
    super('MaxParticipantsReachedError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per utente già iscritto */
class AlreadyJoinedError extends ApplicationError {
  constructor(message = 'Utente già iscritto') {
    super('AlreadyJoinedError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per credito insufficiente */
class InsufficientBalanceError extends ApplicationError {
  constructor(message = 'Credito insufficiente') {
    super('InsufficientBalanceError', message, StatusCodes.PAYMENT_REQUIRED);
  }
}

/** Errore per dati mancanti nella richiesta */
class MissingDataError extends ApplicationError {
  constructor(message = 'Dati mancanti') {
    super('MissingDataError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per credenziali mancanti (email e password) */
class MissingCredentialsError extends ApplicationError {
  constructor(message = 'Email e password sono obbligatori') {
    super('MissingCredentialsError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per header di autenticazione mancante */
class MissingAuthHeaderError extends ApplicationError {
  constructor(message = 'Header di autenticazione mancante') {
    super('MissingAuthHeaderError', message, StatusCodes.UNAUTHORIZED);
  }
}

/** Errore per header payload mancante */
class MissingPayloadHeaderError extends ApplicationError {
  constructor(message = 'Header payload mancante') {
    super('MissingPayloadHeaderError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per token mancante */
class MissingTokenError extends ApplicationError {
  constructor(message = 'Token mancante') {
    super('MissingTokenError', message, StatusCodes.UNAUTHORIZED);
  }
}

/** Errore per token non valido */
class InvalidTokenError extends ApplicationError {
  constructor(message = 'Token non valido') {
    super('InvalidTokenError', message, StatusCodes.UNAUTHORIZED);
  }
}

/** Errore per payload malformato */
class MalformedPayloadError extends ApplicationError {
  constructor(message = 'Payload malformato') {
    super('MalformedPayloadError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per rotta non trovata */
class RouteNotFoundError extends ApplicationError {
  constructor(message = 'Rotta non trovata') {
    super('RouteNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per servizio non disponibile */
class ServiceUnavailableError extends ApplicationError {
  constructor(message = 'Servizio non disponibile') {
    super('ServiceUnavailableError', message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

/** Errore generico di richiesta non valida */
class BadRequestError extends ApplicationError {
  constructor(message = 'Richiesta non valida') {
    super('BadRequestError', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore per utente non trovato */
class UserNotFoundError extends ApplicationError {
  constructor(message = 'Utente non trovato') {
    super('UserNotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore per email già in uso */
class EmailAlreadyUseError extends ApplicationError {
  constructor(message = 'Email già in uso') {
    super('EmailAlreadyUseError', message, StatusCodes.CONFLICT);
  }
}

/** Errore per username già in uso */
class UsernameAlreadyUse extends ApplicationError {
  constructor(message = 'Username già in uso') {
    super('UsernameAlreadyUseError', message, StatusCodes.CONFLICT);
  }
}

/** Errore generico per risorsa non trovata */
class NotFoundError extends ApplicationError {
  constructor(message = 'Risorsa non trovata') {
    super('NotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

/** Errore generato se l'asta non riesce ad avviarsi */
class AuctionStartFailedError extends ApplicationError {
  constructor(message = "Errore durante l'avvio dell'asta") {
    super('AuctionStartFailedError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/** Errore generato se l'asta non riesce a chiudersi */
class AuctionCloseFailedError extends ApplicationError {
  constructor(message = "Errore durante la chiusura dell'asta") {
    super('AuctionCloseFailedError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/** Errore generico legato allo scheduler */
class SchedulerError extends ApplicationError {
  constructor(message = 'Errore generale nello scheduler') {
    super('SchedulerError', message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

/** Errore per intervallo di date non valido */
class InvalidDateRangeError extends ApplicationError {
  constructor(message = 'Intervallo di date non valido') {
    super('InvalidDateRange', message, StatusCodes.BAD_REQUEST);
  }
}

/** Errore durante le migrazioni o i seed */
class MigrationOrSeedError extends ApplicationError {
  constructor(message = 'Errore durante le migrazioni o i seed') {
    super('MigrationOrSeedError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


/** Errore generico interno al server */
class GenericError extends ApplicationError {
  constructor(message = 'Errore interno del server') {
    super('GenericError', message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Factory centralizzata per creare istanze di errore
 * in base al tipo definito nell'enum `ErrorType`
 */
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
      case ErrorType.WinnerNotFound:
        return new WinnerNotFoundError(message);
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
      case ErrorType.InvalidRole:
        return new InvalidRoleError(message);
      case ErrorType.InvalidAuctionStatus:
        return new InvalidAuctionStatusError(message);
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
      case ErrorType.AuctionStartFailed:
        return new AuctionStartFailedError(message);
      case ErrorType.AuctionCloseFailed:
        return new AuctionCloseFailedError(message);
      case ErrorType.Scheduler:
        return new SchedulerError(message);
      case ErrorType.InvalidDateRange:
        return new InvalidDateRangeError(message);
      case ErrorType.MigrationOrSeed:
        return new MigrationOrSeedError(message)
      default:
        return new GenericError(message);
    }
  }
}

