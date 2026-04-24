import { recordHistory, getHistory, clearHistory, formatHistory } from './snapshotHistory';
import { readStore, writeStore } from '../storage/snapshotStore';
import { Snapshot } from '../storage/types';

jest.mock('../storage/snapshotStore');

const mockReadStore = readStore as jest.MockedFunction<typeof readStore>;
const mockWriteStore = writeStore as jest.MockedFunction<typeof writeStore>;

const mockSnapshot: Snapshot = {
  name: 'test',
  createdAt: '2024-01-01T00:00:00.000Z',
  vars: { FOO: 'bar', BAZ: 'qux' },
  tags: [],
};

describe('snapshotHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadStore.mockReturnValue({ snapshots: {}, history: { entries: [] } } as any);
    mockWriteStore.mockImplementation(() => {});
  });

  it('recordHistory adds an entry', () => {
    let stored: any = null;
    mockWriteStore.mockImplementation((s) => { stored = s; });
    recordHistory('test', 'save', mockSnapshot);
    expect(stored.history.entries).toHaveLength(1);
    expect(stored.history.entries[0].snapshotName).toBe('test');
    expect(stored.history.entries[0].action).toBe('save');
    expect(stored.history.entries[0].varCount).toBe(2);
  });

  it('recordHistory initializes history if missing', () => {
    mockReadStore.mockReturnValue({ snapshots: {} } as any);
    let stored: any = null;
    mockWriteStore.mockImplementation((s) => { stored = s; });
    recordHistory('test', 'restore', mockSnapshot);
    expect(stored.history.entries).toHaveLength(1);
  });

  it('getHistory returns limited entries', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({
      snapshotName: `snap${i}`,
      action: 'save' as const,
      timestamp: new Date().toISOString(),
      varCount: 1,
    }));
    mockReadStore.mockReturnValue({ snapshots: {}, history: { entries } } as any);
    const result = getHistory(10);
    expect(result).toHaveLength(10);
  });

  it('clearHistory empties entries', () => {
    let stored: any = null;
    mockWriteStore.mockImplementation((s) => { stored = s; });
    clearHistory();
    expect(stored.history.entries).toHaveLength(0);
  });

  it('formatHistory returns readable string', () => {
    const entries = [{ snapshotName: 'mysnap', action: 'save' as const, timestamp: '2024-06-01T10:00:00.000Z', varCount: 5 }];
    const output = formatHistory(entries);
    expect(output).toContain('mysnap');
    expect(output).toContain('5 vars');
  });

  it('formatHistory returns message when empty', () => {
    expect(formatHistory([])).toBe('No history recorded.');
  });
});
