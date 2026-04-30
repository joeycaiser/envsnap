import { Command } from 'commander';
import {
  createGroup,
  deleteGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  listGroups,
  getGroup,
  formatGroupList,
} from './snapshotGroup';

export function registerGroupCommands(program: Command): void {
  const group = program.command('group').description('Manage snapshot groups');

  group
    .command('create <name>')
    .description('Create a new group')
    .option('-d, --description <desc>', 'Group description')
    .action((name: string, opts: { description?: string }) => {
      const g = createGroup(name, opts.description);
      console.log(`Group "${g.name}" created.`);
    });

  group
    .command('delete <name>')
    .description('Delete a group')
    .action((name: string) => {
      deleteGroup(name);
      console.log(`Group "${name}" deleted.`);
    });

  group
    .command('add <groupName> <snapshotId>')
    .description('Add a snapshot to a group')
    .action((groupName: string, snapshotId: string) => {
      addSnapshotToGroup(groupName, snapshotId);
      console.log(`Snapshot "${snapshotId}" added to group "${groupName}".`);
    });

  group
    .command('remove <groupName> <snapshotId>')
    .description('Remove a snapshot from a group')
    .action((groupName: string, snapshotId: string) => {
      removeSnapshotFromGroup(groupName, snapshotId);
      console.log(`Snapshot "${snapshotId}" removed from group "${groupName}".`);
    });

  group
    .command('list')
    .description('List all groups')
    .action(() => {
      console.log(formatGroupList(listGroups()));
    });

  group
    .command('show <name>')
    .description('Show details of a group')
    .action((name: string) => {
      const g = getGroup(name);
      if (!g) { console.error(`Group "${name}" not found.`); process.exit(1); }
      console.log(`Name:      ${g.name}`);
      if (g.description) console.log(`Desc:      ${g.description}`);
      console.log(`Snapshots: ${g.snapshotIds.join(', ') || '(none)'}`);
      console.log(`Created:   ${g.createdAt}`);
      console.log(`Updated:   ${g.updatedAt}`);
    });
}
