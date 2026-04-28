import { readStore, writeStore } from '../storage/snapshotStore';
import { SnapshotStore } from '../storage/types';

export interface PinEntry {
  snapshotId: string;
  label?: string;
  pinnedAt: string;
}

export function pinSnapshot(snapshotId: string, label?: string): PinEntry {
  const store: SnapshotStore = readStore();
  if (!store.snapshots[snapshotId]) {
    throw new Error(`Snapshot "${snapshotId}" not found.`);
  }
  if (!store.pins) store.pins = {};
  const entry: PinEntry = {
    snapshotId,
    label: label ?? snapshotId,
    pinnedAt: new Date().toISOString(),
  };
  store.pins[snapshotId] = entry;
  writeStore(store);
  return entry;
}

export function unpinSnapshot(snapshotId: string): boolean {
  const store: SnapshotStore = readStore();
  if (!store.pins || !store.pins[snapshotId]) return false;
  delete store.pins[snapshotId];
  writeStore(store);
  return true;
}

export function listPins(): PinEntry[] {
  const store: SnapshotStore = readStore();
  return Object.values(store.pins ?? {});
}

export function isPinned(snapshotId: string): boolean {
  const store: SnapshotStore = readStore();
  return !!store.pins?.[snapshotId];
}

export function formatPinList(pins: PinEntry[]): string {
  if (pins.length === 0) return 'No pinned snapshots.';
  return pins
    .map((p) => `📌 ${p.label ?? p.snapshotId} (${p.snapshotId}) — pinned at ${p.pinnedAt}`)
    .join('\n');
}
