import fs from 'fs';
import os from 'os';
import path from 'path';
import { saveSnapshot, getSnapshot, listSnapshots, deleteSnapshot } from './snapshotStore';
import { Snapshot } from './types';

const STORE_FILE = path.join(os.homedir(), '.envsnap', 'snapshots.json');

const mockSnapshot: Snapshot = {
  name: 'test-snap',
  description: 'A test snapshot',
  createdAt: new Date().toISOString(),
  project: 'my-project',
  vars: { NODE_ENV: 'development', PORT: '3000' },
};

afterEach(() => {
  if (fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({}), 'utf-8');
  }
});

describe('snapshotStore', () => {
  test('saveSnapshot persists a snapshot', () => {
    saveSnapshot(mockSnapshot);
    const result = getSnapshot('test-snap');
    expect(result).toBeDefined();
    expect(result?.name).toBe('test-snap');
    expect(result?.vars.PORT).toBe('3000');
  });

  test('getSnapshot returns undefined for unknown name', () => {
    const result = getSnapshot('nonexistent');
    expect(result).toBeUndefined();
  });

  test('listSnapshots returns all saved snapshots', () => {
    saveSnapshot(mockSnapshot);
    saveSnapshot({ ...mockSnapshot, name: 'another-snap' });
    const list = listSnapshots();
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  test('deleteSnapshot removes a snapshot and returns true', () => {
    saveSnapshot(mockSnapshot);
    const deleted = deleteSnapshot('test-snap');
    expect(deleted).toBe(true);
    expect(getSnapshot('test-snap')).toBeUndefined();
  });

  test('deleteSnapshot returns false for unknown name', () => {
    const deleted = deleteSnapshot('ghost');
    expect(deleted).toBe(false);
  });
});
