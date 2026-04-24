import { readStore, writeStore } from '../storage/snapshotStore';

export function addTag(snapshotId: string, tag: string): void {
  const store = readStore();
  const snapshot = store.snapshots[snapshotId];
  if (!snapshot) {
    throw new Error(`Snapshot '${snapshotId}' not found.`);
  }
  if (!snapshot.tags) {
    snapshot.tags = [];
  }
  if (snapshot.tags.includes(tag)) {
    throw new Error(`Tag '${tag}' already exists on snapshot '${snapshotId}'.`);
  }
  snapshot.tags.push(tag);
  writeStore(store);
}

export function removeTag(snapshotId: string, tag: string): void {
  const store = readStore();
  const snapshot = store.snapshots[snapshotId];
  if (!snapshot) {
    throw new Error(`Snapshot '${snapshotId}' not found.`);
  }
  if (!snapshot.tags || !snapshot.tags.includes(tag)) {
    throw new Error(`Tag '${tag}' not found on snapshot '${snapshotId}'.`);
  }
  snapshot.tags = snapshot.tags.filter((t) => t !== tag);
  writeStore(store);
}

export function listTags(snapshotId: string): string[] {
  const store = readStore();
  const snapshot = store.snapshots[snapshotId];
  if (!snapshot) {
    throw new Error(`Snapshot '${snapshotId}' not found.`);
  }
  return snapshot.tags ?? [];
}

export function findByTag(tag: string): string[] {
  const store = readStore();
  return Object.entries(store.snapshots)
    .filter(([, snap]) => snap.tags?.includes(tag))
    .map(([id]) => id);
}

export function formatTagList(snapshotId: string, tags: string[]): string {
  if (tags.length === 0) {
    return `No tags on snapshot '${snapshotId}'.`;
  }
  return `Tags for '${snapshotId}':\n` + tags.map((t) => `  - ${t}`).join('\n');
}
