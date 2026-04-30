import { createGroup, deleteGroup, addSnapshotToGroup, removeSnapshotFromGroup, listGroups, getGroup, formatGroupList } from './snapshotGroup';

jest.mock('../storage/snapshotStore', () => {
  let store: any = {};
  return {
    readStore: () => ({ ...store }),
    writeStore: (s: any) => { store = { ...s }; },
  };
});

beforeEach(() => {
  const mod = require('../storage/snapshotStore');
  mod.writeStore({});
});

describe('createGroup', () => {
  it('creates a new group', () => {
    const g = createGroup('dev', 'Development envs');
    expect(g.name).toBe('dev');
    expect(g.description).toBe('Development envs');
    expect(g.snapshotIds).toEqual([]);
  });

  it('throws if group already exists', () => {
    createGroup('dev');
    expect(() => createGroup('dev')).toThrow('already exists');
  });
});

describe('addSnapshotToGroup / removeSnapshotFromGroup', () => {
  it('adds a snapshot id to the group', () => {
    createGroup('prod');
    const g = addSnapshotToGroup('prod', 'snap-1');
    expect(g.snapshotIds).toContain('snap-1');
  });

  it('does not duplicate snapshot ids', () => {
    createGroup('prod');
    addSnapshotToGroup('prod', 'snap-1');
    const g = addSnapshotToGroup('prod', 'snap-1');
    expect(g.snapshotIds.length).toBe(1);
  });

  it('removes a snapshot id from the group', () => {
    createGroup('prod');
    addSnapshotToGroup('prod', 'snap-1');
    const g = removeSnapshotFromGroup('prod', 'snap-1');
    expect(g.snapshotIds).not.toContain('snap-1');
  });
});

describe('deleteGroup', () => {
  it('deletes an existing group', () => {
    createGroup('temp');
    deleteGroup('temp');
    expect(getGroup('temp')).toBeUndefined();
  });

  it('throws when group not found', () => {
    expect(() => deleteGroup('ghost')).toThrow('not found');
  });
});

describe('listGroups', () => {
  it('returns all groups', () => {
    createGroup('a');
    createGroup('b');
    expect(listGroups().length).toBe(2);
  });
});

describe('formatGroupList', () => {
  it('returns placeholder when empty', () => {
    expect(formatGroupList([])).toBe('No groups defined.');
  });

  it('formats groups with snapshot count', () => {
    createGroup('ci', 'CI envs');
    addSnapshotToGroup('ci', 'snap-1');
    const output = formatGroupList(listGroups());
    expect(output).toContain('ci');
    expect(output).toContain('1 snapshot');
  });
});
