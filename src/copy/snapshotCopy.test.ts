import { copySnapshot, formatCopyResult } from './snapshotCopy';
import * as store from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

jest.mock('../storage/snapshotStore');

const mockGet = store.getSnapshot as jest.Mock;
const mockSave = store.saveSnapshot as jest.Mock;

const baseSnapshot: Snapshot = {
  id: 'snap-a',
  name: 'snap-a',
  createdAt: '2024-01-01T00:00:00.000Z',
  variables: { FOO: 'bar', BAZ: '42' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('copySnapshot', () => {
  it('copies a snapshot to a new id', async () => {
    mockGet.mockImplementation((id: string) =>
      id === 'snap-a' ? Promise.resolve(baseSnapshot) : Promise.resolve(null)
    );

    const result = await copySnapshot('snap-a', 'snap-b');

    expect(result.success).toBe(true);
    expect(result.targetId).toBe('snap-b');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'snap-b', name: 'snap-b', variables: baseSnapshot.variables })
    );
  });

  it('fails if source snapshot does not exist', async () => {
    mockGet.mockResolvedValue(null);

    const result = await copySnapshot('missing', 'snap-b');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('fails if target already exists without overwrite', async () => {
    mockGet.mockResolvedValue(baseSnapshot);

    const result = await copySnapshot('snap-a', 'snap-a');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already exists/);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('overwrites target when overwrite flag is true', async () => {
    mockGet.mockResolvedValue(baseSnapshot);

    const result = await copySnapshot('snap-a', 'snap-a', true);

    expect(result.success).toBe(true);
    expect(mockSave).toHaveBeenCalled();
  });
});

describe('formatCopyResult', () => {
  it('formats a successful result', () => {
    const output = formatCopyResult({ success: true, sourceId: 'a', targetId: 'b', message: 'Copied.' });
    expect(output).toBe('✓ Copied.');
  });

  it('formats a failed result', () => {
    const output = formatCopyResult({ success: false, sourceId: 'a', targetId: 'b', message: 'Not found.' });
    expect(output).toBe('✗ Not found.');
  });
});
