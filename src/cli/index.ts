#!/usr/bin/env node

/**
 * envsnap CLI entry point
 * Handles command parsing and dispatches to the appropriate command handlers.
 */

import { Command } from 'commander';
import { saveSnapshot, getSnapshot, listSnapshots, deleteSnapshot } from '../storage/snapshotStore';
import { createSnapshot } from '../storage/snapshotFactory';

const program = new Command();

program
  .name('envsnap')
  .description('Snapshot, diff, and restore local environment variable sets across projects')
  .version('0.1.0');

/**
 * `envsnap save <name>` — capture current environment and save as a named snapshot
 */
program
  .command('save <name>')
  .description('Save the current environment variables as a named snapshot')
  .option('-p, --project <project>', 'Project name to scope the snapshot', 'default')
  .action((name: string, options: { project: string }) => {
    const snapshot = createSnapshot(name, options.project, process.env as Record<string, string>);
    saveSnapshot(snapshot);
    console.log(`✔ Snapshot "${name}" saved for project "${options.project}".`);
  });

/**
 * `envsnap list` — list all saved snapshots
 */
program
  .command('list')
  .description('List all saved snapshots')
  .option('-p, --project <project>', 'Filter snapshots by project name')
  .action((options: { project?: string }) => {
    const snapshots = listSnapshots(options.project);
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
      return;
    }
    console.log('Saved snapshots:');
    snapshots.forEach((s) => {
      console.log(`  • [${s.project}] ${s.name}  (${new Date(s.createdAt).toLocaleString()})`);
    });
  });

/**
 * `envsnap show <name>` — print the env vars stored in a snapshot
 */
program
  .command('show <name>')
  .description('Display the environment variables stored in a snapshot')
  .option('-p, --project <project>', 'Project name to scope the lookup', 'default')
  .action((name: string, options: { project: string }) => {
    const snapshot = getSnapshot(name, options.project);
    if (!snapshot) {
      console.error(`✖ Snapshot "${name}" not found for project "${options.project}".`);
      process.exit(1);
    }
    console.log(`Snapshot: ${snapshot.name}  (project: ${snapshot.project})`);
    console.log(`Created:  ${new Date(snapshot.createdAt).toLocaleString()}\n`);
    Object.entries(snapshot.env).forEach(([key, value]) => {
      console.log(`  ${key}=${value}`);
    });
  });

/**
 * `envsnap delete <name>` — remove a saved snapshot
 */
program
  .command('delete <name>')
  .description('Delete a named snapshot')
  .option('-p, --project <project>', 'Project name to scope the lookup', 'default')
  .action((name: string, options: { project: string }) => {
    const removed = deleteSnapshot(name, options.project);
    if (!removed) {
      console.error(`✖ Snapshot "${name}" not found for project "${options.project}".`);
      process.exit(1);
    }
    console.log(`✔ Snapshot "${name}" deleted from project "${options.project}".`);
  });

program.parse(process.argv);
