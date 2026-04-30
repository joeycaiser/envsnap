import { readStore, writeStore } from '../storage/snapshotStore';

export interface SnapshotGroup {
  name: string;
  description?: string;
  snapshotIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupStore {
  groups: Record<string, SnapshotGroup>;
}

function readGroups(): GroupStore {
  const store = readStore() as any;
  return { groups: store.groups ?? {} };
}

function writeGroups(groupStore: GroupStore): void {
  const store = readStore() as any;
  store.groups = groupStore.groups;
  writeStore(store);
}

export function createGroup(name: string, description?: string): SnapshotGroup {
  const { groups } = readGroups();
  if (groups[name]) {
    throw new Error(`Group "${name}" already exists.`);
  }
  const now = new Date().toISOString();
  const group: SnapshotGroup = { name, description, snapshotIds: [], createdAt: now, updatedAt: now };
  groups[name] = group;
  writeGroups({ groups });
  return group;
}

export function deleteGroup(name: string): void {
  const { groups } = readGroups();
  if (!groups[name]) throw new Error(`Group "${name}" not found.`);
  delete groups[name];
  writeGroups({ groups });
}

export function addSnapshotToGroup(groupName: string, snapshotId: string): SnapshotGroup {
  const { groups } = readGroups();
  if (!groups[groupName]) throw new Error(`Group "${groupName}" not found.`);
  const group = groups[groupName];
  if (!group.snapshotIds.includes(snapshotId)) {
    group.snapshotIds.push(snapshotId);
    group.updatedAt = new Date().toISOString();
  }
  writeGroups({ groups });
  return group;
}

export function removeSnapshotFromGroup(groupName: string, snapshotId: string): SnapshotGroup {
  const { groups } = readGroups();
  if (!groups[groupName]) throw new Error(`Group "${groupName}" not found.`);
  const group = groups[groupName];
  group.snapshotIds = group.snapshotIds.filter(id => id !== snapshotId);
  group.updatedAt = new Date().toISOString();
  writeGroups({ groups });
  return group;
}

export function listGroups(): SnapshotGroup[] {
  const { groups } = readGroups();
  return Object.values(groups);
}

export function getGroup(name: string): SnapshotGroup | undefined {
  const { groups } = readGroups();
  return groups[name];
}

export function formatGroupList(groups: SnapshotGroup[]): string {
  if (groups.length === 0) return 'No groups defined.';
  return groups
    .map(g => {
      const desc = g.description ? ` — ${g.description}` : '';
      return `• ${g.name}${desc} (${g.snapshotIds.length} snapshot${g.snapshotIds.length !== 1 ? 's' : ''})`;
    })
    .join('\n');
}
