import { Snapshot } from '../storage/types';

export type ExportFormat = 'shell' | 'dotenv' | 'json';

/**
 * Exports a snapshot's env vars as a formatted string.
 */
export function exportSnapshot(snapshot: Snapshot, format: ExportFormat = 'dotenv'): string {
  switch (format) {
    case 'shell':
      return formatShell(snapshot.env);
    case 'dotenv':
      return formatDotenv(snapshot.env);
    case 'json':
      return JSON.stringify(snapshot.env, null, 2);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function formatDotenv(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${escapeDotenvValue(value)}`)
    .join('\n');
}

function formatShell(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([key, value]) => `export ${key}=${escapeShellValue(value)}`)
    .join('\n');
}

function escapeDotenvValue(value: string): string {
  if (/[\s"'\\#]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function escapeShellValue(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}' `;
}
