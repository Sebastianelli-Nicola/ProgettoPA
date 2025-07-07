"use strict";
/**
 * @fileoverview Middleware globale per la gestione degli errori in Express.
 *
 * Questo middleware intercetta gli errori generati durante l'elaborazione delle richieste
 * e restituisce una risposta JSON con i dettagli dell'errore.
 * Gestisce sia errori personalizzati (estensione di ApplicationError)
 * che errori generici non gestiti.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorFactory_1 = require("../factory/errorFactory"); // Assicurati che il path sia corretto
/**
 * Middleware per la gestione degli errori in Express.
 * Intercetta gli errori e restituisce una risposta JSON con i dettagli dell'errore.
 *
 * @param err - L'errore da gestire
 * @param req - La richiesta HTTP
 * @param res - La risposta HTTP
 * @param next - La funzione per passare al prossimo middleware
 */
const errorHandler = (err, req, res, next) => {
    // Se è un errore gestito dalla factory
    if (err instanceof errorFactory_1.ApplicationError) {
        // Imposta lo status dell'errore se non è già definito
        res.status(err.status).json({
            error: {
                name: err.name,
                message: err.message,
            },
        });
        return;
    }
    // Errore generico o sconosciuto: usa ErrorFactory
    const genericError = errorFactory_1.ErrorFactory.createError(errorFactory_1.ErrorType.Generic, err.message);
    res.status(genericError.status).json({
        error: {
            name: genericError.name,
            message: genericError.message,
        },
    });
};
exports.errorHandler = errorHandler;
