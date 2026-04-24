import { restoreSnapshot, unrestoreSnapshot } from './snapshotRestore';
import { Snapshot } from '../storage/types';

const makeSnapshot = (env: Record<string, string>): Snapshot => ({
  id: 'test-id',
  name: 'test',
  createdAt: new Date().toISOString(),
  env,
});

describe('restoreSnapshot', () => {
  beforeEach(() => {
    delete process.env.TEST_FOO;
    delete process.env.TEST_BAR;
  });

  it('applies env vars to process.env', () => {
    const snap = makeSnapshot({ TEST_FOO: 'hello', TEST_BAR: 'world' });
    const result = restoreSnapshot(snap);
    expect(process.env.TEST_FOO).toBe('hello');
    expect(process.env.TEST_BAR).toBe('world');
    expect(result.applied).toEqual(['TEST_FOO', 'TEST_BAR']);
    expect(result.skipped).toHaveLength(0);
  });

  it('skips existing keys when overwrite is false', () => {
    process.env.TEST_FOO = 'existing';
    const snap = makeSnapshot({ TEST_FOO: 'new', TEST_BAR: 'world' });
    const result = restoreSnapshot(snap, { overwrite: false });
    expect(process.env.TEST_FOO).toBe('existing');
    expect(result.skipped).toContain('TEST_FOO');
    expect(result.applied).toContain('TEST_BAR');
  });

  it('overwrites existing keys when overwrite is true', () => {
    process.env.TEST_FOO = 'existing';
    const snap = makeSnapshot({ TEST_FOO: 'new' });
    restoreSnapshot(snap, { overwrite: true });
    expect(process.env.TEST_FOO).toBe('new');
  });

  it('does not modify process.env in dryRun mode', () => {
    const snap = makeSnapshot({ TEST_FOO: 'hello' });
    const result = restoreSnapshot(snap, { dryRun: true });
    expect(process.env.TEST_FOO).toBeUndefined();
    expect(result.applied).toContain('TEST_FOO');
  });

  it('only applies specified keys when keys option is provided', () => {
    const snap = makeSnapshot({ TEST_FOO: 'a', TEST_BAR: 'b' });
    const result = restoreSnapshot(snap, { keys: ['TEST_FOO'] });
    expect(process.env.TEST_FOO).toBe('a');
    expect(process.env.TEST_BAR).toBeUndefined();
    expect(result.skipped).toContain('TEST_BAR');
  });
});

describe('unrestoreSnapshot', () => {
  it('removes snapshot keys from process.env', () => {
    process.env.TEST_FOO = 'hello';
    const snap = makeSnapshot({ TEST_FOO: 'hello' });
    const removed = unrestoreSnapshot(snap);
    expect(process.env.TEST_FOO).toBeUndefined();
    expect(removed).toContain('TEST_FOO');
  });

  it('only removes specified keys', () => {
    process.env.TEST_FOO = 'a';
    process.env.TEST_BAR = 'b';
    const snap = makeSnapshot({ TEST_FOO: 'a', TEST_BAR: 'b' });
    unrestoreSnapshot(snap, { keys: ['TEST_FOO'] });
    expect(process.env.TEST_FOO).toBeUndefined();
    expect(process.env.TEST_BAR).toBe('b');
  });
});
