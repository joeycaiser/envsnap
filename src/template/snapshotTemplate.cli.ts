import { Command } from 'commander';
import {
  saveTemplate,
  getTemplate,
  deleteTemplate,
  listTemplates,
  applyTemplate,
  formatTemplateList,
} from './snapshotTemplate';
import { getSnapshot } from '../storage/snapshotStore';

export function registerTemplateCommands(program: Command): void {
  const template = program.command('template').description('Manage snapshot templates');

  template
    .command('save <name> <keys...>')
    .description('Save a new template with the given env keys')
    .option('-d, --description <desc>', 'Template description')
    .option('--default <pairs...>', 'Default values as KEY=VALUE')
    .action((name: string, keys: string[], opts) => {
      const defaults: Record<string, string> = {};
      if (opts.default) {
        for (const pair of opts.default as string[]) {
          const [k, ...rest] = pair.split('=');
          defaults[k] = rest.join('=');
        }
      }
      const t = saveTemplate(name, keys, defaults, opts.description);
      console.log(`Template "${t.name}" saved with ${t.keys.length} key(s).`);
    });

  template
    .command('list')
    .description('List all saved templates')
    .action(() => {
      const templates = listTemplates();
      console.log(formatTemplateList(templates));
    });

  template
    .command('delete <name>')
    .description('Delete a template by name')
    .action((name: string) => {
      const removed = deleteTemplate(name);
      if (removed) {
        console.log(`Template "${name}" deleted.`);
      } else {
        console.error(`Template "${name}" not found.`);
        process.exit(1);
      }
    });

  template
    .command('apply <templateName> <snapshotId>')
    .description('Apply a template to a snapshot and show matched/missing keys')
    .action((templateName: string, snapshotId: string) => {
      const tpl = getTemplate(templateName);
      if (!tpl) {
        console.error(`Template "${templateName}" not found.`);
        process.exit(1);
      }
      const snap = getSnapshot(snapshotId);
      if (!snap) {
        console.error(`Snapshot "${snapshotId}" not found.`);
        process.exit(1);
      }
      const { applied, missing } = applyTemplate(tpl, snap);
      console.log('Applied keys:');
      for (const [k, v] of Object.entries(applied)) {
        console.log(`  ${k}=${v}`);
      }
      if (missing.length > 0) {
        console.warn(`\nMissing keys (no value or default): ${missing.join(', ')}`);
      }
    });
}
