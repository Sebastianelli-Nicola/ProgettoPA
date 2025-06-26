import express from "express";
import { getSequelizeInstance } from "./DB/sequelize";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Ciao da TypeScript + Docker!gedgdgdgdg 🚀");
});

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});









console.log("Ciao dal tuo primo file TypeScript!");

// Inizializza Sequelize
app.use(express.json());

const sequelize = getSequelizeInstance();

sequelize.authenticate()
  .then(() => console.log("Connessione al database stabilita con successo!"))
  .catch((error) => console.error("Impossibile connettersi al database:", error));

app.get("/test", (_, res) => {
  res.send('Asta Snap API attiva!');
});

export default app; 