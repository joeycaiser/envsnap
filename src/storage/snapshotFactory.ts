import { Snapshot } from './types';

export interface CreateSnapshotOptions {
  name: string;
  description?: string;
  project?: string;
  vars?: Record<string, string>;
  fromEnv?: boolean;
}

/**
 * Creates a Snapshot object from options.
 * If `fromEnv` is true, captures current process.env variables
 * (excluding internal Node/system variables by convention).
 */
export function createSnapshot(options: CreateSnapshotOptions): Snapshot {
  const { name, description, project, vars, fromEnv } = options;

  let resolvedVars: Record<string, string> = {};

  if (fromEnv) {
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        resolvedVars[key] = value;
      }
    }
  }

  if (vars) {
    resolvedVars = { ...resolvedVars, ...vars };
  }

  return {
    name,
    description,
    project,
    createdAt: new Date().toISOString(),
    vars: resolvedVars,
  };
}
