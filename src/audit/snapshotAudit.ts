/**
 * snapshotAudit.ts
 * Provides audit logging for snapshot operations (save, restore, delete, encrypt, etc.)
 * Audit entries are stored in a separate append-only log file.
 */

import fs from "fs";
import path from "path";
import os from "os";

const AUDIT_DIR = path.join(os.homedir(), ".envsnap");
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.log");

export type AuditAction =
  | "save"
  | "restore"
  | "delete"
  | "encrypt"
  | "decrypt"
  | "export"
  | "merge"
  | "tag"
  | "alias"
  | "profile"
  | "schedule"
  | "lint"
  | "validate";

export interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  snapshotId?: string;
  details?: string;
  user?: string;
}

/** Ensure the audit log directory exists */
function ensureAuditDir(): void {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }
}

/**
 * Append a new audit entry to the audit log.
 * Each entry is stored as a newline-delimited JSON record (NDJSON).
 */
export function recordAudit(
  action: AuditAction,
  snapshotId?: string,
  details?: string
): void {
  ensureAuditDir();

  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    snapshotId,
    details,
    user: os.userInfo().username,
  };

  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(AUDIT_FILE, line, "utf-8");
}

/**
 * Read all audit entries from the log file.
 * Returns entries in chronological order.
 */
export function getAuditLog(): AuditEntry[] {
  ensureAuditDir();

  if (!fs.existsSync(AUDIT_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(AUDIT_FILE, "utf-8");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as AuditEntry);
}

/**
 * Clear the entire audit log.
 */
export function clearAuditLog(): void {
  ensureAuditDir();
  fs.writeFileSync(AUDIT_FILE, "", "utf-8");
}

/**
 * Format audit entries for human-readable CLI output.
 */
export function formatAuditLog(entries: AuditEntry[]): string {
  if (entries.length === 0) {
    return "No audit entries found.";
  }

  return entries
    .map((e) => {
      const ts = new Date(e.timestamp).toLocaleString();
      const id = e.snapshotId ? ` [${e.snapshotId}]` : "";
      const detail = e.details ? ` — ${e.details}` : "";
      const user = e.user ? ` (${e.user})` : "";
      return `${ts}  ${e.action.toUpperCase()}${id}${detail}${user}`;
    })
    .join("\n");
}

/**
 * Filter audit entries by action type.
 */
export function filterAuditByAction(
  entries: AuditEntry[],
  action: AuditAction
): AuditEntry[] {
  return entries.filter((e) => e.action === action);
}

/**
 * Filter audit entries by snapshot ID.
 */
export function filterAuditBySnapshot(
  entries: AuditEntry[],
  snapshotId: string
): AuditEntry[] {
  return entries.filter((e) => e.snapshotId === snapshotId);
}
