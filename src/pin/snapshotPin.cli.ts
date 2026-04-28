import { Command } from 'commander';
import { pinSnapshot, unpinSnapshot, listPins, formatPinList } from './snapshotPin';

export function registerPinCommands(program: Command): void {
  const pin = program.command('pin').description('Manage pinned snapshots');

  pin
    .command('add <snapshotId>')
    .description('Pin a snapshot')
    .option('-l, --label <label>', 'Human-readable label for the pin')
    .action((snapshotId: string, opts: { label?: string }) => {
      try {
        const entry = pinSnapshot(snapshotId, opts.label);
        console.log(`📌 Pinned snapshot "${entry.label}" (${entry.snapshotId}).`);
      } catch (err: unknown) {
        console.error((err as Error).message);
        process.exit(1);
      }
    });

  pin
    .command('remove <snapshotId>')
    .description('Unpin a snapshot')
    .action((snapshotId: string) => {
      const removed = unpinSnapshot(snapshotId);
      if (removed) {
        console.log(`Unpinned snapshot "${snapshotId}".`);
      } else {
        console.warn(`Snapshot "${snapshotId}" was not pinned.`);
      }
    });

  pin
    .command('list')
    .description('List all pinned snapshots')
    .action(() => {
      const pins = listPins();
      console.log(formatPinList(pins));
    });
}
