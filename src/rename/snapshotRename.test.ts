import { renameSnapshot, formatRenameResult } from './snapshotRename';
import * as store from '../storage/snapshotStore';
import { SnapshotStore } from '../storage/types';

const makeStore = (keys: string[]): SnapshotStore => ({
  snapshots: Object.fromEntries(
    keys.map((k) => [
      k,
      { name: k, timestamp: Date.now(), variables: { FOO: 'bar' }, tags: [] },
    ])
  ),
});

describe('renameSnapshot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renames an existing snapshot', async () => {
    jest.spyOn(store, 'readStore').mockResolvedValue(makeStore(['alpha']));
    const writeSpy = jest.spyOn(store, 'writeStore').mockResolvedValue();

    const result = await renameSnapshot('alpha', 'beta');

    expect(result.success).toBe(true);
    expect(result.oldName).toBe('alpha');
    expect(result.newName).toBe('beta');
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const written: SnapshotStore = writeSpy.mock.calls[0][0];
    expect(written.snapshots['beta']).toBeDefined();
    expect(written.snapshots['alpha']).toBeUndefined();
    expect(written.snapshots['beta'].name).toBe('beta');
  });

  it('returns error when old snapshot not found', async () => {
    jest.spyOn(store, 'readStore').mockResolvedValue(makeStore([]));
    jest.spyOn(store, 'writeStore').mockResolvedValue();

    const result = await renameSnapshot('missing', 'newname');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it('returns error when new name already exists', async () => {
    jest.spyOn(store, 'readStore').mockResolvedValue(makeStore(['alpha', 'beta']));
    jest.spyOn(store, 'writeStore').mockResolvedValue();

    const result = await renameSnapshot('alpha', 'beta');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it('returns error for invalid new name', async () => {
    jest.spyOn(store, 'readStore').mockResolvedValue(makeStore(['alpha']));
    jest.spyOn(store, 'writeStore').mockResolvedValue();

    const result = await renameSnapshot('alpha', 'bad name!');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid snapshot name/);
  });
});

describe('formatRenameResult', () => {
  it('formats success message', () => {
    const msg = formatRenameResult({ success: true, oldName: 'a', newName: 'b' });
    expect(msg).toContain('renamed to "b"');
  });

  it('formats error message', () => {
    const msg = formatRenameResult({ success: false, oldName: 'a', newName: 'b', error: 'oops' });
    expect(msg).toContain('Error: oops');
  });
});
