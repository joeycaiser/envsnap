import type { Command } from 'commander';
import {
  createProfile,
  addSnapshotToProfile,
  removeSnapshotFromProfile,
  getProfile,
  listProfiles,
  deleteProfile,
  formatProfileList,
} from './snapshotProfile';

export function registerProfileCommands(program: Command): void {
  const profile = program.command('profile').description('Manage snapshot profiles');

  profile
    .command('create <name>')
    .description('Create a new profile')
    .option('-d, --description <desc>', 'Profile description', '')
    .action(async (name: string, opts: { description: string }) => {
      try {
        const p = await createProfile(name, opts.description);
        console.log(`✔ Profile "${p.name}" created.`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('add <profileName> <snapshotId>')
    .description('Add a snapshot to a profile')
    .action(async (profileName: string, snapshotId: string) => {
      try {
        await addSnapshotToProfile(profileName, snapshotId);
        console.log(`✔ Snapshot "${snapshotId}" added to profile "${profileName}".`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('remove <profileName> <snapshotId>')
    .description('Remove a snapshot from a profile')
    .action(async (profileName: string, snapshotId: string) => {
      try {
        await removeSnapshotFromProfile(profileName, snapshotId);
        console.log(`✔ Snapshot "${snapshotId}" removed from profile "${profileName}".`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('show <name>')
    .description('Show details of a profile')
    .action(async (name: string) => {
      try {
        const p = await getProfile(name);
        console.log(`Profile: ${p.name}`);
        if (p.description) console.log(`Description: ${p.description}`);
        console.log(`Snapshots (${p.snapshotIds.length}): ${p.snapshotIds.join(', ') || 'none'}`);
        console.log(`Created: ${p.createdAt}`);
        console.log(`Updated: ${p.updatedAt}`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('list')
    .description('List all profiles')
    .action(async () => {
      const profiles = await listProfiles();
      console.log(formatProfileList(profiles));
    });

  profile
    .command('delete <name>')
    .description('Delete a profile')
    .action(async (name: string) => {
      try {
        await deleteProfile(name);
        console.log(`✔ Profile "${name}" deleted.`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });
}
