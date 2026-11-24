import "server-only";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { normName } from "./library";
import type { OriginalTone, SongSheet, ToneRequest } from "./schema";

// Şarkı kütüphanesi: her şarkının bütün gitar bölümlerinin (riff, ritim, temiz/caz, solo…) orijinal tonu.
// Bir kez araştırılır ve saklanır; sonra Claude Code / API olmadan da anında açılır.
//  - data/library/tones/       uygulamayla gelen hazır araştırmalar
//  - ~/.tonefinder/library/    bu bilgisayarda araştırılanlar (uygulama güncellense de kalır)

export interface StoredSheet extends SongSheet {
  title: string;
  artist: string;
  researchedAt: number;
}

export interface SheetPart {
  part: string;
  label: string;
}

const BUNDLED = join(process.cwd(), "data", "library", "tones");
export const USER_LIBRARY_DIR = join(process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder"), "library");

export const songKey = (artist: string, title: string) => `${normName(artist)}|${normName(title.replace(/\(.*?\)|\[.*?\]/g, ""))}`;
const fileName = (artist: string, title: string) =>
  `${songKey(artist, title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100)}.json`;

/** anahtar → dosya yolu ve bölümler (dosyalar bir kez taranır, kayıtta güncellenir) */
let index: Map<string, { path: string; parts: SheetPart[] }> | null = null;

function scan(dir: string, into: Map<string, { path: string; parts: SheetPart[] }>) {
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return;
  }
  for (const f of files) {
    try {
      const sheet = JSON.parse(readFileSync(join(dir, f), "utf8")) as StoredSheet;
      if (!sheet.title || !Array.isArray(sheet.parts)) continue;
      into.set(songKey(sheet.artist, sheet.title), { path: join(dir, f), parts: sheet.parts.map((p) => ({ part: p.part, label: p.label })) });
    } catch {
      // bozuk dosya: atla
    }
  }
}

function getIndex() {
  if (!index) {
    index = new Map();
    scan(BUNDLED, index);
    scan(USER_LIBRARY_DIR, index); // bu bilgisayarda araştırılan, hazır gelenin yerine geçer
  }
  return index;
}

export function hasSheet(artist: string, title: string): boolean {
  return getIndex().has(songKey(artist, title));
}

export function sheetParts(artist: string, title: string): SheetPart[] {
  return getIndex().get(songKey(artist, title))?.parts ?? [];
}

/** Bir sanatçının hazır şarkıları: normalize başlık → bölümler */
export function readyForArtist(artist: string): Record<string, SheetPart[]> {
  const prefix = `${normName(artist)}|`;
  const out: Record<string, SheetPart[]> = {};
  for (const [k, v] of getIndex()) if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v.parts;
  return out;
}

export function sheetCount(): number {
  return getIndex().size;
}

export function readSheet(artist: string, title: string): StoredSheet | null {
  const hit = getIndex().get(songKey(artist, title));
  if (!hit) return null;
  try {
    return JSON.parse(readFileSync(hit.path, "utf8")) as StoredSheet;
  } catch {
    return null;
  }
}

export function saveSheet(sheet: StoredSheet): void {
  mkdirSync(USER_LIBRARY_DIR, { recursive: true });
  const path = join(USER_LIBRARY_DIR, fileName(sheet.artist, sheet.title));
  writeFileSync(path, JSON.stringify(sheet, null, 1));
  getIndex().set(songKey(sheet.artist, sheet.title), { path, parts: sheet.parts.map((p) => ({ part: p.part, label: p.label })) });
}

/**
 * İstenen bölümün kütüphanedeki hazır tonu. partDetail bir bölüm adıysa (ör. "1. solo") o bölüm,
 * değilse aynı türdeki ilk bölüm; "Genel" istenirse şarkının ilk bölümü.
 */
export function sheetOriginal(req: ToneRequest): { original: OriginalTone; researchedAt: number; label: string } | null {
  if (req.instrument !== "guitar" || req.toneType !== "auto" || !req.artist.trim()) return null;
  const sheet = readSheet(req.artist, req.song);
  if (!sheet?.parts.length) return null;
  const detail = normName(req.partDetail);
  const byLabel = detail ? sheet.parts.find((p) => normName(p.label) === detail) : undefined;
  if (detail && !byLabel) return null;
  const hit = byLabel ?? sheet.parts.find((p) => p.part === req.part) ?? (req.part === "full" ? sheet.parts[0] : undefined);
  return hit ? { original: hit.original, researchedAt: sheet.researchedAt, label: hit.label } : null;
}
