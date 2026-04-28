import { pinSnapshot, unpinSnapshot, listPins, isPinned, formatPinList } from './snapshotPin';
import * as store from '../storage/snapshotStore';
import { SnapshotStore } from '../storage/types';

const makeStore = (overrides: Partial<SnapshotStore> = {}): SnapshotStore => ({
  snapshots: {
    snap1: { id: 'snap1', name: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', variables: {} },
  },
  pins: {},
  ...overrides,
} as unknown as SnapshotStore);

let mockStore: SnapshotStore;

beforeEach(() => {
  mockStore = makeStore();
  jest.spyOn(store, 'readStore').mockImplementation(() => mockStore);
  jest.spyOn(store, 'writeStore').mockImplementation((s) => { Object.assign(mockStore, s); });
});

afterEach(() => jest.restoreAllMocks());

test('pinSnapshot adds entry', () => {
  const entry = pinSnapshot('snap1', 'My Pin');
  expect(entry.snapshotId).toBe('snap1');
  expect(entry.label).toBe('My Pin');
  expect(mockStore.pins!['snap1']).toBeDefined();
});

test('pinSnapshot throws for unknown snapshot', () => {
  expect(() => pinSnapshot('unknown')).toThrow('not found');
});

test('unpinSnapshot removes entry', () => {
  pinSnapshot('snap1');
  const result = unpinSnapshot('snap1');
  expect(result).toBe(true);
  expect(mockStore.pins!['snap1']).toBeUndefined();
});

test('unpinSnapshot returns false when not pinned', () => {
  expect(unpinSnapshot('snap1')).toBe(false);
});

test('isPinned returns correct boolean', () => {
  expect(isPinned('snap1')).toBe(false);
  pinSnapshot('snap1');
  expect(isPinned('snap1')).toBe(true);
});

test('listPins returns all pins', () => {
  pinSnapshot('snap1', 'label');
  const pins = listPins();
  expect(pins).toHaveLength(1);
  expect(pins[0].snapshotId).toBe('snap1');
});

test('formatPinList returns message for empty list', () => {
  expect(formatPinList([])).toBe('No pinned snapshots.');
});

test('formatPinList formats entries', () => {
  const entry = pinSnapshot('snap1', 'My Pin');
  expect(formatPinList([entry])).toContain('snap1');
  expect(formatPinList([entry])).toContain('My Pin');
});
