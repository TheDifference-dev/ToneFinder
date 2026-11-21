// Popüler şarkı kataloğunun kapak resimlerini Deezer'dan bulur ve data/popular/artwork.json'a yazar.
// Anahtar gerekmez. Kullanım: node scripts/fetch-popular-artwork.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { songs } = JSON.parse(readFileSync(join(ROOT, "data", "popular", "songs.json"), "utf8"));
const outPath = join(ROOT, "data", "popular", "artwork.json");
let out = {};
try {
  out = JSON.parse(readFileSync(outPath, "utf8"));
} catch {
  // ilk çalıştırma
}

const clean = (t) => t.replace(/\s*\(.*?\)\s*/g, " ").replace(/ Solo$/i, "").trim();

async function find(s) {
  for (const q of [`artist:"${s.artist}" track:"${clean(s.title)}"`, `${s.artist} ${clean(s.title)}`]) {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=5`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) continue;
    const data = await res.json();
    const hit = (data.data ?? []).find((t) => t.album?.cover_big);
    if (hit) return hit.album.cover_big;
  }
  return "";
}

let found = 0;
for (const s of songs) {
  if (out[s.slug]) {
    found++;
    continue;
  }
  try {
    const url = await find(s);
    if (url) {
      out[s.slug] = url;
      found++;
    }
    console.log(`${url ? "✓" : "✗"} ${s.rank}. ${s.artist} - ${s.title}`);
  } catch (err) {
    console.log(`✗ ${s.rank}. ${s.artist} - ${s.title}: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 150));
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(`${found}/${songs.length} kapak bulundu.`);
