import { searchSnapshots, formatSearchResults } from './snapshotSearch';
import { SnapshotStore } from '../storage/types';

const mockStore: SnapshotStore = {
  snapshots: {
    'abc123': {
      id: 'abc123',
      name: 'dev-env',
      project: 'my-app',
      createdAt: '2024-01-15T10:00:00.000Z',
      env: { NODE_ENV: 'development', PORT: '3000', DB_HOST: 'localhost' },
    },
    'def456': {
      id: 'def456',
      name: 'prod-env',
      project: 'my-app',
      createdAt: '2024-02-20T12:00:00.000Z',
      env: { NODE_ENV: 'production', PORT: '8080', API_KEY: 'secret' },
    },
    'ghi789': {
      id: 'ghi789',
      name: 'staging',
      project: 'other-app',
      createdAt: '2024-03-01T08:00:00.000Z',
      env: { NODE_ENV: 'staging', PORT: '4000' },
    },
  },
};

describe('searchSnapshots', () => {
  it('returns all snapshots when no options given', () => {
    const results = searchSnapshots(mockStore, {});
    expect(results).toHaveLength(3);
  });

  it('filters by name (case-insensitive)', () => {
    const results = searchSnapshots(mockStore, { name: 'dev' });
    expect(results).toHaveLength(1);
    expect(results[0].snapshot.name).toBe('dev-env');
  });

  it('filters by project', () => {
    const results = searchSnapshots(mockStore, { project: 'my-app' });
    expect(results).toHaveLength(2);
  });

  it('filters by keyContains', () => {
    const results = searchSnapshots(mockStore, { keyContains: 'API' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('def456');
  });

  it('filters by valueContains', () => {
    const results = searchSnapshots(mockStore, { valueContains: 'localhost' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('abc123');
  });

  it('filters by after date', () => {
    const results = searchSnapshots(mockStore, { after: new Date('2024-02-01') });
    expect(results).toHaveLength(2);
  });

  it('returns results sorted by createdAt descending', () => {
    const results = searchSnapshots(mockStore, {});
    expect(results[0].id).toBe('ghi789');
    expect(results[2].id).toBe('abc123');
  });
});

describe('formatSearchResults', () => {
  it('returns no-match message for empty results', () => {
    expect(formatSearchResults([])).toContain('No snapshots found');
  });

  it('includes snapshot count and details', () => {
    const results = searchSnapshots(mockStore, { project: 'my-app' });
    const output = formatSearchResults(results);
    expect(output).toContain('Found 2 snapshot(s)');
    expect(output).toContain('my-app');
  });
});
