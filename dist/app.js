"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("./DB/sequelize");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
const port = 3000;
app.get("/", (req, res) => {
    res.send("Ciao da TypeScript + Docker!gedgdgdgdg 🚀");
});
app.listen(port, () => {
    console.log(`Server attivo su http://localhost:${port}`);
});
console.log("Ciao dal tuo primo file TypeScript!");
// Inizializza Sequelize
app.use(express_1.default.json());
app.use(errorHandler_1.errorHandler);
const sequelize = (0, sequelize_1.getSequelizeInstance)();
sequelize.authenticate()
    .then(() => console.log("Connessione al database stabilita con successo!"))
    .catch((error) => console.error("Impossibile connettersi al database:", error));
app.get("/test", (_, res) => {
    res.send('Asta Snap API attiva!');
});
exports.default = app;
