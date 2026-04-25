import { mergeSnapshots, formatMergeResult } from './snapshotMerge';
import { Snapshot } from '../storage/types';

const makeSnapshot = (name: string, vars: Record<string, string>): Snapshot => ({
  name,
  vars,
  createdAt: new Date().toISOString(),
  tags: [],
});

describe('mergeSnapshots', () => {
  const base = makeSnapshot('base', { FOO: 'foo', SHARED: 'base-val', ONLY_BASE: 'x' });
  const incoming = makeSnapshot('incoming', { BAR: 'bar', SHARED: 'incoming-val', ONLY_INCOMING: 'y' });

  it('adds keys from incoming that are not in base', () => {
    const result = mergeSnapshots(base, incoming, 'ours');
    expect(result.added).toContain('BAR');
    expect(result.added).toContain('ONLY_INCOMING');
    expect(result.merged['BAR']).toBe('bar');
  });

  it('strategy ours keeps base value on conflict', () => {
    const result = mergeSnapshots(base, incoming, 'ours');
    expect(result.conflicts).toContain('SHARED');
    expect(result.merged['SHARED']).toBe('base-val');
    expect(result.overwritten).not.toContain('SHARED');
  });

  it('strategy theirs overwrites base value on conflict', () => {
    const result = mergeSnapshots(base, incoming, 'theirs');
    expect(result.conflicts).toContain('SHARED');
    expect(result.merged['SHARED']).toBe('incoming-val');
    expect(result.overwritten).toContain('SHARED');
  });

  it('strategy combine adds a _MERGED key for conflicts', () => {
    const result = mergeSnapshots(base, incoming, 'combine');
    expect(result.merged['SHARED']).toBe('base-val');
    expect(result.merged['SHARED_MERGED']).toBe('incoming-val');
    expect(result.added).toContain('SHARED_MERGED');
  });

  it('preserves all base keys', () => {
    const result = mergeSnapshots(base, incoming, 'ours');
    expect(result.merged['ONLY_BASE']).toBe('x');
    expect(result.merged['FOO']).toBe('foo');
  });
});

describe('formatMergeResult', () => {
  it('includes strategy and counts', () => {
    const base = makeSnapshot('base', { A: '1', CONFLICT: 'base' });
    const incoming = makeSnapshot('incoming', { B: '2', CONFLICT: 'theirs' });
    const result = mergeSnapshots(base, incoming, 'theirs');
    const output = formatMergeResult(result, 'theirs');
    expect(output).toContain('theirs');
    expect(output).toContain('Added keys');
    expect(output).toContain('Conflicts');
    expect(output).toContain('+ B');
    expect(output).toContain('~ CONFLICT');
  });
});
