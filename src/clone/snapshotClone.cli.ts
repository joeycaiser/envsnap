import { Command } from 'commander';
import { cloneSnapshot, formatCloneResult } from './snapshotClone';

export function registerCloneCommands(program: Command): void {
  program
    .command('clone <source> <target>')
    .description('Clone an existing snapshot under a new name')
    .option('--overwrite', 'Overwrite the target snapshot if it already exists', false)
    .action((source: string, target: string, opts: { overwrite: boolean }) => {
      const result = cloneSnapshot(source, target, opts.overwrite);
      console.log(formatCloneResult(result));
      if (!result.success) process.exit(1);
    });
}
