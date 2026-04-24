import { Snapshot } from '../storage/types';

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export interface SnapshotDiff {
  fromName: string;
  toName: string;
  entries: DiffEntry[];
  addedCount: number;
  removedCount: number;
  changedCount: number;
}

export function diffSnapshots(from: Snapshot, to: Snapshot): SnapshotDiff {
  const entries: DiffEntry[] = [];

  const fromVars = from.variables;
  const toVars = to.variables;

  const allKeys = new Set([...Object.keys(fromVars), ...Object.keys(toVars)]);

  for (const key of allKeys) {
    const inFrom = Object.prototype.hasOwnProperty.call(fromVars, key);
    const inTo = Object.prototype.hasOwnProperty.call(toVars, key);

    if (inFrom && !inTo) {
      entries.push({ key, status: 'removed', oldValue: fromVars[key] });
    } else if (!inFrom && inTo) {
      entries.push({ key, status: 'added', newValue: toVars[key] });
    } else if (fromVars[key] !== toVars[key]) {
      entries.push({
        key,
        status: 'changed',
        oldValue: fromVars[key],
        newValue: toVars[key],
      });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    fromName: from.name,
    toName: to.name,
    entries,
    addedCount: entries.filter((e) => e.status === 'added').length,
    removedCount: entries.filter((e) => e.status === 'removed').length,
    changedCount: entries.filter((e) => e.status === 'changed').length,
  };
}

export function formatDiff(diff: SnapshotDiff): string {
  const lines: string[] = [];
  lines.push(`Diff: ${diff.fromName} → ${diff.toName}`);
  lines.push(
    `Summary: +${diff.addedCount} added, -${diff.removedCount} removed, ~${diff.changedCount} changed`
  );

  if (diff.entries.length === 0) {
    lines.push('No differences found.');
    return lines.join('\n');
  }

  lines.push('');

  for (const entry of diff.entries) {
    if (entry.status === 'added') {
      lines.push(`+ ${entry.key}=${entry.newValue}`);
    } else if (entry.status === 'removed') {
      lines.push(`- ${entry.key}=${entry.oldValue}`);
    } else {
      lines.push(`~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
    }
  }

  return lines.join('\n');
}
