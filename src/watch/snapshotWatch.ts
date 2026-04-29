import * as fs from "fs";
import * as path from "path";
import * as chokidar from "chokidar";
import { createSnapshot } from "../storage/snapshotFactory";
import { saveSnapshot } from "../storage/snapshotStore";
import { recordAudit } from "../audit/snapshotAudit";

export interface WatchOptions {
  label?: string;
  debounceMs?: number;
  envFiles?: string[];
}

export interface WatchHandle {
  stop: () => void;
  filePath: string;
}

const DEFAULT_ENV_FILES = [".env", ".env.local", ".env.development"];
const DEFAULT_DEBOUNCE_MS = 500;

function resolveEnvFiles(envFiles: string[]): string[] {
  return envFiles
    .map((f) => path.resolve(process.cwd(), f))
    .filter((f) => fs.existsSync(f));
}

export function watchEnvFiles(
  options: WatchOptions = {},
  onSnapshot?: (name: string) => void
): WatchHandle {
  const {
    label = "auto-watch",
    debounceMs = DEFAULT_DEBOUNCE_MS,
    envFiles = DEFAULT_ENV_FILES,
  } = options;

  const targets = resolveEnvFiles(envFiles);

  if (targets.length === 0) {
    throw new Error("No env files found to watch in current directory.");
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = chokidar.watch(targets, { ignoreInitial: true });

  const handleChange = async (filePath: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const timestamp = Date.now();
      const name = `${label}-${timestamp}`;
      const snapshot = createSnapshot(name, process.env as Record<string, string>);
      await saveSnapshot(snapshot);
      await recordAudit({
        action: "watch-snapshot",
        snapshotName: name,
        detail: `Triggered by change in ${path.basename(filePath)}`,
        timestamp,
      });
      if (onSnapshot) onSnapshot(name);
    }, debounceMs);
  };

  watcher.on("change", handleChange);
  watcher.on("add", handleChange);

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
    filePath: targets[0],
  };
}

export function formatWatchStatus(targets: string[]): string {
  const lines = ["Watching env files:"];
  targets.forEach((t) => lines.push(`  - ${t}`));
  return lines.join("\n");
}
