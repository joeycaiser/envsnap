import { getSnapshot, saveSnapshot } from '../storage/snapshotStore';
import { createSnapshot } from '../storage/snapshotFactory';
import { mergeSnapshots, formatMergeResult, MergeStrategy } from './snapshotMerge';

/**
 * CLI handler for the `merge` command.
 * Merges two existing snapshots and saves the result under a new name.
 */
export async function handleMerge(
  baseName: string,
  incomingName: string,
  outputName: string,
  strategy: MergeStrategy = 'ours'
): Promise<void> {
  const base = await getSnapshot(baseName);
  if (!base) {
    console.error(`Snapshot not found: ${baseName}`);
    process.exit(1);
  }

  const incoming = await getSnapshot(incomingName);
  if (!incoming) {
    console.error(`Snapshot not found: ${incomingName}`);
    process.exit(1);
  }

  const result = mergeSnapshots(base, incoming, strategy);
  const merged = createSnapshot(outputName, result.merged);
  await saveSnapshot(merged);

  console.log(`Merged '${baseName}' + '${incomingName}' → '${outputName}'`);
  console.log(formatMergeResult(result, strategy));
}
