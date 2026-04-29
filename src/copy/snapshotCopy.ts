import { getSnapshot, saveSnapshot } from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

export interface CopyResult {
  success: boolean;
  sourceId: string;
  targetId: string;
  message: string;
}

export async function copySnapshot(
  sourceId: string,
  targetId: string,
  overwrite = false
): Promise<CopyResult> {
  const source = await getSnapshot(sourceId);
  if (!source) {
    return {
      success: false,
      sourceId,
      targetId,
      message: `Source snapshot "${sourceId}" not found.`,
    };
  }

  if (!overwrite) {
    const existing = await getSnapshot(targetId);
    if (existing) {
      return {
        success: false,
        sourceId,
        targetId,
        message: `Target snapshot "${targetId}" already exists. Use --overwrite to replace it.`,
      };
    }
  }

  const copied: Snapshot = {
    ...source,
    id: targetId,
    name: targetId,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(copied);

  return {
    success: true,
    sourceId,
    targetId,
    message: `Snapshot "${sourceId}" copied to "${targetId}" successfully.`,
  };
}

export function formatCopyResult(result: CopyResult): string {
  if (!result.success) {
    return `✗ ${result.message}`;
  }
  return `✓ ${result.message}`;
}
