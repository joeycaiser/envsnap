import * as path from 'path';
import * as fs from 'fs';
import { Snapshot } from '../storage/types';
import { encryptSnapshot, decryptSnapshot, isEncryptedPayload, EncryptedPayload } from './snapshotEncrypt';
import { ensureStoreDir } from '../storage/snapshotStore';

const ENCRYPTED_STORE_FILE = 'encrypted-snapshots.json';

type EncryptedStore = Record<string, EncryptedPayload>;

function getEncryptedStorePath(): string {
  const storeDir = ensureStoreDir();
  return path.join(storeDir, ENCRYPTED_STORE_FILE);
}

function readEncryptedStore(): EncryptedStore {
  const filePath = getEncryptedStorePath();
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as EncryptedStore;
}

function writeEncryptedStore(store: EncryptedStore): void {
  const filePath = getEncryptedStorePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function saveEncryptedSnapshot(
  snapshot: Snapshot,
  passphrase: string
): void {
  const store = readEncryptedStore();
  store[snapshot.id] = encryptSnapshot(snapshot, passphrase);
  writeEncryptedStore(store);
}

export function loadEncryptedSnapshot(
  id: string,
  passphrase: string
): Snapshot | null {
  const store = readEncryptedStore();
  const payload = store[id];
  if (!payload || !isEncryptedPayload(payload)) return null;
  return decryptSnapshot(payload, passphrase);
}

export function listEncryptedSnapshotIds(): string[] {
  return Object.keys(readEncryptedStore());
}

export function deleteEncryptedSnapshot(id: string): boolean {
  const store = readEncryptedStore();
  if (!store[id]) return false;
  delete store[id];
  writeEncryptedStore(store);
  return true;
}
