"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// Questo middleware gestisce gli errori generati durante l'elaborazione delle richieste.
const errorHandler = (err, req, res, next) => {
    console.error('Errore:', err.message);
    res.status(500).json({
        message: 'Errore interno del server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
exports.errorHandler = errorHandler;
