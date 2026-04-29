import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("chokidar", () => {
  const handlers: Record<string, Function[]> = {};
  const mockWatcher = {
    on: vi.fn((event: string, cb: Function) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(cb);
      return mockWatcher;
    }),
    close: vi.fn(),
    _emit: (event: string, arg: string) => {
      (handlers[event] || []).forEach((h) => h(arg));
    },
  };
  return { default: { watch: vi.fn(() => mockWatcher) }, __mockWatcher: mockWatcher };
});

vi.mock("fs", () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock("../storage/snapshotFactory", () => ({
  createSnapshot: vi.fn((name: string, env: Record<string, string>) => ({ name, env, createdAt: Date.now() })),
}));

vi.mock("../storage/snapshotStore", () => ({
  saveSnapshot: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../audit/snapshotAudit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

import { watchEnvFiles, formatWatchStatus } from "./snapshotWatch";
import * as chokidarModule from "chokidar";

describe("watchEnvFiles", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns a handle with stop and filePath", () => {
    const handle = watchEnvFiles({ label: "test" });
    expect(handle).toHaveProperty("stop");
    expect(handle).toHaveProperty("filePath");
    handle.stop();
  });

  it("throws if no env files found", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false);
    expect(() => watchEnvFiles()).toThrow("No env files found");
  });

  it("calls onSnapshot after debounce on change", async () => {
    const onSnapshot = vi.fn();
    const handle = watchEnvFiles({ label: "watch-test", debounceMs: 200 }, onSnapshot);
    const { __mockWatcher } = chokidarModule as any;
    __mockWatcher._emit("change", ".env");
    vi.advanceTimersByTime(200);
    await Promise.resolve();
    expect(onSnapshot).toHaveBeenCalledTimes(1);
    handle.stop();
  });
});

describe("formatWatchStatus", () => {
  it("formats list of watched files", () => {
    const result = formatWatchStatus(["/project/.env", "/project/.env.local"]);
    expect(result).toContain("Watching env files:");
    expect(result).toContain("/project/.env");
    expect(result).toContain("/project/.env.local");
  });
});
