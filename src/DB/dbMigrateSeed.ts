/**
 * @fileoverview
 * Script per eseguire automaticamente le migrazioni e i seed del database
 * usando Sequelize CLI. Utilizza un file di lock `.seeded` per evitare
 * esecuzioni multiple non necessarie.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { ErrorFactory, ErrorType } from '../factory/errorFactory';


// Promisifica exec per usare async/await
const execAsync = promisify(exec);

// File usato come lock per indicare che il seed è già stato eseguito
const seedLockFile = './.seeded';

/**
 * Esegue le migrazioni e i seed del database, se non già eseguiti.
 * Verifica l'esistenza di un file `.seeded` per prevenire doppie esecuzioni.
 */
export const runMigrationsAndSeeds = async (): Promise<void> => {
  try {
    // Verifica se il file di lock esiste già
    await fs.access(seedLockFile);
    console.log('Seed già eseguito');
    return;
  } catch {
    // Il file non esiste, quindi si procede
    console.log('Avvio migrazioni e seed...');
  }

  try {
    // Esegue i comandi Sequelize CLI per migrare e seedare
    const { stdout, stderr } = await execAsync(
      'npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all'
    );

    // Mostra l'output della CLI
    console.log('Migrazioni e seed completati:\n', stdout);

    // Mostra eventuali errori della CLI
    if (stderr) console.error(stderr);

    // Crea il file di lock per evitare future riesecuzioni
    await fs.writeFile(seedLockFile, 'done');
  } catch (err: any) {
    // Gestione errori durante migrazione/seed con ErrorFactory
    const error = ErrorFactory.createError(ErrorType.Scheduler, `Errore durante migrate/seed: ${err.message}`);
    console.error(error);
    throw error;
  }
};