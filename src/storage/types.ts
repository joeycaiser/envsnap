export interface Snapshot {
  name: string;
  createdAt: string;
  vars: Record<string, string>;
  tags: string[];
}

export interface SnapshotStore {
  snapshots: Record<string, Snapshot>;
  history?: {
    entries: Array<{
      snapshotName: string;
      action: 'save' | 'restore' | 'delete';
      timestamp: string;
      varCount: number;
    }>;
  };
}
