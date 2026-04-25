import { Command } from 'commander';
import * as readline from 'readline';
import { createSnapshot } from '../storage/snapshotFactory';
import {
  saveEncryptedSnapshot,
  loadEncryptedSnapshot,
  listEncryptedSnapshotIds,
  deleteEncryptedSnapshot,
} from './encryptedStore';

function promptPassphrase(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(prompt);
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export function registerEncryptCommands(program: Command): void {
  const enc = program.command('encrypt').description('Manage encrypted snapshots');

  enc
    .command('save <name>')
    .description('Encrypt and save current environment as a snapshot')
    .action(async (name: string) => {
      const passphrase = await promptPassphrase('Passphrase: ');
      const snapshot = createSnapshot(name, process.env as Record<string, string>);
      saveEncryptedSnapshot(snapshot, passphrase);
      console.log(`Encrypted snapshot "${name}" saved with id: ${snapshot.id}`);
    });

  enc
    .command('load <id>')
    .description('Decrypt and display a snapshot by id')
    .action(async (id: string) => {
      const passphrase = await promptPassphrase('Passphrase: ');
      const snapshot = loadEncryptedSnapshot(id, passphrase);
      if (!snapshot) {
        console.error(`No encrypted snapshot found with id: ${id}`);
        process.exit(1);
      }
      console.log(JSON.stringify(snapshot.variables, null, 2));
    });

  enc
    .command('list')
    .description('List all encrypted snapshot ids')
    .action(() => {
      const ids = listEncryptedSnapshotIds();
      if (ids.length === 0) {
        console.log('No encrypted snapshots found.');
      } else {
        ids.forEach((id) => console.log(id));
      }
    });

  enc
    .command('delete <id>')
    .description('Delete an encrypted snapshot by id')
    .action((id: string) => {
      const deleted = deleteEncryptedSnapshot(id);
      if (deleted) {
        console.log(`Encrypted snapshot ${id} deleted.`);
      } else {
        console.error(`Snapshot ${id} not found.`);
        process.exit(1);
      }
    });
}
