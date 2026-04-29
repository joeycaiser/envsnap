import { Command } from 'commander';
import { copySnapshot, formatCopyResult } from './snapshotCopy';

export function registerCopyCommands(program: Command): void {
  program
    .command('copy <sourceId> <targetId>')
    .description('Copy a snapshot to a new name/id')
    .option('--overwrite', 'Overwrite target snapshot if it already exists', false)
    .action(async (sourceId: string, targetId: string, options: { overwrite: boolean }) => {
      try {
        const result = await copySnapshot(sourceId, targetId, options.overwrite);
        console.log(formatCopyResult(result));
        if (!result.success) {
          process.exit(1);
        }
      } catch (err) {
        console.error('Error copying snapshot:', (err as Error).message);
        process.exit(1);
      }
    });
}
