import { Command } from 'commander';
import { setAlias, removeAlias, listAliases, formatAliasList } from './snapshotAlias';

export function registerAliasCommands(program: Command): void {
  const alias = program.command('alias').description('Manage snapshot aliases');

  alias
    .command('set <snapshotId> <alias>')
    .description('Assign a human-friendly alias to a snapshot')
    .action((snapshotId: string, aliasName: string) => {
      try {
        setAlias(snapshotId, aliasName);
        console.log(`Alias '${aliasName}' set for snapshot '${snapshotId}'.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  alias
    .command('remove <alias>')
    .description('Remove an alias')
    .action((aliasName: string) => {
      try {
        removeAlias(aliasName);
        console.log(`Alias '${aliasName}' removed.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  alias
    .command('list')
    .description('List all defined aliases')
    .action(() => {
      const aliases = listAliases();
      console.log(formatAliasList(aliases));
    });
}
