/**
 * snapshotProfile.ts
 * Manage named environment profiles — groups of snapshots associated with
 * a project or context (e.g. "work", "personal", "ci").
 */

import { readStore, writeStore } from '../storage/snapshotStore';

export interface Profile {
  name: string;
  description?: string;
  snapshotIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  profiles: Record<string, Profile>;
}

/** Read the profile section from the store, initialising if absent. */
function readProfiles(): ProfileStore {
  const store = readStore();
  if (!store.profiles) {
    store.profiles = {};
  }
  return store as unknown as ProfileStore;
}

/** Persist the updated profile map back to the store. */
function writeProfiles(profileStore: ProfileStore): void {
  const store = readStore();
  (store as unknown as ProfileStore).profiles = profileStore.profiles;
  writeStore(store);
}

/**
 * Create a new profile. Throws if a profile with the same name already exists.
 */
export function createProfile(name: string, description?: string): Profile {
  const store = readProfiles();
  if (store.profiles[name]) {
    throw new Error(`Profile "${name}" already exists.`);
  }
  const now = new Date().toISOString();
  const profile: Profile = {
    name,
    description,
    snapshotIds: [],
    createdAt: now,
    updatedAt: now,
  };
  store.profiles[name] = profile;
  writeProfiles(store);
  return profile;
}

/**
 * Add a snapshot ID to an existing profile.
 * Silently skips duplicates.
 */
export function addSnapshotToProfile(profileName: string, snapshotId: string): Profile {
  const store = readProfiles();
  const profile = store.profiles[profileName];
  if (!profile) {
    throw new Error(`Profile "${profileName}" not found.`);
  }
  if (!profile.snapshotIds.includes(snapshotId)) {
    profile.snapshotIds.push(snapshotId);
    profile.updatedAt = new Date().toISOString();
  }
  writeProfiles(store);
  return profile;
}

/**
 * Remove a snapshot ID from a profile.
 */
export function removeSnapshotFromProfile(profileName: string, snapshotId: string): Profile {
  const store = readProfiles();
  const profile = store.profiles[profileName];
  if (!profile) {
    throw new Error(`Profile "${profileName}" not found.`);
  }
  profile.snapshotIds = profile.snapshotIds.filter((id) => id !== snapshotId);
  profile.updatedAt = new Date().toISOString();
  writeProfiles(store);
  return profile;
}

/**
 * Delete a profile entirely.
 */
export function deleteProfile(name: string): void {
  const store = readProfiles();
  if (!store.profiles[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  delete store.profiles[name];
  writeProfiles(store);
}

/**
 * Retrieve a single profile by name.
 */
export function getProfile(name: string): Profile {
  const store = readProfiles();
  const profile = store.profiles[name];
  if (!profile) {
    throw new Error(`Profile "${name}" not found.`);
  }
  return profile;
}

/**
 * List all profiles, sorted alphabetically by name.
 */
export function listProfiles(): Profile[] {
  const store = readProfiles();
  return Object.values(store.profiles).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Format profiles for human-readable CLI output.
 */
export function formatProfileList(profiles: Profile[]): string {
  if (profiles.length === 0) {
    return 'No profiles found.';
  }
  return profiles
    .map((p) => {
      const desc = p.description ? ` — ${p.description}` : '';
      const count = p.snapshotIds.length;
      return `• ${p.name}${desc} (${count} snapshot${count !== 1 ? 's' : ''}, updated ${p.updatedAt})`;
    })
    .join('\n');
}
