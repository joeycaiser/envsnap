import * as fs from "fs";
import * as path from "path";
import { readStore, writeStore } from "../storage/snapshotStore";

const LOCK_KEY = "__locks__";

export interface LockEntry {
  snapshotId: string;
  lockedAt: string;
  reason?: string;
}

function getLocks(store: Record<string, unknown>): Record<string, LockEntry> {
  return (store[LOCK_KEY] as Record<string, LockEntry>) ?? {};
}

export function lockSnapshot(
  snapshotId: string,
  reason?: string
): { success: boolean; message: string } {
  const store = readStore();
  const locks = getLocks(store);

  if (locks[snapshotId]) {
    return { success: false, message: `Snapshot "${snapshotId}" is already locked.` };
  }

  locks[snapshotId] = {
    snapshotId,
    lockedAt: new Date().toISOString(),
    reason,
  };

  store[LOCK_KEY] = locks;
  writeStore(store);

  return { success: true, message: `Snapshot "${snapshotId}" locked.` };
}

export function unlockSnapshot(
  snapshotId: string
): { success: boolean; message: string } {
  const store = readStore();
  const locks = getLocks(store);

  if (!locks[snapshotId]) {
    return { success: false, message: `Snapshot "${snapshotId}" is not locked.` };
  }

  delete locks[snapshotId];
  store[LOCK_KEY] = locks;
  writeStore(store);

  return { success: true, message: `Snapshot "${snapshotId}" unlocked.` };
}

export function isLocked(snapshotId: string): boolean {
  const store = readStore();
  const locks = getLocks(store);
  return !!locks[snapshotId];
}

export function listLocks(): LockEntry[] {
  const store = readStore();
  return Object.values(getLocks(store));
}

export function formatLockList(locks: LockEntry[]): string {
  if (locks.length === 0) return "No locked snapshots.";
  return locks
    .map((l) => {
      const reason = l.reason ? ` — ${l.reason}` : "";
      return `  🔒 ${l.snapshotId} (locked ${l.lockedAt}${reason})`;
    })
    .join("\n");
}
