import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GroupConfig {
  defaultGroup?: string;
  autoAddOnSave?: boolean;
  colorize?: boolean;
}

const CONFIG_DIR = path.join(os.homedir(), '.envsnap');
const CONFIG_FILE = path.join(CONFIG_DIR, 'group.config.json');

const DEFAULTS: GroupConfig = {
  defaultGroup: undefined,
  autoAddOnSave: false,
  colorize: true,
};

export function loadGroupConfig(): GroupConfig {
  if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULTS };
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveGroupConfig(config: Partial<GroupConfig>): GroupConfig {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const current = loadGroupConfig();
  const updated = { ...current, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function resetGroupConfig(): GroupConfig {
  if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
  return { ...DEFAULTS };
}
