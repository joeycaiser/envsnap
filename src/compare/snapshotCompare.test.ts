import { compareSnapshots, formatCompareResult } from './snapshotCompare';
import { Snapshot } from '../storage/types';

const makeSnapshot = (name: string, env: Record<string, string>): Snapshot => ({
  name,
  env,
  createdAt: new Date().toISOString(),
  tags: [],
});

describe('compareSnapshots', () => {
  it('identifies keys only in A', () => {
    const a = makeSnapshot('a', { FOO: '1', BAR: '2' });
    const b = makeSnapshot('b', { FOO: '1' });
    const result = compareSnapshots(a, b);
    expect(result.onlyInA).toEqual({ BAR: '2' });
    expect(result.onlyInB).toEqual({});
  });

  it('identifies keys only in B', () => {
    const a = makeSnapshot('a', { FOO: '1' });
    const b = makeSnapshot('b', { FOO: '1', BAZ: '3' });
    const result = compareSnapshots(a, b);
    expect(result.onlyInB).toEqual({ BAZ: '3' });
    expect(result.onlyInA).toEqual({});
  });

  it('identifies changed keys', () => {
    const a = makeSnapshot('a', { FOO: 'old' });
    const b = makeSnapshot('b', { FOO: 'new' });
    const result = compareSnapshots(a, b);
    expect(result.changedKeys).toEqual({ FOO: { a: 'old', b: 'new' } });
  });

  it('identifies shared keys', () => {
    const a = makeSnapshot('a', { FOO: '1', BAR: '2' });
    const b = makeSnapshot('b', { FOO: '1', BAR: '2' });
    const result = compareSnapshots(a, b);
    expect(result.sharedKeys).toEqual({ FOO: '1', BAR: '2' });
    expect(result.matchPercent).toBe(100);
  });

  it('returns 100% match for two empty snapshots', () => {
    const a = makeSnapshot('a', {});
    const b = makeSnapshot('b', {});
    const result = compareSnapshots(a, b);
    expect(result.matchPercent).toBe(100);
  });

  it('calculates matchPercent correctly', () => {
    const a = makeSnapshot('a', { A: '1', B: '2', C: '3' });
    const b = makeSnapshot('b', { A: '1', B: 'changed' });
    const result = compareSnapshots(a, b);
    // shared: A (1 key), total: A, B, C = 3 keys => 33%
    expect(result.matchPercent).toBe(33);
  });
});

describe('formatCompareResult', () => {
  it('formats a comparison result with all sections', () => {
    const a = makeSnapshot('dev', { FOO: '1', SHARED: 'x' });
    const b = makeSnapshot('prod', { BAR: '2', SHARED: 'x' });
    const result = compareSnapshots(a, b);
    const output = formatCompareResult(result);
    expect(output).toContain('Comparing "dev" vs "prod"');
    expect(output).toContain('Only in "dev"');
    expect(output).toContain('Only in "prod"');
    expect(output).toContain('Shared');
  });

  it('includes changed key arrow notation', () => {
    const a = makeSnapshot('a', { KEY: 'before' });
    const b = makeSnapshot('b', { KEY: 'after' });
    const result = compareSnapshots(a, b);
    const output = formatCompareResult(result);
    expect(output).toContain('"before" → "after"');
  });
});
