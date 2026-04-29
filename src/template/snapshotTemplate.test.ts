import {
  saveTemplate,
  getTemplate,
  deleteTemplate,
  listTemplates,
  applyTemplate,
  formatTemplateList,
} from './snapshotTemplate';
import { Snapshot } from '../storage/types';

jest.mock('../storage/snapshotStore', () => {
  let store: any = {};
  return {
    readStore: () => store,
    writeStore: (s: any) => { store = s; },
  };
});

const makeSnapshot = (env: Record<string, string>): Snapshot => ({
  id: 'snap1',
  name: 'test',
  createdAt: new Date().toISOString(),
  env,
  tags: [],
});

describe('saveTemplate / getTemplate', () => {
  it('saves and retrieves a template', () => {
    const t = saveTemplate('base', ['NODE_ENV', 'PORT'], { PORT: '3000' }, 'Base config');
    expect(t.name).toBe('base');
    expect(t.keys).toContain('PORT');
    const fetched = getTemplate('base');
    expect(fetched).toBeDefined();
    expect(fetched!.description).toBe('Base config');
  });
});

describe('deleteTemplate', () => {
  it('deletes an existing template', () => {
    saveTemplate('toDelete', ['KEY']);
    expect(deleteTemplate('toDelete')).toBe(true);
    expect(getTemplate('toDelete')).toBeUndefined();
  });

  it('returns false for nonexistent template', () => {
    expect(deleteTemplate('ghost')).toBe(false);
  });
});

describe('listTemplates', () => {
  it('returns all saved templates', () => {
    saveTemplate('t1', ['A']);
    saveTemplate('t2', ['B', 'C']);
    const list = listTemplates();
    const names = list.map((t) => t.name);
    expect(names).toContain('t1');
    expect(names).toContain('t2');
  });
});

describe('applyTemplate', () => {
  it('extracts matching keys from snapshot', () => {
    const tpl = saveTemplate('app', ['NODE_ENV', 'PORT', 'SECRET'], { PORT: '8080' });
    const snap = makeSnapshot({ NODE_ENV: 'production', SECRET: 'abc' });
    const { applied, missing } = applyTemplate(tpl, snap);
    expect(applied['NODE_ENV']).toBe('production');
    expect(applied['PORT']).toBe('8080'); // from defaults
    expect(applied['SECRET']).toBe('abc');
    expect(missing).toHaveLength(0);
  });

  it('reports missing keys with no default', () => {
    const tpl = saveTemplate('strict', ['REQUIRED_KEY']);
    const snap = makeSnapshot({});
    const { missing } = applyTemplate(tpl, snap);
    expect(missing).toContain('REQUIRED_KEY');
  });
});

describe('formatTemplateList', () => {
  it('returns message when empty', () => {
    expect(formatTemplateList([])).toBe('No templates defined.');
  });

  it('formats template entries', () => {
    const t = saveTemplate('fmt', ['X', 'Y'], {}, 'Formatter test');
    const output = formatTemplateList([t]);
    expect(output).toContain('fmt');
    expect(output).toContain('Formatter test');
    expect(output).toContain('2 keys');
  });
});
