export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  env: Record<string, string>;
  description?: string;
  tags?: string[];
}

export interface SnapshotStore {
  snapshots: Record<string, Snapshot>;
}
