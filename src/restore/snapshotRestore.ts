import { Snapshot } from '../storage/types';

export interface RestoreResult {
  applied: string[];
  skipped: string[];
  errors: string[];
}

export interface RestoreOptions {
  overwrite?: boolean;
  dryRun?: boolean;
  keys?: string[];
}

/**
 * Applies snapshot env vars to the current process.env.
 * Returns a summary of what was applied, skipped, or errored.
 */
export function restoreSnapshot(
  snapshot: Snapshot,
  options: RestoreOptions = {}
): RestoreResult {
  const { overwrite = false, dryRun = false, keys } = options;
  const result: RestoreResult = { applied: [], skipped: [], errors: [] };

  const entries = Object.entries(snapshot.env);

  for (const [key, value] of entries) {
    if (keys && !keys.includes(key)) {
      result.skipped.push(key);
      continue;
    }

    if (!overwrite && key in process.env) {
      result.skipped.push(key);
      continue;
    }

    try {
      if (!dryRun) {
        process.env[key] = value;
      }
      result.applied.push(key);
    } catch (err) {
      result.errors.push(key);
    }
  }

  return result;
}

/**
 * Removes env vars that were set by the snapshot from process.env.
 */
export function unrestoreSnapshot(
  snapshot: Snapshot,
  options: Pick<RestoreOptions, 'keys'> = {}
): string[] {
  const { keys } = options;
  const removed: string[] = [];

  for (const key of Object.keys(snapshot.env)) {
    if (keys && !keys.includes(key)) continue;
    if (key in process.env) {
      delete process.env[key];
      removed.push(key);
    }
  }

  return removed;
}
