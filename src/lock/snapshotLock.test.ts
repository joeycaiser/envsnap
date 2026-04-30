import { lockSnapshot, unlockSnapshot, isLocked, listLocks, formatLockList } from "./snapshotLock";
import * as snapshotStore from "../storage/snapshotStore";

const makeStore = () => ({} as Record<string, unknown>);

describe("snapshotLock", () => {
  let store: Record<string, unknown>;

  beforeEach(() => {
    store = makeStore();
    jest.spyOn(snapshotStore, "readStore").mockImplementation(() => store);
    jest.spyOn(snapshotStore, "writeStore").mockImplementation((s) => { Object.assign(store, s); });
  });

  afterEach(() => jest.restoreAllMocks());

  it("locks a snapshot", () => {
    const result = lockSnapshot("snap-1", "production freeze");
    expect(result.success).toBe(true);
    expect(result.message).toContain("snap-1");
    expect(isLocked("snap-1")).toBe(true);
  });

  it("returns failure when locking an already locked snapshot", () => {
    lockSnapshot("snap-2");
    const result = lockSnapshot("snap-2");
    expect(result.success).toBe(false);
    expect(result.message).toContain("already locked");
  });

  it("unlocks a snapshot", () => {
    lockSnapshot("snap-3");
    const result = unlockSnapshot("snap-3");
    expect(result.success).toBe(true);
    expect(isLocked("snap-3")).toBe(false);
  });

  it("returns failure when unlocking a non-locked snapshot", () => {
    const result = unlockSnapshot("snap-99");
    expect(result.success).toBe(false);
    expect(result.message).toContain("not locked");
  });

  it("lists all locks", () => {
    lockSnapshot("snap-4", "reason A");
    lockSnapshot("snap-5");
    const locks = listLocks();
    expect(locks).toHaveLength(2);
    expect(locks.map((l) => l.snapshotId)).toEqual(expect.arrayContaining(["snap-4", "snap-5"]));
  });

  it("formats lock list with reason", () => {
    lockSnapshot("snap-6", "do not modify");
    const output = formatLockList(listLocks());
    expect(output).toContain("snap-6");
    expect(output).toContain("do not modify");
  });

  it("formats empty lock list", () => {
    expect(formatLockList([])).toBe("No locked snapshots.");
  });
});
