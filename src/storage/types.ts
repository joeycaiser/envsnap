export interface Snapshot {
  name: string;
  description?: string;
  createdAt: string;
  project?: string;
  vars: Record<string, string>;
}

export interface SnapshotDiff {
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Record<string, { from: string; to: string }>;
  unchanged: Record<string, string>;
}
