import * as fs from "fs";
import * as path from "path";

export interface LintConfig {
  rules: string[];
  ignore: string[];
}

const DEFAULT_CONFIG: LintConfig = {
  rules: [
    "no-empty-value",
    "no-uppercase-key",
    "no-whitespace-value",
    "no-duplicate-prefix",
  ],
  ignore: [],
};

const CONFIG_FILENAME = ".envsnap-lint.json";

export function loadLintConfig(cwd: string = process.cwd()): LintConfig {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LintConfig>;
    return {
      rules: parsed.rules ?? DEFAULT_CONFIG.rules,
      ignore: parsed.ignore ?? DEFAULT_CONFIG.ignore,
    };
  } catch {
    console.warn(`Warning: Could not parse ${CONFIG_FILENAME}, using defaults.`);
    return { ...DEFAULT_CONFIG };
  }
}

export function saveLintConfig(config: LintConfig, cwd: string = process.cwd()): void {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function applyIgnores(
  env: Record<string, string>,
  ignore: string[]
): Record<string, string> {
  if (ignore.length === 0) return env;
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => !ignore.includes(k))
  );
}
