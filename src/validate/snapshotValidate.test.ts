import { validateSnapshot, formatValidationResult } from './snapshotValidate';
import { Snapshot } from '../storage/types';

const makeSnapshot = (vars: Record<string, string>): Snapshot => ({
  id: 'test-id',
  name: 'test',
  createdAt: new Date().toISOString(),
  vars,
  tags: [],
});

describe('validateSnapshot', () => {
  it('returns valid for a clean snapshot', () => {
    const snap = makeSnapshot({ NODE_ENV: 'development', PORT: '3000' });
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('warns when snapshot has no variables', () => {
    const snap = makeSnapshot({});
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('no environment variables'))).toBe(true);
  });

  it('warns about empty-value variables', () => {
    const snap = makeSnapshot({ NODE_ENV: '', PORT: '3000' });
    const result = validateSnapshot(snap);
    expect(result.warnings.some((w) => w.includes('NODE_ENV'))).toBe(true);
  });

  it('warns about potentially sensitive keys', () => {
    const snap = makeSnapshot({ API_KEY: 'abc123', HOST: 'localhost' });
    const result = validateSnapshot(snap);
    expect(result.warnings.some((w) => w.includes('API_KEY'))).toBe(true);
  });

  it('errors on invalid variable names', () => {
    const snap = makeSnapshot({ '1INVALID': 'val', 'VALID_KEY': 'ok' });
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('1INVALID'))).toBe(true);
  });

  it('does not flag valid underscore-prefixed keys', () => {
    const snap = makeSnapshot({ _PRIVATE: 'val' });
    const result = validateSnapshot(snap);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatValidationResult', () => {
  it('shows valid message when no errors', () => {
    const result = { valid: true, errors: [], warnings: [] };
    expect(formatValidationResult(result)).toContain('✔');
  });

  it('shows failure message with errors listed', () => {
    const result = {
      valid: false,
      errors: ['[valid-key-names] Invalid environment variable names: 1BAD'],
      warnings: [],
    };
    const output = formatValidationResult(result);
    expect(output).toContain('✘');
    expect(output).toContain('ERROR');
    expect(output).toContain('1BAD');
  });

  it('shows warnings in output', () => {
    const result = { valid: true, errors: [], warnings: ['[non-empty-vars] Snapshot contains no environment variables'] };
    const output = formatValidationResult(result);
    expect(output).toContain('WARNING');
  });
});
