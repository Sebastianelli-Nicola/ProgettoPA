import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const seedLockFile = './.seeded';

export const runMigrationsAndSeeds = async (): Promise<void> => {
  try {
    await fs.access(seedLockFile);
    console.log('Seed già eseguito');
    return;
  } catch {
    console.log('Avvio migrazioni e seed...');
  }

  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all');
    console.log('Migrazioni e seed completati:\n', stdout);
    if (stderr) console.error(stderr);
    await fs.writeFile(seedLockFile, 'done');
  } catch (err: any) {
    console.error('Errore durante migrate/seed:', err.message);
  }
};
