import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createProfile,
  addSnapshotToProfile,
  removeSnapshotFromProfile,
  getProfile,
  listProfiles,
  deleteProfile,
  formatProfileList,
} from './snapshotProfile';
import * as store from '../storage/snapshotStore';

vi.mock('../storage/snapshotStore');

const mockReadStore = vi.mocked(store.readStore);
const mockWriteStore = vi.mocked(store.writeStore);

const emptyStore = () => ({ snapshots: {}, profiles: {} });

beforeEach(() => {
  vi.clearAllMocks();
  mockReadStore.mockResolvedValue(emptyStore());
  mockWriteStore.mockResolvedValue(undefined);
});

describe('createProfile', () => {
  it('creates a new profile with metadata', async () => {
    const profile = await createProfile('dev', 'Development environment');
    expect(profile.name).toBe('dev');
    expect(profile.description).toBe('Development environment');
    expect(profile.snapshotIds).toEqual([]);
    expect(mockWriteStore).toHaveBeenCalled();
  });

  it('throws if profile already exists', async () => {
    mockReadStore.mockResolvedValue({
      snapshots: {},
      profiles: { dev: { name: 'dev', description: '', snapshotIds: [], createdAt: '', updatedAt: '' } },
    });
    await expect(createProfile('dev')).rejects.toThrow('Profile "dev" already exists');
  });
});

describe('addSnapshotToProfile', () => {
  it('adds a snapshot id to a profile', async () => {
    mockReadStore.mockResolvedValue({
      snapshots: { snap1: { id: 'snap1', name: 'snap1', env: {}, createdAt: '' } },
      profiles: { dev: { name: 'dev', description: '', snapshotIds: [], createdAt: '', updatedAt: '' } },
    });
    const updated = await addSnapshotToProfile('dev', 'snap1');
    expect(updated.snapshotIds).toContain('snap1');
  });

  it('does not duplicate snapshot ids', async () => {
    mockReadStore.mockResolvedValue({
      snapshots: { snap1: { id: 'snap1', name: 'snap1', env: {}, createdAt: '' } },
      profiles: { dev: { name: 'dev', description: '', snapshotIds: ['snap1'], createdAt: '', updatedAt: '' } },
    });
    const updated = await addSnapshotToProfile('dev', 'snap1');
    expect(updated.snapshotIds.filter((id: string) => id === 'snap1').length).toBe(1);
  });
});

describe('listProfiles', () => {
  it('returns all profiles', async () => {
    mockReadStore.mockResolvedValue({
      snapshots: {},
      profiles: {
        dev: { name: 'dev', description: 'Dev', snapshotIds: [], createdAt: '', updatedAt: '' },
        prod: { name: 'prod', description: 'Prod', snapshotIds: [], createdAt: '', updatedAt: '' },
      },
    });
    const profiles = await listProfiles();
    expect(profiles).toHaveLength(2);
  });
});

describe('formatProfileList', () => {
  it('formats profiles for display', () => {
    const profiles = [
      { name: 'dev', description: 'Dev env', snapshotIds: ['a', 'b'], createdAt: '', updatedAt: '' },
    ];
    const output = formatProfileList(profiles);
    expect(output).toContain('dev');
    expect(output).toContain('Dev env');
    expect(output).toContain('2 snapshot(s)');
  });

  it('shows empty message when no profiles', () => {
    expect(formatProfileList([])).toContain('No profiles found');
  });
});
