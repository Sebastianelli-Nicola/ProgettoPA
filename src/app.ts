import express from "express";
import http from "http";
import { initWebSocket } from "./websocket/websocketServer"; // <- rinominato come suggerito
import { getSequelizeInstance } from "./DB/sequelize";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import auctionRoutes from "./routes/auction";
import bidRoutes from './routes/bid';
import walletRoutes from './routes/wallet';
import statsRoutes from './routes/stats';

// Inizializza app Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware JSON
app.use(express.json());

// Rotte principali
app.use("/auth", authRoutes);
app.use("/auction", auctionRoutes);
app.use('/auction', bidRoutes);
app.use('/wallet', walletRoutes);
app.use('/api', auctionRoutes);
app.use('/stats', statsRoutes);


// Test route
app.get("/", (_, res) => {res.send("🚀 API AuctionSnap avviata!")});
app.get("/test", (_, res) => {res.send("✅ Test OK!");});

// Middleware globale per la gestione degli errori
app.use(errorHandler);

// Connetti al DB
const sequelize = getSequelizeInstance();
sequelize.authenticate()
  .then(() => console.log("✅ Connessione al database stabilita con successo!"))
  .catch((error) => console.error("❌ Errore connessione DB:", error));

// Server HTTP + WebSocket
const server = http.createServer(app);
initWebSocket(server); // <== INIZIALIZZA WEBSOCKET SERVER

server.listen(port, () => {
  console.log(`🚀 Server attivo su http://localhost:${port}`);
});

export default app;
