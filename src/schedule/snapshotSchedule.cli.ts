import { Command } from "commander";
import {
  upsertSchedule,
  removeSchedule,
  listSchedules,
  getNextRun,
  formatScheduleList,
} from "./snapshotSchedule";

/**
 * Registers CLI commands for managing snapshot schedules.
 *
 * Subcommands:
 *   schedule add   <name> <cron>  – create or update a schedule
 *   schedule remove <name>        – delete a schedule
 *   schedule list                 – show all schedules with next-run times
 *   schedule next  <name>         – show the next run time for a specific schedule
 */
export function registerScheduleCommands(program: Command): void {
  const schedule = program
    .command("schedule")
    .description("Manage automated snapshot schedules");

  // ── add / upsert ──────────────────────────────────────────────────────────
  schedule
    .command("add <name> <cron>")
    .description(
      "Create or update a schedule. CRON is a standard 5-field expression, e.g. \"0 * * * *\""
    )
    .option("-p, --project <project>", "Associate schedule with a project", "")
    .option("-d, --description <desc>", "Human-readable description", "")
    .action(
      async (
        name: string,
        cron: string,
        opts: { project: string; description: string }
      ) => {
        try {
          const entry = await upsertSchedule({
            name,
            cron,
            project: opts.project || undefined,
            description: opts.description || undefined,
            enabled: true,
          });
          console.log(
            `✔  Schedule "${entry.name}" saved. Next run: ${getNextRun(entry.cron)?.toISOString() ?? "unknown"}`
          );
        } catch (err: unknown) {
          console.error(
            `✖  Failed to save schedule: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          process.exit(1);
        }
      }
    );

  // ── remove ────────────────────────────────────────────────────────────────
  schedule
    .command("remove <name>")
    .description("Remove a schedule by name")
    .action(async (name: string) => {
      try {
        const removed = await removeSchedule(name);
        if (removed) {
          console.log(`✔  Schedule "${name}" removed.`);
        } else {
          console.warn(`⚠  No schedule named "${name}" was found.`);
        }
      } catch (err: unknown) {
        console.error(
          `✖  Failed to remove schedule: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        process.exit(1);
      }
    });

  // ── list ──────────────────────────────────────────────────────────────────
  schedule
    .command("list")
    .description("List all schedules")
    .option("--json", "Output as JSON", false)
    .action(async (opts: { json: boolean }) => {
      try {
        const schedules = await listSchedules();
        if (schedules.length === 0) {
          console.log("No schedules defined.");
          return;
        }
        if (opts.json) {
          console.log(JSON.stringify(schedules, null, 2));
        } else {
          console.log(formatScheduleList(schedules));
        }
      } catch (err: unknown) {
        console.error(
          `✖  Failed to list schedules: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        process.exit(1);
      }
    });

  // ── next ──────────────────────────────────────────────────────────────────
  schedule
    .command("next <name>")
    .description("Show the next scheduled run time for a specific schedule")
    .action(async (name: string) => {
      try {
        const schedules = await listSchedules();
        const entry = schedules.find((s) => s.name === name);
        if (!entry) {
          console.error(`✖  No schedule named "${name}" found.`);
          process.exit(1);
        }
        const next = getNextRun(entry.cron);
        if (next) {
          console.log(
            `Next run for "${name}": ${next.toLocaleString()} (${next.toISOString()})`
          );
        } else {
          console.warn(`⚠  Could not compute next run for cron: "${entry.cron}"`);
        }
      } catch (err: unknown) {
        console.error(
          `✖  Error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        process.exit(1);
      }
    });
}
