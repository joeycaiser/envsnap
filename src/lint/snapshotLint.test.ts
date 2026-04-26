import { lintSnapshot, formatLintResult, listLintRules } from "./snapshotLint";
import { Snapshot } from "../storage/types";

function makeSnapshot(env: Record<string, string>): Snapshot {
  return {
    id: "snap-lint-test",
    name: "lint-test",
    createdAt: new Date().toISOString(),
    env,
    tags: [],
  };
}

describe("lintSnapshot", () => {
  it("passes a clean snapshot", () => {
    const snap = makeSnapshot({ NODE_ENV: "production", PORT: "3000" });
    const result = lintSnapshot(snap);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("detects empty values", () => {
    const snap = makeSnapshot({ NODE_ENV: "" });
    const result = lintSnapshot(snap);
    const v = result.violations.find((v) => v.rule === "no-empty-value");
    expect(v).toBeDefined();
    expect(v?.severity).toBe("warn");
  });

  it("detects non-uppercase keys", () => {
    const snap = makeSnapshot({ nodeEnv: "dev" });
    const result = lintSnapshot(snap);
    const v = result.violations.find((v) => v.rule === "no-uppercase-key");
    expect(v).toBeDefined();
    expect(v?.key).toBe("nodeEnv");
  });

  it("detects whitespace in values", () => {
    const snap = makeSnapshot({ API_KEY: " secret " });
    const result = lintSnapshot(snap);
    const v = result.violations.find((v) => v.rule === "no-whitespace-value");
    expect(v).toBeDefined();
    expect(v?.severity).toBe("error");
    expect(result.passed).toBe(false);
  });

  it("detects case-insensitive duplicate keys", () => {
    const snap = makeSnapshot({ PORT: "3000", port: "8080" });
    const result = lintSnapshot(snap);
    const v = result.violations.find((v) => v.rule === "no-duplicate-prefix");
    expect(v).toBeDefined();
    expect(v?.severity).toBe("error");
  });

  it("filters rules by name", () => {
    const snap = makeSnapshot({ nodeEnv: " dev " });
    const result = lintSnapshot(snap, ["no-whitespace-value"]);
    expect(result.violations.every((v) => v.rule === "no-whitespace-value")).toBe(true);
  });
});

describe("formatLintResult", () => {
  it("returns pass message for clean snapshot", () => {
    const snap = makeSnapshot({ NODE_ENV: "test" });
    const result = lintSnapshot(snap);
    expect(formatLintResult(result)).toContain("passed all lint rules");
  });

  it("includes violation details", () => {
    const snap = makeSnapshot({ bad: " val " });
    const result = lintSnapshot(snap);
    const formatted = formatLintResult(result);
    expect(formatted).toContain("error");
  });
});

describe("listLintRules", () => {
  it("returns a non-empty string listing rules", () => {
    const output = listLintRules();
    expect(output).toContain("no-empty-value");
    expect(output).toContain("no-uppercase-key");
  });
});
