import { Snapshot } from '../storage/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  name: string;
  check: (snapshot: Snapshot) => { error?: string; warning?: string } | null;
}

const defaultRules: ValidationRule[] = [
  {
    name: 'non-empty-vars',
    check: (snapshot) => {
      if (!snapshot.vars || Object.keys(snapshot.vars).length === 0) {
        return { warning: 'Snapshot contains no environment variables' };
      }
      return null;
    },
  },
  {
    name: 'no-empty-values',
    check: (snapshot) => {
      const emptyKeys = Object.entries(snapshot.vars)
        .filter(([, v]) => v === '')
        .map(([k]) => k);
      if (emptyKeys.length > 0) {
        return { warning: `Variables with empty values: ${emptyKeys.join(', ')}` };
      }
      return null;
    },
  },
  {
    name: 'no-sensitive-keys',
    check: (snapshot) => {
      const sensitivePatterns = /secret|password|passwd|token|private_key|api_key/i;
      const sensitiveKeys = Object.keys(snapshot.vars).filter((k) =>
        sensitivePatterns.test(k)
      );
      if (sensitiveKeys.length > 0) {
        return { warning: `Potentially sensitive keys detected: ${sensitiveKeys.join(', ')}` };
      }
      return null;
    },
  },
  {
    name: 'valid-key-names',
    check: (snapshot) => {
      const invalidKeys = Object.keys(snapshot.vars).filter(
        (k) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)
      );
      if (invalidKeys.length > 0) {
        return { error: `Invalid environment variable names: ${invalidKeys.join(', ')}` };
      }
      return null;
    },
  },
];

export function validateSnapshot(
  snapshot: Snapshot,
  rules: ValidationRule[] = defaultRules
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const result = rule.check(snapshot);
    if (result) {
      if (result.error) errors.push(`[${rule.name}] ${result.error}`);
      if (result.warning) warnings.push(`[${rule.name}] ${result.warning}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  if (result.valid) {
    lines.push('✔ Snapshot is valid');
  } else {
    lines.push('✘ Snapshot validation failed');
  }
  for (const err of result.errors) {
    lines.push(`  ERROR:   ${err}`);
  }
  for (const warn of result.warnings) {
    lines.push(`  WARNING: ${warn}`);
  }
  return lines.join('\n');
}
