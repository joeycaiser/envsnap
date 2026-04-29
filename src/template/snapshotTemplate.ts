import { Snapshot } from '../storage/types';
import { readStore, writeStore } from '../storage/snapshotStore';

export interface Template {
  name: string;
  description?: string;
  keys: string[];
  defaults?: Record<string, string>;
  createdAt: string;
}

export interface TemplateStore {
  templates: Record<string, Template>;
}

function readTemplates(): TemplateStore {
  const store = readStore() as any;
  return { templates: store.templates ?? {} };
}

function writeTemplates(data: TemplateStore): void {
  const store = readStore() as any;
  store.templates = data.templates;
  writeStore(store);
}

export function saveTemplate(
  name: string,
  keys: string[],
  defaults?: Record<string, string>,
  description?: string
): Template {
  const store = readTemplates();
  const template: Template = {
    name,
    keys,
    defaults: defaults ?? {},
    description,
    createdAt: new Date().toISOString(),
  };
  store.templates[name] = template;
  writeTemplates(store);
  return template;
}

export function getTemplate(name: string): Template | undefined {
  const store = readTemplates();
  return store.templates[name];
}

export function deleteTemplate(name: string): boolean {
  const store = readTemplates();
  if (!store.templates[name]) return false;
  delete store.templates[name];
  writeTemplates(store);
  return true;
}

export function listTemplates(): Template[] {
  const store = readTemplates();
  return Object.values(store.templates);
}

export function applyTemplate(
  template: Template,
  snapshot: Snapshot
): { missing: string[]; applied: Record<string, string> } {
  const applied: Record<string, string> = {};
  const missing: string[] = [];
  for (const key of template.keys) {
    if (snapshot.env[key] !== undefined) {
      applied[key] = snapshot.env[key];
    } else if (template.defaults && template.defaults[key] !== undefined) {
      applied[key] = template.defaults[key];
    } else {
      missing.push(key);
    }
  }
  return { missing, applied };
}

export function formatTemplateList(templates: Template[]): string {
  if (templates.length === 0) return 'No templates defined.';
  return templates
    .map(
      (t) =>
        `• ${t.name}${t.description ? ` — ${t.description}` : ''} (${t.keys.length} keys)`
    )
    .join('\n');
}
