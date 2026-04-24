# envsnap

> CLI tool to snapshot, diff, and restore local environment variable sets across projects.

---

## Installation

```bash
npm install -g envsnap
```

Or with npx (no install required):

```bash
npx envsnap <command>
```

---

## Usage

```bash
# Save a snapshot of your current environment
envsnap save my-project-env

# List all saved snapshots
envsnap list

# Diff two snapshots
envsnap diff my-project-env staging-env

# Restore a snapshot to a .env file
envsnap restore my-project-env
```

Snapshots are stored locally in `~/.envsnap/` and can be scoped per project directory.

```bash
# Snapshot only variables from a .env file
envsnap save production --from .env.production

# Export a snapshot as a .env file
envsnap export my-project-env > .env
```

---

## Configuration

envsnap looks for a `envsnap.config.json` in your project root for per-project defaults. This file can define snapshot names, ignore patterns, and output paths.

---

## License

[MIT](./LICENSE)

---

> **Note:** envsnap does not upload or sync your environment variables anywhere. All data stays local.