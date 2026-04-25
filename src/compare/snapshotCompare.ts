import { Snapshot } from '../storage/types';
import { getSnapshot } from '../storage/snapshotStore';

export interface CompareResult {
  nameA: string;
  nameB: string;
  onlyInA: Record<string, string>;
  onlyInB: Record<string, string>;
  changedKeys: Record<string, { a: string; b: string }>;
  sharedKeys: Record<string, string>;
  totalKeys: number;
  matchPercent: number;
}

export function compareSnapshots(a: Snapshot, b: Snapshot): CompareResult {
  const keysA = new Set(Object.keys(a.env));
  const keysB = new Set(Object.keys(b.env));

  const onlyInA: Record<string, string> = {};
  const onlyInB: Record<string, string> = {};
  const changedKeys: Record<string, { a: string; b: string }> = {};
  const sharedKeys: Record<string, string> = {};

  for (const key of keysA) {
    if (!keysB.has(key)) {
      onlyInA[key] = a.env[key];
    } else if (a.env[key] !== b.env[key]) {
      changedKeys[key] = { a: a.env[key], b: b.env[key] };
    } else {
      sharedKeys[key] = a.env[key];
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      onlyInB[key] = b.env[key];
    }
  }

  const totalKeys = new Set([...keysA, ...keysB]).size;
  const matchPercent =
    totalKeys === 0
      ? 100
      : Math.round((Object.keys(sharedKeys).length / totalKeys) * 100);

  return {
    nameA: a.name,
    nameB: b.name,
    onlyInA,
    onlyInB,
    changedKeys,
    sharedKeys,
    totalKeys,
    matchPercent,
  };
}

export function formatCompareResult(result: CompareResult): string {
  const lines: string[] = [];
  lines.push(`Comparing "${result.nameA}" vs "${result.nameB}"`);
  lines.push(`Match: ${result.matchPercent}% (${result.totalKeys} total keys)\n`);

  if (Object.keys(result.onlyInA).length > 0) {
    lines.push(`Only in "${result.nameA}":`);
    for (const [k, v] of Object.entries(result.onlyInA)) {
      lines.push(`  - ${k}=${v}`);
    }
    lines.push('');
  }

  if (Object.keys(result.onlyInB).length > 0) {
    lines.push(`Only in "${result.nameB}":`);
    for (const [k, v] of Object.entries(result.onlyInB)) {
      lines.push(`  + ${k}=${v}`);
    }
    lines.push('');
  }

  if (Object.keys(result.changedKeys).length > 0) {
    lines.push('Changed:');
    for (const [k, { a, b }] of Object.entries(result.changedKeys)) {
      lines.push(`  ~ ${k}: "${a}" → "${b}"`);
    }
    lines.push('');
  }

  if (Object.keys(result.sharedKeys).length > 0) {
    lines.push(`Shared (${Object.keys(result.sharedKeys).length} keys): ${Object.keys(result.sharedKeys).join(', ')}`);
  }

  return lines.join('\n');
}
