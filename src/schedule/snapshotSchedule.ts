/**
 * snapshotSchedule.ts
 *
 * Provides scheduling metadata for automatic snapshots.
 * Stores cron-like schedule entries that external runners (e.g. cron, launchd)
 * can read to know when to trigger `envsnap save`.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface ScheduleEntry {
  id: string;
  /** Human-readable label for this schedule */
  label: string;
  /** Cron expression, e.g. "0 9 * * 1-5" */
  cron: string;
  /** Project directory the snapshot should be taken from */
  projectPath: string;
  /** Optional snapshot name prefix */
  snapshotPrefix?: string;
  /** Whether this schedule is currently active */
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface ScheduleStore {
  schedules: ScheduleEntry[];
}

const STORE_DIR = path.join(os.homedir(), ".envsnap");
const SCHEDULE_FILE = path.join(STORE_DIR, "schedules.json");

/** Ensure the store directory exists */
function ensureDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

/** Read all schedule entries from disk */
export function readSchedules(): ScheduleStore {
  ensureDir();
  if (!fs.existsSync(SCHEDULE_FILE)) {
    return { schedules: [] };
  }
  const raw = fs.readFileSync(SCHEDULE_FILE, "utf-8");
  return JSON.parse(raw) as ScheduleStore;
}

/** Persist schedule entries to disk */
export function writeSchedules(store: ScheduleStore): void {
  ensureDir();
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/** Add or update a schedule entry */
export function upsertSchedule(
  entry: Omit<ScheduleEntry, "id" | "createdAt">
): ScheduleEntry {
  const store = readSchedules();
  const existing = store.schedules.find(
    (s) => s.label === entry.label && s.projectPath === entry.projectPath
  );

  if (existing) {
    Object.assign(existing, entry);
    writeSchedules(store);
    return existing;
  }

  const newEntry: ScheduleEntry = {
    ...entry,
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  store.schedules.push(newEntry);
  writeSchedules(store);
  return newEntry;
}

/** Remove a schedule by id */
export function removeSchedule(id: string): boolean {
  const store = readSchedules();
  const before = store.schedules.length;
  store.schedules = store.schedules.filter((s) => s.id !== id);
  if (store.schedules.length === before) return false;
  writeSchedules(store);
  return true;
}

/** Mark a schedule as last triggered now */
export function touchSchedule(id: string): void {
  const store = readSchedules();
  const entry = store.schedules.find((s) => s.id === id);
  if (entry) {
    entry.lastTriggeredAt = new Date().toISOString();
    writeSchedules(store);
  }
}

/** Return only enabled schedules */
export function getActiveSchedules(): ScheduleEntry[] {
  return readSchedules().schedules.filter((s) => s.enabled);
}

/** Format schedule list for CLI display */
export function formatScheduleList(schedules: ScheduleEntry[]): string {
  if (schedules.length === 0) return "No schedules defined.";
  return schedules
    .map((s) => {
      const status = s.enabled ? "✓" : "✗";
      const last = s.lastTriggeredAt
        ? `last: ${new Date(s.lastTriggeredAt).toLocaleString()}`
        : "never triggered";
      return `[${status}] ${s.label} (${s.cron}) — ${s.projectPath} — ${last}`;
    })
    .join("\n");
}
