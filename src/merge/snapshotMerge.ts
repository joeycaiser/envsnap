import { Snapshot, EnvVars } from '../storage/types';

export type MergeStrategy = 'ours' | 'theirs' | 'combine';

export interface MergeResult {
  merged: EnvVars;
  conflicts: string[];
  added: string[];
  overwritten: string[];
}

/**
 * Merges two snapshots into a single set of env vars.
 * @param base - The base snapshot (ours)
 * @param incoming - The incoming snapshot (theirs)
 * @param strategy - How to handle conflicts
 */
export function mergeSnapshots(
  base: Snapshot,
  incoming: Snapshot,
  strategy: MergeStrategy = 'ours'
): MergeResult {
  const merged: EnvVars = { ...base.vars };
  const conflicts: string[] = [];
  const added: string[] = [];
  const overwritten: string[] = [];

  for (const [key, value] of Object.entries(incoming.vars)) {
    if (!(key in merged)) {
      merged[key] = value;
      added.push(key);
    } else if (merged[key] !== value) {
      conflicts.push(key);
      if (strategy === 'theirs') {
        overwritten.push(key);
        merged[key] = value;
      } else if (strategy === 'combine') {
        // combine keeps both by suffixing the incoming value
        merged[`${key}_MERGED`] = value;
        added.push(`${key}_MERGED`);
      }
      // 'ours' keeps base value — no change
    }
  }

  return { merged, conflicts, added, overwritten };
}

export function formatMergeResult(
  result: MergeResult,
  strategy: MergeStrategy
): string {
  const lines: string[] = [];
  lines.push(`Merge strategy: ${strategy}`);
  lines.push(`  Added keys   : ${result.added.length}`);
  if (result.added.length > 0) {
    result.added.forEach(k => lines.push(`    + ${k}`));
  }
  lines.push(`  Conflicts    : ${result.conflicts.length}`);
  if (result.conflicts.length > 0) {
    result.conflicts.forEach(k => {
      const resolved = result.overwritten.includes(k) ? 'theirs' : strategy === 'combine' ? 'combined' : 'ours';
      lines.push(`    ~ ${k} (resolved: ${resolved})`);
    });
  }
  return lines.join('\n');
}
