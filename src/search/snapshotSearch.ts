import { SnapshotStore, Snapshot } from '../storage/types';

export interface SearchOptions {
  name?: string;
  project?: string;
  keyContains?: string;
  valueContains?: string;
  after?: Date;
  before?: Date;
}

export interface SearchResult {
  id: string;
  snapshot: Snapshot;
}

export function searchSnapshots(
  store: SnapshotStore,
  options: SearchOptions
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const [id, snapshot] of Object.entries(store.snapshots)) {
    if (options.name && !snapshot.name.toLowerCase().includes(options.name.toLowerCase())) {
      continue;
    }

    if (options.project && snapshot.project !== options.project) {
      continue;
    }

    const createdAt = new Date(snapshot.createdAt);
    if (options.after && createdAt < options.after) {
      continue;
    }
    if (options.before && createdAt > options.before) {
      continue;
    }

    if (options.keyContains) {
      const hasKey = Object.keys(snapshot.env).some((k) =>
        k.toLowerCase().includes(options.keyContains!.toLowerCase())
      );
      if (!hasKey) continue;
    }

    if (options.valueContains) {
      const hasValue = Object.values(snapshot.env).some((v) =>
        v.toLowerCase().includes(options.valueContains!.toLowerCase())
      );
      if (!hasValue) continue;
    }

    results.push({ id, snapshot });
  }

  return results.sort(
    (a, b) =>
      new Date(b.snapshot.createdAt).getTime() -
      new Date(a.snapshot.createdAt).getTime()
  );
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No snapshots found matching the given criteria.';
  }

  const lines = results.map(({ id, snapshot }) => {
    const date = new Date(snapshot.createdAt).toLocaleString();
    const keyCount = Object.keys(snapshot.env).length;
    const project = snapshot.project ? ` [${snapshot.project}]` : '';
    return `  ${id.slice(0, 8)}  ${snapshot.name}${project}  (${keyCount} vars)  ${date}`;
  });

  return [`Found ${results.length} snapshot(s):`, ...lines].join('\n');
}
