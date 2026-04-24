import fs from 'fs';
import path from 'path';
import os from 'os';
import { Snapshot } from './types';

const STORE_DIR = path.join(os.homedir(), '.envsnap');
const STORE_FILE = path.join(STORE_DIR, 'snapshots.json');

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readStore(): Record<string, Snapshot> {
  ensureStoreDir();
  if (!fs.existsSync(STORE_FILE)) {
    return {};
  }
  const raw = fs.readFileSync(STORE_FILE, 'utf-8');
  return JSON.parse(raw) as Record<string, Snapshot>;
}

function writeStore(data: Record<string, Snapshot>): void {
  ensureStoreDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveSnapshot(snapshot: Snapshot): void {
  const store = readStore();
  store[snapshot.name] = snapshot;
  writeStore(store);
}

export function getSnapshot(name: string): Snapshot | undefined {
  const store = readStore();
  return store[name];
}

export function listSnapshots(): Snapshot[] {
  const store = readStore();
  return Object.values(store).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function deleteSnapshot(name: string): boolean {
  const store = readStore();
  if (!store[name]) return false;
  delete store[name];
  writeStore(store);
  return true;
}
