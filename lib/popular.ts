import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { OriginalToneSchema, type OriginalTone, type ToneRequest } from "./schema";

// Uygulamayla birlikte gelen popüler şarkı kataloğu (Songsterr'in en popüler 500 şarkısı).
// data/popular/songs.json listeyi, data/popular/tones/*.json her şarkının önceden araştırılmış
// orijinal tonunu, data/popular/artwork.json kapak resimlerini tutar. Bu şarkılardan biri
// listedeki bölümüyle istenince araştırma yapılmadan bu kayıt kullanılır.
// Katalog scripts/research-popular.mjs ve scripts/fetch-popular-artwork.mjs ile yenilenir.

const DIR = join(process.cwd(), "data", "popular");

export interface PopularSong {
  rank: number;
  title: string;
  artist: string;
  part: string;
  slug: string;
}

export interface PopularEntry extends PopularSong {
  artwork: string;
  ready: boolean;
  album_or_year: string;
  tags: string[];
  difficulty: number;
  confidence: "high" | "medium" | "low" | null;
  guitar: string;
  amp: string;
  tuning: string;
}

interface Catalog {
  entries: PopularEntry[];
  tones: Map<string, { original: OriginalTone; researchedAt: number }>;
}

let cache: Catalog | null = null;

const norm = (t: string) =>
  t
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function load(): Catalog {
  if (cache) return cache;
  const list = readJson<{ songs: PopularSong[] }>(join(DIR, "songs.json"))?.songs ?? [];
  const artwork = readJson<Record<string, string>>(join(DIR, "artwork.json")) ?? {};
  const tones = new Map<string, { original: OriginalTone; researchedAt: number }>();
  const toneDir = join(DIR, "tones");
  if (existsSync(toneDir)) {
    for (const file of readdirSync(toneDir)) {
      if (!file.endsWith(".json")) continue;
      const data = readJson<{ original?: unknown; researchedAt?: number }>(join(toneDir, file));
      const parsed = OriginalToneSchema.safeParse(data?.original);
      if (parsed.success) tones.set(file.replace(/\.json$/, ""), { original: parsed.data, researchedAt: data?.researchedAt ?? 0 });
    }
  }
  const entries = list.map((s): PopularEntry => {
    const t = tones.get(s.slug)?.original;
    return {
      ...s,
      artwork: artwork[s.slug] ?? "",
      ready: Boolean(t),
      album_or_year: t?.song.album_or_year ?? "",
      tags: t?.song.tone_tags.slice(0, 3) ?? [],
      difficulty: t?.difficulty.score ?? 0,
      confidence: t?.research_confidence ?? null,
      guitar: t?.original_rig.guitar.model ?? "",
      amp: t?.original_rig.amps[0]?.model ?? "",
      tuning: t?.original_rig.tuning ?? "",
    };
  });
  cache = { entries, tones };
  return cache;
}

export function popularCatalog(): PopularEntry[] {
  return load().entries;
}

/** İstek katalogdaki bir şarkının listelenen bölümüyse hazır orijinal tonu döner */
export function bundledOriginal(req: ToneRequest): { original: OriginalTone; researchedAt: number } | null {
  if (req.partDetail.trim() || req.instrument !== "guitar" || req.toneType !== "auto") return null;
  const { entries, tones } = load();
  const title = norm(req.song);
  const artist = norm(req.artist);
  const hit = entries.find((e) => norm(e.title) === title && (!artist || norm(e.artist) === artist) && e.part === req.part);
  return hit ? (tones.get(hit.slug) ?? null) : null;
}
