import { createSnapshot } from './snapshotFactory';

describe('createSnapshot', () => {
  test('creates snapshot with provided vars', () => {
    const snap = createSnapshot({
      name: 'my-snap',
      vars: { API_KEY: 'abc123', DEBUG: 'true' },
    });

    expect(snap.name).toBe('my-snap');
    expect(snap.vars.API_KEY).toBe('abc123');
    expect(snap.vars.DEBUG).toBe('true');
    expect(snap.createdAt).toBeTruthy();
  });

  test('captures process.env when fromEnv is true', () => {
    process.env.TEST_ENVSNAP_VAR = 'hello';
    const snap = createSnapshot({ name: 'env-snap', fromEnv: true });
    expect(snap.vars.TEST_ENVSNAP_VAR).toBe('hello');
    delete process.env.TEST_ENVSNAP_VAR;
  });

  test('merges fromEnv and explicit vars, explicit takes precedence', () => {
    process.env.SHARED_KEY = 'from-env';
    const snap = createSnapshot({
      name: 'merged',
      fromEnv: true,
      vars: { SHARED_KEY: 'overridden' },
    });
    expect(snap.vars.SHARED_KEY).toBe('overridden');
    delete process.env.SHARED_KEY;
  });

  test('includes optional description and project fields', () => {
    const snap = createSnapshot({
      name: 'full-snap',
      description: 'A full snapshot',
      project: 'my-app',
      vars: {},
    });
    expect(snap.description).toBe('A full snapshot');
    expect(snap.project).toBe('my-app');
  });

  test('createdAt is a valid ISO date string', () => {
    const snap = createSnapshot({ name: 'date-test', vars: {} });
    expect(() => new Date(snap.createdAt).toISOString()).not.toThrow();
  });
});
