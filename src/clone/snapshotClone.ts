import { getSnapshot, saveSnapshot } from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

export interface CloneResult {
  success: boolean;
  sourceName: string;
  targetName: string;
  error?: string;
}

export function cloneSnapshot(
  sourceName: string,
  targetName: string,
  overwrite = false
): CloneResult {
  const source = getSnapshot(sourceName);
  if (!source) {
    return { success: false, sourceName, targetName, error: `Snapshot '${sourceName}' not found` };
  }

  const existing = getSnapshot(targetName);
  if (existing && !overwrite) {
    return {
      success: false,
      sourceName,
      targetName,
      error: `Snapshot '${targetName}' already exists. Use --overwrite to replace it.`,
    };
  }

  const cloned: Snapshot = {
    ...source,
    name: targetName,
    createdAt: new Date().toISOString(),
    tags: source.tags ? [...source.tags] : [],
  };

  saveSnapshot(cloned);

  return { success: true, sourceName, targetName };
}

export function formatCloneResult(result: CloneResult): string {
  if (!result.success) {
    return `✗ Clone failed: ${result.error}`;
  }
  return `✔ Cloned '${result.sourceName}' → '${result.targetName}'`;
}
