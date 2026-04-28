import { cloneSnapshot, formatCloneResult } from './snapshotClone';
import * as store from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

const baseSnapshot: Snapshot = {
  name: 'dev',
  createdAt: '2024-01-01T00:00:00.000Z',
  variables: { NODE_ENV: 'development', PORT: '3000' },
  tags: ['dev'],
};

const mockGetSnapshot = jest.spyOn(store, 'getSnapshot');
const mockSaveSnapshot = jest.spyOn(store, 'saveSnapshot').mockImplementation(() => {});

beforeEach(() => jest.clearAllMocks());

describe('cloneSnapshot', () => {
  it('returns error when source not found', () => {
    mockGetSnapshot.mockReturnValue(undefined);
    const result = cloneSnapshot('missing', 'copy');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it('returns error when target exists and overwrite is false', () => {
    mockGetSnapshot.mockReturnValue(baseSnapshot);
    const result = cloneSnapshot('dev', 'dev');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it('clones snapshot with new name and timestamp', () => {
    mockGetSnapshot.mockImplementation((name) =>
      name === 'dev' ? baseSnapshot : undefined
    );
    const result = cloneSnapshot('dev', 'dev-copy');
    expect(result.success).toBe(true);
    expect(mockSaveSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'dev-copy', variables: baseSnapshot.variables })
    );
  });

  it('overwrites existing snapshot when overwrite=true', () => {
    mockGetSnapshot.mockReturnValue(baseSnapshot);
    const result = cloneSnapshot('dev', 'staging', true);
    expect(result.success).toBe(true);
  });

  it('copies tags array independently', () => {
    mockGetSnapshot.mockImplementation((name) =>
      name === 'dev' ? baseSnapshot : undefined
    );
    cloneSnapshot('dev', 'dev-copy');
    const saved = mockSaveSnapshot.mock.calls[0][0] as Snapshot;
    expect(saved.tags).toEqual(['dev']);
    expect(saved.tags).not.toBe(baseSnapshot.tags);
  });
});

describe('formatCloneResult', () => {
  it('formats success message', () => {
    const msg = formatCloneResult({ success: true, sourceName: 'dev', targetName: 'staging' });
    expect(msg).toContain('dev');
    expect(msg).toContain('staging');
    expect(msg).toContain('✔');
  });

  it('formats error message', () => {
    const msg = formatCloneResult({ success: false, sourceName: 'dev', targetName: 'x', error: 'not found' });
    expect(msg).toContain('✗');
    expect(msg).toContain('not found');
  });
});
