import express from "express";
import { getSequelizeInstance } from "./DB/sequelize";
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';

const app = express();
const port = 3000;

// Inizializza Sequelize
app.use(express.json());

// Middleware di errore
app.use(errorHandler);

// Rotte
app.get("/", (req, res) => {
  res.send("Ciao da TypeScript + Docker!gedgdgdgdg 🚀");
});

app.use('/auth', authRoutes); 

app.get("/test", (_, res) => {
  res.send('Asta Snap API attiva!');
});

const sequelize = getSequelizeInstance();

sequelize.authenticate()
  .then(() => console.log("Connessione al database stabilita con successo!"))
  .catch((error) => console.error("Impossibile connettersi al database:", error));

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});

export default app;
