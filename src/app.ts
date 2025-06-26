import express from 'express';


const app = express();
app.use(express.json());


app.get('/', (_req, res) => {
  res.send('✅ Il server è attivo! Benvenuto su ProgPA!');
});








console.log("Ciao dal tuo primo file TypeScript!");