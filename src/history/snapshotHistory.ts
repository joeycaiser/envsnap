import { readStore, writeStore } from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

export interface HistoryEntry {
  snapshotName: string;
  action: 'save' | 'restore' | 'delete';
  timestamp: string;
  varCount: number;
}

export interface HistoryStore {
  entries: HistoryEntry[];
}

export function recordHistory(
  snapshotName: string,
  action: HistoryEntry['action'],
  snapshot: Snapshot
): void {
  const store = readStore();
  if (!store.history) {
    store.history = { entries: [] };
  }
  const entry: HistoryEntry = {
    snapshotName,
    action,
    timestamp: new Date().toISOString(),
    varCount: Object.keys(snapshot.vars).length,
  };
  store.history.entries.unshift(entry);
  if (store.history.entries.length > 100) {
    store.history.entries = store.history.entries.slice(0, 100);
  }
  writeStore(store);
}

export function getHistory(limit = 20): HistoryEntry[] {
  const store = readStore();
  const entries: HistoryEntry[] = store.history?.entries ?? [];
  return entries.slice(0, limit);
}

export function clearHistory(): void {
  const store = readStore();
  store.history = { entries: [] };
  writeStore(store);
}

export function formatHistory(entries: HistoryEntry[]): string {
  if (entries.length === 0) return 'No history recorded.';
  const lines = entries.map((e) => {
    const date = new Date(e.timestamp).toLocaleString();
    const action = e.action.padEnd(7);
    return `[${date}]  ${action}  ${e.snapshotName}  (${e.varCount} vars)`;
  });
  return lines.join('\n');
}
