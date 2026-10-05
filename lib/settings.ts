import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

// Masaüstü uygulamasının ayarları kullanıcının ev klasöründe tutulur
// (~/.tonefinder/settings.json), böylece uygulama güncellense ya da yeniden
// indirilse de API anahtarı kaybolmaz. Ortam değişkeni varsa o önceliklidir.

const DIR = process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder");
const FILE = join(DIR, "settings.json");

interface Settings {
  anthropicApiKey?: string;
}

async function readSettings(): Promise<Settings> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Settings;
  } catch {
    return {};
  }
}

export async function getApiKey(): Promise<{ key: string; source: "env" | "file" } | null> {
  if (process.env.ANTHROPIC_API_KEY) return { key: process.env.ANTHROPIC_API_KEY, source: "env" };
  const { anthropicApiKey } = await readSettings();
  return anthropicApiKey ? { key: anthropicApiKey, source: "file" } : null;
}

export async function saveApiKey(key: string): Promise<void> {
  await mkdir(DIR, { recursive: true });
  const settings = await readSettings();
  await writeFile(FILE, JSON.stringify({ ...settings, anthropicApiKey: key }, null, 2), { mode: 0o600 });
}

export async function clearApiKey(): Promise<void> {
  const { anthropicApiKey: _removed, ...rest } = await readSettings();
  if (Object.keys(rest).length === 0) await rm(FILE, { force: true });
  else await writeFile(FILE, JSON.stringify(rest, null, 2), { mode: 0o600 });
}
