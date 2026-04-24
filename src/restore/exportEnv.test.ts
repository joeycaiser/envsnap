import { exportSnapshot, ExportFormat } from './exportEnv';
import { Snapshot } from '../storage/types';

const makeSnapshot = (env: Record<string, string>): Snapshot => ({
  id: 'export-test',
  name: 'export-snap',
  createdAt: '2024-01-01T00:00:00.000Z',
  env,
});

describe('exportSnapshot', () => {
  const snap = makeSnapshot({ NODE_ENV: 'production', PORT: '3000', DB_URL: 'postgres://localhost/db' });

  it('exports dotenv format', () => {
    const output = exportSnapshot(snap, 'dotenv');
    expect(output).toContain('NODE_ENV=production');
    expect(output).toContain('PORT=3000');
    expect(output).toContain('DB_URL=postgres://localhost/db');
  });

  it('exports shell format with export prefix', () => {
    const output = exportSnapshot(snap, 'shell');
    expect(output).toContain('export NODE_ENV=');
    expect(output).toContain('export PORT=');
  });

  it('exports json format', () => {
    const output = exportSnapshot(snap, 'json');
    const parsed = JSON.parse(output);
    expect(parsed.NODE_ENV).toBe('production');
    expect(parsed.PORT).toBe('3000');
  });

  it('defaults to dotenv format', () => {
    const output = exportSnapshot(snap);
    expect(output).toContain('NODE_ENV=production');
  });

  it('wraps values with spaces in dotenv quotes', () => {
    const s = makeSnapshot({ GREETING: 'hello world' });
    const output = exportSnapshot(s, 'dotenv');
    expect(output).toContain('GREETING="hello world"');
  });

  it('throws on unsupported format', () => {
    expect(() => exportSnapshot(snap, 'xml' as ExportFormat)).toThrow('Unsupported export format');
  });
});
