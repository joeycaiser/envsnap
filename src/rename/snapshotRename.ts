import { readStore, writeStore } from '../storage/snapshotStore';
import { SnapshotStore } from '../storage/types';

export interface RenameResult {
  success: boolean;
  oldName: string;
  newName: string;
  error?: string;
}

export async function renameSnapshot(
  oldName: string,
  newName: string
): Promise<RenameResult> {
  const store: SnapshotStore = await readStore();

  if (!store.snapshots[oldName]) {
    return {
      success: false,
      oldName,
      newName,
      error: `Snapshot "${oldName}" not found.`,
    };
  }

  if (store.snapshots[newName]) {
    return {
      success: false,
      oldName,
      newName,
      error: `Snapshot "${newName}" already exists.`,
    };
  }

  if (!newName || !/^[\w\-\.]+$/.test(newName)) {
    return {
      success: false,
      oldName,
      newName,
      error: `Invalid snapshot name "${newName}". Use alphanumeric, hyphens, underscores, or dots.`,
    };
  }

  const snapshot = store.snapshots[oldName];
  snapshot.name = newName;
  store.snapshots[newName] = snapshot;
  delete store.snapshots[oldName];

  await writeStore(store);

  return { success: true, oldName, newName };
}

export function formatRenameResult(result: RenameResult): string {
  if (!result.success) {
    return `Error: ${result.error}`;
  }
  return `Snapshot "${result.oldName}" renamed to "${result.newName}" successfully.`;
}
