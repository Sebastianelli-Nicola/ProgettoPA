# Progetto di Programmazione Avanzata  
*Sviluppo Backend di un Sistema di Gestione Aste Snap*

---

### Introduzione

L'obiettivo di questo progetto è sviluppare il backend per un sistema di **aste online di tipo snap**, ovvero aste a prenotazione in cui gli utenti possono registrarsi pagando una quota e successivamente competere tramite rilanci in tempo reale. 

L'applicazione consente la gestione degli utenti, la creazione e la partecipazione ad aste, l'invio di offerte in tempo reale tramite WebSocket, la gestione dei wallet utenti e la tracciabilità delle operazioni.

SCEGLIERE TRA:

+Abbiamo utilizzato il framework _Express_ con _TypeScript_ per implementare le API REST, con il supporto del database _PostgreSQL_ per la persistenza dei dati. Le funzionalità principali includono: gestione utenti tramite _JWT_, gestione del wallet per ogni partecipante, iscrizione alle aste, rilanci durante la fase finale, aggiudicazione dell'oggetto, esportazione dello storico e statistiche avanzate per l'admin.

Abbiamo integrato i principali concetti architetturali richiesti: middleware personalizzati per la gestione degli errori e la validazione delle richieste, pattern architetturali come Factory e Strategy, oltre all'uso di _Sequelize_ per ORM e _Docker Compose_ per orchestrare i vari servizi.

Tutti i componenti sopra menzionati sono stati containerizzati utilizzando _Docker_, e la loro orchestrazione è gestita tramite _Docker Compose_.

+L’intera architettura si basa su **Node.js** con framework **Express**, persistenza dati tramite **PostgreSQL** e comunicazioni real-time con **WebSocket**. Tutto è incapsulato all’interno di container **Docker** coordinati da **Docker Compose**.

---

### ⚙️ Installazione

Clona il repository:

```bash
git clone <URL_DEL_REPO>
```

Oppure scaricalo come ZIP da GitHub.

Assicurati di avere installato [Docker](https://docs.docker.com/engine/install/). Se stai usando Linux:

```bash
sudo service docker start
```

Oppure avvia **Docker Desktop**.

Una volta attivo Docker, spostati nella cartella del progetto ed esegui:

```bash
docker compose up
```

L’applicazione sarà disponibile su:

- **Backend**: http://localhost:3000  
- **PostgreSQL**: configurato nella rete interna Docker  

⚠️ **Nota**: al primo avvio il seeding è automatico.

---

### 🧱 Architettura Backend

L'architettura si compone di:

- **Express Container**: contiene la logica business, controller, DAO, e middleware.
- **PostgreSQL**: database relazionale.
- **WebSocket Server**: per aggiornamenti in tempo reale su offerte e chiusure aste.

#### Moduli principali

- **Controller**: gestiscono le richieste HTTP.
- **DAO**: interagiscono con il database tramite **Sequelize ORM**.
- **Service (opzionale)**: logica di business (può essere aggiunta per ulteriore separazione).
- **Middleware**: per autenticazione, autorizzazione e validazione, realizzati con il pattern **Chain of Responsibility**.
- **Factory Pattern**: per la gestione centralizzata degli errori.

---

### 🔐 Autenticazione e Autorizzazione

L'autenticazione avviene tramite **JWT Token**, con ruoli:

- `admin`
- `bid-creator`
- `bid-participant`

Ogni rotta è protetta da middleware personalizzati realizzati tramite il **pattern Chain of Responsibility**.

---

### 📡 WebSocket

Le comunicazioni in tempo reale sono gestite tramite WebSocket (`ws://localhost:3000`). 

- Alla connessione, l’utente si “unisce” a una specifica asta con un messaggio `join`.
- Riceve aggiornamenti su rilanci, estensioni d’asta, vincitori, o chiusure.

Messaggi inviati:

```json
{ "type": "new_bid", "bid": {...} }
{ "type": "auction_closed", "winnerId": 3, "finalAmount": 145.00 }
```

---

### 💰 Wallet e Pagamenti

Ogni utente possiede un wallet:

- Ricaricabile dagli `admin`
- Il credito viene scalato all'iscrizione all'asta (quota + prezzo massimo)
- Il vincitore riceve rimborso della differenza tra maxPrice e offerta vincente
- Gli altri partecipanti ricevono il rimborso totale

---

### 📈 Statistiche Utente

Ogni partecipante può visualizzare:

- Storico delle aste a cui ha partecipato
- Spesa totale (quote + vincite) in un determinato intervallo temporale

---

### 🧪 Design Pattern Utilizzati

#### 🧱 Factory Pattern

Utilizzato per la gestione centralizzata degli errori. È stata definita una **classe `ErrorFactory`** che restituisce oggetti di errore a partire da un `enum`.

✔️ Vantaggi:
- Codice più pulito e leggibile
- Consistenza nella gestione degli errori
- Più facile loggare o monitorare

#### 🔗 Chain of Responsibility

Utilizzato per strutturare i middleware:

- Ogni middleware (`Handler`) può eseguire un controllo o passare la richiesta al successivo
- È stato implementato un `BaseHandler` e vari handler concreti (es. `AuthHeaderHandler`, `TokenValidationHandler`, ecc.)

✔️ Vantaggi:
- Separazione delle responsabilità
- Riutilizzabilità e ordine flessibile
- Facilità di testing

---

### 📂 Rotte Principali

#### `/auction`

- `POST /` → crea una nuova asta (admin, bid-creator)
- `GET /` → elenca tutte le aste
- `POST /join` → iscriviti a un’asta (bid-participant)
- `POST /:id/close` → chiude l’asta (admin, bid-creator)
- `PATCH /:id/status` → aggiorna stato (admin, bid-creator)
- `POST /:id/start` → avvia asta (admin, bid-creator)
- `GET /history` → storico aste chiuse (bid-participant)

#### `/wallet`

- `GET /balance` → saldo wallet
- `POST /recharge` → ricarica wallet (admin)

#### `/bid`

- `POST /:id/bid` → piazza un’offerta (solo se partecipante iscritto)

#### `/user`

- `POST /login`
- `POST /register`

---

### 📊 Diagrammi

- Use Case
- Architettura
- Sequenze (Registrazione, Login, Partecipazione, Offerta, ecc.)

---

### 🧪 Test API

Collezione Postman:  
🔗 *[link al workspace Postman (se disponibile)]*

---

### 🧩 Estensioni Future

- Logica di scheduler automatico per chiusura aste
- Dashboard per admin
- Notifiche email ai vincitori

---