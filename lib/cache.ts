import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { OriginalTone } from "./schema";

// Orijinal ton araştırması (şarkının stüdyo kaydındaki ekipman) kullanıcının ekipmanından
// bağımsızdır; bir kez yapılıp ~/.tonefinder/cache/ altında saklanır. Aynı şarkı + bölüm +
// ton türü tekrar sorulduğunda yalnız uyarlama adımı çalışır: daha hızlı, daha ucuz ve
// sonuçlar tutarlı olur. "Yeniden araştır" bu kaydı yeniler.

const DIR = join(process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder"), "cache");

export interface OriginalResearch {
  report: string;
  sources: [url: string, title: string][];
  researchedAt: number;
  /** Yapılandırılmış orijinal ton (eski kayıtlarda yok; gerekince yeniden üretilir) */
  structured?: OriginalTone;
}

export function researchKey(parts: string[]): string {
  const normalized = parts.map((p) => p.trim().toLocaleLowerCase("en").replace(/\s+/g, " ")).join("|");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

export async function readResearch(key: string): Promise<OriginalResearch | null> {
  try {
    const data = JSON.parse(await readFile(join(DIR, `${key}.json`), "utf8")) as OriginalResearch;
    return typeof data.report === "string" && Array.isArray(data.sources) ? data : null;
  } catch {
    return null;
  }
}

export async function writeResearch(key: string, research: OriginalResearch): Promise<void> {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(join(DIR, `${key}.json`), JSON.stringify(research));
  } catch (error) {
    // önbellek yazılamazsa araştırma yine kullanılır, yalnız saklanmaz
    console.error("Research cache write failed:", error);
  }
}
