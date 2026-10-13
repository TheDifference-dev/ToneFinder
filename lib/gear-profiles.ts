import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { GearProfile } from "./schema";

// "Web'de tanıt" ile bulunan ekipman profilleri ~/.tonefinder/gear/ altında saklanır;
// katalogda olmayan bir cihaz bir kez araştırılır, sonraki ton aramalarında yerel kayıt kullanılır.

const DIR = join(process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder"), "gear");

export const gearKey = (name: string) =>
  createHash("sha256").update(name.trim().toLocaleLowerCase("en").replace(/\s+/g, " ")).digest("hex").slice(0, 24);

export async function readGearProfile(name: string): Promise<GearProfile | null> {
  if (!name.trim()) return null;
  try {
    const p = JSON.parse(await readFile(join(DIR, `${gearKey(name)}.json`), "utf8")) as GearProfile;
    return typeof p.model === "string" && Array.isArray(p.controls) ? p : null;
  } catch {
    return null;
  }
}

export async function writeGearProfile(name: string, profile: GearProfile): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(join(DIR, `${gearKey(name)}.json`), JSON.stringify(profile, null, 2));
}
