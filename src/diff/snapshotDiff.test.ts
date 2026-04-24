import { diffSnapshots, formatDiff } from './snapshotDiff';
import { Snapshot } from '../storage/types';

const makeSnapshot = (name: string, variables: Record<string, string>): Snapshot => ({
  name,
  createdAt: new Date().toISOString(),
  variables,
});

describe('diffSnapshots', () => {
  it('returns empty entries when snapshots are identical', () => {
    const a = makeSnapshot('a', { FOO: 'bar', BAZ: 'qux' });
    const b = makeSnapshot('b', { FOO: 'bar', BAZ: 'qux' });
    const diff = diffSnapshots(a, b);
    expect(diff.entries).toHaveLength(0);
    expect(diff.addedCount).toBe(0);
    expect(diff.removedCount).toBe(0);
    expect(diff.changedCount).toBe(0);
  });

  it('detects added keys', () => {
    const a = makeSnapshot('a', { FOO: 'bar' });
    const b = makeSnapshot('b', { FOO: 'bar', NEW_KEY: 'value' });
    const diff = diffSnapshots(a, b);
    expect(diff.addedCount).toBe(1);
    expect(diff.entries[0]).toEqual({ key: 'NEW_KEY', status: 'added', newValue: 'value' });
  });

  it('detects removed keys', () => {
    const a = makeSnapshot('a', { FOO: 'bar', OLD_KEY: 'old' });
    const b = makeSnapshot('b', { FOO: 'bar' });
    const diff = diffSnapshots(a, b);
    expect(diff.removedCount).toBe(1);
    expect(diff.entries[0]).toEqual({ key: 'OLD_KEY', status: 'removed', oldValue: 'old' });
  });

  it('detects changed values', () => {
    const a = makeSnapshot('a', { FOO: 'original' });
    const b = makeSnapshot('b', { FOO: 'updated' });
    const diff = diffSnapshots(a, b);
    expect(diff.changedCount).toBe(1);
    expect(diff.entries[0]).toEqual({
      key: 'FOO',
      status: 'changed',
      oldValue: 'original',
      newValue: 'updated',
    });
  });

  it('sets fromName and toName correctly', () => {
    const a = makeSnapshot('snap-v1', {});
    const b = makeSnapshot('snap-v2', {});
    const diff = diffSnapshots(a, b);
    expect(diff.fromName).toBe('snap-v1');
    expect(diff.toName).toBe('snap-v2');
  });
});

describe('formatDiff', () => {
  it('shows no differences message when entries are empty', () => {
    const a = makeSnapshot('a', { X: '1' });
    const b = makeSnapshot('b', { X: '1' });
    const output = formatDiff(diffSnapshots(a, b));
    expect(output).toContain('No differences found.');
  });

  it('formats added, removed, and changed entries', () => {
    const a = makeSnapshot('a', { OLD: 'val', KEEP: 'same', CHANGE: 'before' });
    const b = makeSnapshot('b', { NEW: 'added', KEEP: 'same', CHANGE: 'after' });
    const output = formatDiff(diffSnapshots(a, b));
    expect(output).toContain('+ NEW=added');
    expect(output).toContain('- OLD=val');
    expect(output).toContain('~ CHANGE: before → after');
  });
});
