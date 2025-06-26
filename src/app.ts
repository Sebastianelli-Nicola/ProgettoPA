import express from "express";
import { getSequelizeInstance } from "./DB/sequelize";
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';

const app = express();
const port = 3000;

// Inizializza Sequelize
app.use(express.json());

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Ciao da TypeScript + Docker!gedgdgdgdg 🚀");
});

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});

app.use('/auth', authRoutes);

console.log("Ciao dal tuo primo file TypeScript!");


const sequelize = getSequelizeInstance();

sequelize.authenticate()
  .then(() => console.log("Connessione al database stabilita con successo!"))
  .catch((error) => console.error("Impossibile connettersi al database:", error));

app.get("/test", (_, res) => {
  res.send('Asta Snap API attiva!');
});

export default app; 