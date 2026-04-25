import { readStore, writeStore } from '../storage/snapshotStore';

export interface AliasMap {
  [alias: string]: string; // alias -> snapshotId
}

export function setAlias(snapshotId: string, alias: string): void {
  const store = readStore();
  if (!store.snapshots[snapshotId]) {
    throw new Error(`Snapshot '${snapshotId}' not found.`);
  }
  if (!store.aliases) {
    store.aliases = {};
  }
  const existing = Object.entries(store.aliases).find(([, id]) => id === snapshotId);
  if (existing) {
    delete store.aliases[existing[0]];
  }
  store.aliases[alias] = snapshotId;
  writeStore(store);
}

export function removeAlias(alias: string): void {
  const store = readStore();
  if (!store.aliases || !store.aliases[alias]) {
    throw new Error(`Alias '${alias}' not found.`);
  }
  delete store.aliases[alias];
  writeStore(store);
}

export function resolveAlias(aliasOrId: string): string {
  const store = readStore();
  if (store.aliases && store.aliases[aliasOrId]) {
    return store.aliases[aliasOrId];
  }
  return aliasOrId;
}

export function listAliases(): AliasMap {
  const store = readStore();
  return store.aliases ?? {};
}

export function formatAliasList(aliases: AliasMap): string {
  const entries = Object.entries(aliases);
  if (entries.length === 0) {
    return 'No aliases defined.';
  }
  return entries.map(([alias, id]) => `  ${alias.padEnd(20)} -> ${id}`).join('\n');
}
