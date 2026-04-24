import { addTag, removeTag, listTags, findByTag, formatTagList } from './snapshotTags';
import * as store from '../storage/snapshotStore';
import { SnapshotStore } from '../storage/types';

const makeStore = (): SnapshotStore => ({
  snapshots: {
    snap1: { id: 'snap1', name: 'first', createdAt: '2024-01-01', env: {}, tags: [] },
    snap2: { id: 'snap2', name: 'second', createdAt: '2024-01-02', env: {}, tags: ['prod'] },
  },
});

describe('addTag', () => {
  it('adds a tag to a snapshot', () => {
    const s = makeStore();
    jest.spyOn(store, 'readStore').mockReturnValue(s);
    const write = jest.spyOn(store, 'writeStore').mockImplementation(() => {});
    addTag('snap1', 'dev');
    expect(s.snapshots['snap1'].tags).toContain('dev');
    expect(write).toHaveBeenCalled();
  });

  it('throws if snapshot not found', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(() => addTag('missing', 'dev')).toThrow("Snapshot 'missing' not found.");
  });

  it('throws if tag already exists', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(() => addTag('snap2', 'prod')).toThrow("Tag 'prod' already exists");
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    const s = makeStore();
    jest.spyOn(store, 'readStore').mockReturnValue(s);
    jest.spyOn(store, 'writeStore').mockImplementation(() => {});
    removeTag('snap2', 'prod');
    expect(s.snapshots['snap2'].tags).not.toContain('prod');
  });

  it('throws if tag not found', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(() => removeTag('snap1', 'staging')).toThrow("Tag 'staging' not found");
  });
});

describe('listTags', () => {
  it('returns tags for a snapshot', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(listTags('snap2')).toEqual(['prod']);
  });

  it('returns empty array when no tags', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(listTags('snap1')).toEqual([]);
  });
});

describe('findByTag', () => {
  it('returns snapshot ids matching tag', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(findByTag('prod')).toEqual(['snap2']);
  });

  it('returns empty array when no match', () => {
    jest.spyOn(store, 'readStore').mockReturnValue(makeStore());
    expect(findByTag('unknown')).toEqual([]);
  });
});

describe('formatTagList', () => {
  it('formats tags correctly', () => {
    const result = formatTagList('snap2', ['prod', 'stable']);
    expect(result).toContain('snap2');
    expect(result).toContain('- prod');
    expect(result).toContain('- stable');
  });

  it('shows message when no tags', () => {
    expect(formatTagList('snap1', [])).toMatch(/No tags/);
  });
});
