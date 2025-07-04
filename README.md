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

### Installazione

Come prima cosa è necessario clonare il repository di GitHub:

```bash
git clone <URL_DEL_REPO>
```

Oppure scaricarlo come ZIP da GitHub.

Assicurati di avere installato [Docker](https://docs.docker.com/engine/install/). 

Se stai usando Linux:

```bash
sudo service docker start
```

Oppure avvia **Docker Desktop**, che è più intuitivo.
Assicurati di avere tutti i file .env necessari per installare il software

Una volta attivo Docker, spostati nella cartella del progetto e tramite il terminale esegui:

```bash
docker compose up
```

L’applicazione è ora configurata e sarà disponibile su:

- **Backend**: http://localhost:3000  
- **PostgreSQL**: configurato nella rete interna Docker  

**Nota**: al primo avvio il seeding è automatico. Non sono necessarie operazioni sul database

---

### Architettura Backend

L'architettura del backend si compone di:

- **Express Container**: Container con il framework Express, che si occupa di gestire tutta la logica business dell'applicazione, i controller, i DAO e i middleware.
- **PostgreSQL**: database relazionale, gestito tramite Sequelize con modelli ORM per ogni entità.
- **WebSocket Server**: per aggiornamenti in tempo reale su offerte e chiusure aste.

#### Moduli principali

- **Controller**: gestiscono le richieste HTTP.
- **DAO**: interagiscono con il database tramite **Sequelize ORM**.
- **Service (opzionale)**: logica di business (può essere aggiunta per ulteriore separazione).
- **Middleware**: per autenticazione, autorizzazione e validazione, realizzati con il pattern **Chain of Responsibility**.
- **Factory Pattern**: per la gestione centralizzata degli errori.

---

### Autenticazione e Autorizzazione

L'autenticazione avviene tramite **JWT Token**, ogni utente è associato ad uno dei seguenti ruoli:

- `admin` - gestione completa del sistema
- `bid-creator` - creazione e gestione aste
- `bid-participant` - partecipazione alle aste

Ogni rotta è protetta da middleware personalizzati realizzati tramite il **pattern Chain of Responsibility**.

---

### WebSocket

Le comunicazioni in tempo reale sono gestite tramite WebSocket (`ws://localhost:3000`). 

- Alla connessione, l’utente si “unisce” a una specifica asta con un messaggio `join`.
- Riceve aggiornamenti su rilanci, estensioni d’asta, vincitori, o chiusure.

Messaggi inviati:

```json
{ "type": "new_bid", "bid": {...} }
{ "type": "auction_closed", "winnerId": 3, "finalAmount": 145.00 }
```

---

### Wallet e Pagamenti

Ogni utente possiede un wallet:

- Gli `admin` possono ricaricare il credito
- Il credito viene scalato all'iscrizione all'asta (quota + prezzo massimo)
- Il vincitore riceve rimborso della differenza tra maxPrice e offerta vincente
- Gli altri partecipanti ricevono il rimborso totale

---

### Statistiche Utente

Ogni partecipante può visualizzare:

- Storico delle aste a cui ha partecipato
- Spesa totale (quote + vincite) in un determinato intervallo temporale

---

### Design Pattern Utilizzati

#### Factory Pattern

Utilizzato per la gestione centralizzata degli errori. È stata definita una **classe `ErrorFactory`** che restituisce oggetti di errore a partire da un `enum`.

✔️ Vantaggi:
- Codice più pulito e leggibile
- Consistenza nella gestione degli errori
- Più facile loggare o monitorare

#### Chain of Responsibility

Utilizzato per strutturare i middleware:

- Ogni middleware (`Handler`) può eseguire un controllo o passare la richiesta al successivo
- È stato implementato un `BaseHandler` e vari handler concreti (es. `AuthHeaderHandler`, `TokenValidationHandler`, ecc.)

✔️ Vantaggi:
- Separazione delle responsabilità
- Riutilizzabilità e ordine flessibile
- Facilità di testing

---

### Rotte Principali

#### `/auction`

- `POST /` → crea una nuova asta (admin, bid-creator)
    - **Corpo della richiesta**:

    | Key                    | Value                                  |
    |------------------------|----------------------------------------|
    | `title`                | Titolo dell'asta                       |
    | `minParticipants`      | Numero minimo di partecipanti          |
    | `maxParticipants`      | Numero massimo di partecipanti         |
    | `entryFee`             | Quota d'iscrizione                     |    
    | `maxPrice`             | Prezzo massimo dell'asta               |
    | `minIncrement`         | Incremento minimo dell'asta            |
    | `bidsPerParticipant`   | Numero di puntate per partecipante     |
    | `startTime`            | Ora e data d'inizio                    |
    | `endTime`              | Ora e data di fine                     |
    | `relaunchTime`         | Tempo per la fase di rilancio          |
    | `status`               | Stato dell'asta                        |

    - **Esempio di risposta**:
    ```json
    {
      "message": "Asta creata con successo",
      "auction": {
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "title": <String>,
        "minParticipants": <Integer>,
        "maxParticipants": <Integer>,
        "entryFee": <Integer>,
        "maxPrice": <Decimal>,
        "minIncrement": <Decimal>,
        "bidsPerParticipant": <Integer>,
        "startTime": <DATE>,
        "endTime": <DATE>,
        "relaunchTime": <Integer>,
        "status": <String>
        }
    }
    ```
- `GET /` → elenca tutte le aste
    - **Esempio di risposta**:
    ```json
    {
    {
        "id": <Integer>,
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "title": <String>,
        "minParticipants": <Integer>,
        "maxParticipants": <Integer>,
        "entryFee": <Integer>,
        "maxPrice": <Decimal>,
        "minIncrement": <Decimal>,
        "bidsPerParticipant": <Integer>,
        "startTime": <DATE>,
        "endTime": <DATE>,
        "relaunchTime": <Integer>,
        "status": <String>
    },
    {
        "id": <Integer>,
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "title": <String>,
        "minParticipants": <Integer>,
        "maxParticipants": <Integer>,
        "entryFee": <Integer>,
        "maxPrice": <Decimal>,
        "minIncrement": <Decimal>,
        "bidsPerParticipant": <Integer>,
        "startTime": <DATE>,
        "endTime": <DATE>,
        "relaunchTime": <Integer>,
        "status": <String>
    }
    }
    ```
- `POST /join` → iscriviti a un’asta (bid-participant)
     - **Corpo della richiesta**:

    | Key                 | Value                     |
    |---------------------|---------------------------|
    | `auctionId`         | Id dell'asta              |

    - **Esempio di risposta**:
    ```json
    {
    "message": "Partecipazione registrata con successo"
    }
    ```
- `POST /close` → chiude l’asta (admin, bid-creator)
     - **Corpo della richiesta**:

    | Key                 | Value                     |
    |---------------------|---------------------------|
    | `auctionId`         | Id dell'asta              |

    - **Esempio di risposta**:
    ```json
    {
    "message": "L'asta non è nello stato \"bidding\""
    }  
    ```
- `POST /start` → avvia asta (admin, bid-creator)
     - **Corpo della richiesta**:

   | Key                 | Value                     |
   |---------------------|---------------------------|
   | `auctionId`         | Id dell'asta              |

    - **Esempio di risposta**:
    ```json
    {
    "message": "Asta avviata"
    }
    ```
- `GET /history` → storico aste chiuse (bid-participant)
 - **Corpo della richiesta**:

    | Key              | Value                                               |
    |------------------|-----------------------------------------------------|
    | `from`           | Data inizio filtro                                  |
    | `to`             | Data fine filtro                                    |
    | `form`           | Formato in cui ottenere i dati                      |

    - **Esempio di risposta**:
    ```json
    {
    "won": [ 
        {
        "id": <Integer>,
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "title": <String>,
        "minParticipants": <Integer>,
        "maxParticipants": <Integer>,
        "entryFee": <Integer>,
        "maxPrice": <Decimal>,
        "minIncrement": <Decimal>,
        "bidsPerParticipant": <Integer>,
        "startTime": <DATE>,
        "endTime": <DATE>,
        "relaunchTime": <Integer>,
        "status": <String>,
        "isWinner": <Boolean>,
        }
    ],
    "lost": [
        {
         "id": <Integer>,
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "title": <String>,
        "minParticipants": <Integer>,
        "maxParticipants": <Integer>,
        "entryFee": <Integer>,
        "maxPrice": <Decimal>,
        "minIncrement": <Decimal>,
        "bidsPerParticipant": <Integer>,
        "startTime": <DATE>,
        "endTime": <DATE>,
        "relaunchTime": <Integer>,
        "status": <String>,
        "isWinner": <Boolean>,
        }
    ]
    }
      
    ```

#### `/wallet`

- `GET /balance` → saldo wallet
    - **Esempio di risposta**:
    ```json
    {
    "balance": <Integer>
    }
    ```
- `POST /recharge` → ricarica wallet (admin)
     - **Corpo della richiesta**:

    | Key                  | Value                           |
    |----------------------|---------------------------------|
    | `userId`             | Id dell'utente                  |
    | `amount`             | Somma da ricaricare             |

    - **Esempio di risposta**:
    ```json
    {
    "message": "Ricarica completata",
    "balance": <Integer>
    }
    ```

#### `/bid`

- `POST /bid` → piazza un’offerta (solo se partecipante iscritto)
     - **Corpo della richiesta**:

    | Key                 | Value                                |
    |---------------------|--------------------------------------|
    | `auctionId`         | Id dell'asta                         |
    | `amount`            | Totale di quanto si vuole rilanciare |

    - **Esempio di risposta**:
    ```json
    {
    "message": "Offerta registrata con successo",
    "bid": {
        "createdAt": <DATE>,
        "updatedAt": <DATE>,
        "id": <Integer>,
        "auctionId": <Integer>,
        "userId": <Integer>,
        "amount": <Integer>
    }
    }
    ```

#### `/user`

- `POST /login`
     - **Corpo della richiesta**:

    | Key                    | Value                                |
    |------------------------|--------------------------------------|
    | `email`                | Email dell'utente                    |
    | `password`             | Password dell'utente                 |

    - **Esempio di risposta**:
    ```json
    {
        "token": <created_auth_token>
    }
    ```

---

### Diagrammi

- Use Case
- Architettura
- Sequenze (Registrazione, Login, Partecipazione, Offerta, ecc.)

---

### Test API

Collezione Postman:  
🔗 *[link al workspace Postman (se disponibile)]*

---

### Estensioni Future

- Logica di scheduler automatico per chiusura aste
- Dashboard per admin
- Notifiche email ai vincitori

---