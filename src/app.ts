/**
 * @fileoverview Modulo principale di configurazione e inizializzazione del server.
 * 
 * Questo modulo configura il server Express insieme al suo middleware, alle rotte e al server WebSocket. 
 * Gestisce le seguenti funzionalità chiave:
 * 
 * - Carica le variabili d'ambiente dal file .env.
 * - Configura e inizializza il middleware per l'autenticazione e la gestione degli errori.
 * - Definisce le rotte API per l'autenticazione, le aste, le puntate, i portafogli e le statistiche.
 * - Gestisce la connessione al database utilizzando Sequelize.
 * - Avvia il server HTTP e il server WebSocket per la comunicazione in tempo reale.
 *  
 * Questo file è il punto di ingresso dell'applicazione e avvia il server Express su una porta specificata.
 */

import express from "express";
import http from "http";
import dotenv from 'dotenv';
import { initWebSocket } from "./websocket/websocketServer"; // <- rinominato come suggerito
import { getSequelizeInstance } from "./DB/sequelize";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import auctionRoutes from "./routes/auction";
import bidRoutes from './routes/bid';
import walletRoutes from './routes/wallet';
import statsRoutes from './routes/stats';
import './scheduler';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Inizializza app Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware per il parsing del JSON
app.use(express.json());

// Rotte principali
app.use("/auth", authRoutes);         // Rotte per l'autenticazione
app.use("/auction", auctionRoutes);   // Rotte per le aste
app.use('/auction', bidRoutes);       // Rotte per le puntate
app.use('/wallet', walletRoutes);     // Rotte per i portafogli degli utenti
app.use('/stats', statsRoutes);       // Rotte per le statistiche


// Test route
app.get("/", (_, res) => {res.send("API AuctionSnap avviata!")});
app.get("/test", (_, res) => {res.send("Test OK!");});

// Middleware globale per la gestione degli errori
app.use(errorHandler);

// Connessione al database
// Inizializza l'istanza di Sequelize e autentica la connessione al database
const sequelize = getSequelizeInstance(); 
sequelize.authenticate()
  .then(() => console.log("✅ Connessione al database stabilita con successo!"))
  .catch((error) => console.error("Errore connessione DB:", error));

// Avvia il server HTTP e inizializza il WebSocket
// Crea un server HTTP utilizzando l'app Express e inizializza il WebSocket server
const server = http.createServer(app);
initWebSocket(server); // <== INIZIALIZZA WEBSOCKET SERVER

// Avvia il server sulla porta specificata
server.listen(port, () => {
  console.log(`🚀 Server attivo su http://localhost:${port}`);
});

export default app; 
