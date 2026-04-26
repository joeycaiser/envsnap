import { Snapshot } from "../storage/types";

export interface LintRule {
  name: string;
  description: string;
  check: (snapshot: Snapshot) => LintViolation[];
}

export interface LintViolation {
  rule: string;
  key?: string;
  message: string;
  severity: "error" | "warn";
}

export interface LintResult {
  snapshotId: string;
  violations: LintViolation[];
  passed: boolean;
}

const rules: LintRule[] = [
  {
    name: "no-empty-value",
    description: "Environment variable values should not be empty",
    check: (snapshot) =>
      Object.entries(snapshot.env)
        .filter(([, v]) => v === "")
        .map(([k]) => ({
          rule: "no-empty-value",
          key: k,
          message: `Variable "${k}" has an empty value`,
          severity: "warn" as const,
        })),
  },
  {
    name: "no-uppercase-key",
    description: "Environment variable keys should be uppercase",
    check: (snapshot) =>
      Object.keys(snapshot.env)
        .filter((k) => k !== k.toUpperCase())
        .map((k) => ({
          rule: "no-uppercase-key",
          key: k,
          message: `Variable "${k}" key is not uppercase`,
          severity: "warn" as const,
        })),
  },
  {
    name: "no-whitespace-value",
    description: "Environment variable values should not have leading/trailing whitespace",
    check: (snapshot) =>
      Object.entries(snapshot.env)
        .filter(([, v]) => v !== v.trim())
        .map(([k]) => ({
          rule: "no-whitespace-value",
          key: k,
          message: `Variable "${k}" value has leading or trailing whitespace`,
          severity: "error" as const,
        })),
  },
  {
    name: "no-duplicate-prefix",
    description: "Avoid variables that differ only by prefix casing",
    check: (snapshot) => {
      const keys = Object.keys(snapshot.env);
      const seen = new Map<string, string>();
      const violations: LintViolation[] = [];
      for (const k of keys) {
        const lower = k.toLowerCase();
        if (seen.has(lower)) {
          violations.push({
            rule: "no-duplicate-prefix",
            key: k,
            message: `Variable "${k}" conflicts with "${seen.get(lower)}" (case-insensitive duplicate)`,
            severity: "error",
          });
        } else {
          seen.set(lower, k);
        }
      }
      return violations;
    },
  },
];

export function lintSnapshot(snapshot: Snapshot, ruleNames?: string[]): LintResult {
  const activeRules = ruleNames
    ? rules.filter((r) => ruleNames.includes(r.name))
    : rules;

  const violations = activeRules.flatMap((r) => r.check(snapshot));
  return {
    snapshotId: snapshot.id,
    violations,
    passed: violations.filter((v) => v.severity === "error").length === 0,
  };
}

export function formatLintResult(result: LintResult): string {
  if (result.violations.length === 0) {
    return `✔  Snapshot "${result.snapshotId}" passed all lint rules.`;
  }
  const lines = [`Lint results for snapshot "${result.snapshotId}":`];
  for (const v of result.violations) {
    const icon = v.severity === "error" ? "✖" : "⚠";
    const key = v.key ? ` [${v.key}]` : "";
    lines.push(`  ${icon} [${v.rule}]${key} ${v.message}`);
  }
  const errors = result.violations.filter((v) => v.severity === "error").length;
  const warns = result.violations.filter((v) => v.severity === "warn").length;
  lines.push(`\n${errors} error(s), ${warns} warning(s).`);
  return lines.join("\n");
}

export function listLintRules(): string {
  return rules
    .map((r) => `  ${r.name.padEnd(28)} ${r.description}`)
    .join("\n");
}
