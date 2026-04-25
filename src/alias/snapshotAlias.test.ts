import { setAlias, removeAlias, resolveAlias, listAliases, formatAliasList } from './snapshotAlias';
import * as store from '../storage/snapshotStore';

const mockStore = {
  snapshots: {
    'snap-001': { id: 'snap-001', name: 'dev', timestamp: 0, variables: {}, tags: [] },
  },
  aliases: {} as Record<string, string>,
};

beforeEach(() => {
  mockStore.aliases = {};
  jest.spyOn(store, 'readStore').mockReturnValue(mockStore as any);
  jest.spyOn(store, 'writeStore').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('setAlias assigns alias to snapshot', () => {
  setAlias('snap-001', 'dev');
  expect(mockStore.aliases['dev']).toBe('snap-001');
});

test('setAlias throws for unknown snapshot', () => {
  expect(() => setAlias('nonexistent', 'alias')).toThrow("Snapshot 'nonexistent' not found.");
});

test('setAlias replaces previous alias for same snapshot', () => {
  mockStore.aliases['old-alias'] = 'snap-001';
  setAlias('snap-001', 'new-alias');
  expect(mockStore.aliases['new-alias']).toBe('snap-001');
  expect(mockStore.aliases['old-alias']).toBeUndefined();
});

test('removeAlias removes existing alias', () => {
  mockStore.aliases['dev'] = 'snap-001';
  removeAlias('dev');
  expect(mockStore.aliases['dev']).toBeUndefined();
});

test('removeAlias throws for unknown alias', () => {
  expect(() => removeAlias('ghost')).toThrow("Alias 'ghost' not found.");
});

test('resolveAlias returns snapshotId for known alias', () => {
  mockStore.aliases['dev'] = 'snap-001';
  expect(resolveAlias('dev')).toBe('snap-001');
});

test('resolveAlias returns input unchanged if not an alias', () => {
  expect(resolveAlias('snap-001')).toBe('snap-001');
});

test('listAliases returns all aliases', () => {
  mockStore.aliases = { dev: 'snap-001' };
  expect(listAliases()).toEqual({ dev: 'snap-001' });
});

test('formatAliasList shows message when empty', () => {
  expect(formatAliasList({})).toBe('No aliases defined.');
});

test('formatAliasList formats entries', () => {
  const result = formatAliasList({ dev: 'snap-001' });
  expect(result).toContain('dev');
  expect(result).toContain('snap-001');
});
