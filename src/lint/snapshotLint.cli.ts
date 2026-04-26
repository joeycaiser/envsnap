import { Command } from "commander";
import { getSnapshot } from "../storage/snapshotStore";
import { lintSnapshot, formatLintResult, listLintRules } from "./snapshotLint";

export function registerLintCommands(program: Command): void {
  const lint = program
    .command("lint")
    .description("Lint a snapshot for common environment variable issues");

  lint
    .command("run <snapshotId>")
    .description("Run lint rules against a snapshot")
    .option("-r, --rules <rules>", "Comma-separated list of rule names to apply")
    .action(async (snapshotId: string, opts: { rules?: string }) => {
      const snapshot = await getSnapshot(snapshotId);
      if (!snapshot) {
        console.error(`Snapshot "${snapshotId}" not found.`);
        process.exit(1);
      }
      const ruleNames = opts.rules
        ? opts.rules.split(",").map((r) => r.trim())
        : undefined;
      const result = lintSnapshot(snapshot, ruleNames);
      console.log(formatLintResult(result));
      if (!result.passed) {
        process.exit(1);
      }
    });

  lint
    .command("rules")
    .description("List all available lint rules")
    .action(() => {
      console.log("Available lint rules:\n");
      console.log(listLintRules());
    });
}
