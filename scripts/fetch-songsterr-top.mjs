// Songsterr'in popüler şarkı listesini (sitenin ana sayfasındaki sıralama) çeker ve
// data/popular/songs.json'u günceller. Var olan şarkıların slug'ı korunur (araştırma dosyaları
// bozulmasın); yeni şarkılar sona sıralarıyla eklenir. Gitarsız şarkılar (yalnız piyano vb.) atlanır.
// Her şarkının araştırılacak bölümü Songsterr'deki en popüler gitar kanalının adından tahmin edilir.
//
// Kullanım: node scripts/fetch-songsterr-top.mjs [adet]   (varsayılan 500)

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "data", "popular", "songs.json");
const TARGET = Number(process.argv[2] || 500);
const PAGE = 50;

const norm = (t) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const slugify = (t) =>
  t
    .normalize("NFKD")
    .replace(/[^\x00-\x7f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// Gitar kanalları: General MIDI 24–31 (akustik/elektro gitarlar)
const isGuitar = (t) => t.instrumentId >= 24 && t.instrumentId <= 31;

function guessPart(rec) {
  if (/\bsolo\b/i.test(rec.title)) return "lead";
  const guitars = rec.tracks.filter(isGuitar);
  if (!guitars.length) return null;
  const top = rec.tracks[rec.popularTrackGuitar] && isGuitar(rec.tracks[rec.popularTrackGuitar]) ? rec.tracks[rec.popularTrackGuitar] : guitars.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  const name = `${top.name ?? ""} ${top.instrument ?? ""}`;
  if (/acoustic|clean|nylon/i.test(name)) return "clean";
  if (/\blead\b|\bsolo\b/i.test(name)) return "lead";
  if (/rhythm/i.test(name)) return "rhythm";
  return "full";
}

const current = JSON.parse(readFileSync(FILE, "utf8"));
const byKey = new Map(current.songs.map((s) => [`${norm(s.title)}|${norm(s.artist)}`, s]));
const out = [];
const seen = new Set();
let skipped = 0;

for (let from = 0; out.length < TARGET && from < TARGET * 2; from += PAGE) {
  const url = `https://www.songsterr.com/api/search?pattern=%27%27&size=${PAGE}&from=${from}&more=true&hideDuplicates=true&work=true`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Songsterr ${res.status}`);
  const { records = [] } = await res.json();
  if (!records.length) break;
  for (const rec of records) {
    if (out.length >= TARGET) break;
    const key = `${norm(rec.title)}|${norm(rec.artist)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const existing = byKey.get(key);
    const rank = out.length + 1;
    if (existing) {
      out.push({ ...existing, rank });
      continue;
    }
    const part = guessPart(rec);
    if (!part) {
      skipped++;
      continue;
    }
    out.push({ rank, title: rec.title, artist: rec.artist, part, slug: `${String(rank).padStart(3, "0")}-${slugify(rec.artist)}-${slugify(rec.title)}` });
  }
  await new Promise((r) => setTimeout(r, 400));
}

// Eski listede olup yeni sıralamaya girmeyenler (araştırmaları boşa gitmesin) sona eklenir
for (const s of current.songs) {
  const key = `${norm(s.title)}|${norm(s.artist)}`;
  if (!seen.has(key)) out.push({ ...s, rank: out.length + 1 });
}

writeFileSync(
  FILE,
  JSON.stringify({ source: `Songsterr popüler listesi (${new Date().toISOString().slice(0, 10)})`, songs: out }, null, 1),
);
console.log(`${out.length} şarkı yazıldı (${skipped} gitarsız şarkı atlandı).`);
