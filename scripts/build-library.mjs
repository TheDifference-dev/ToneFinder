// Grup kütüphanesi: ünlü 100 grup/sanatçı ve her birinin en popüler 20 şarkısı (Deezer, anahtarsız).
// Sonuç data/library/artists.json'a yazılır; uygulama aramada önce bu kütüphaneye bakar.
//
// Kullanım: node scripts/build-library.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "library", "artists.json");
const SONGS = 20;

// Songsterr popüler listesinde en çok şarkısı olanlar + rock/metal klasikleri
const WORLD = [
  "Metallica", "Nirvana", "Led Zeppelin", "Red Hot Chili Peppers", "The Beatles", "Green Day", "Iron Maiden", "Megadeth",
  "Pantera", "Radiohead", "Black Sabbath", "Avenged Sevenfold", "Guns N' Roses", "System of a Down", "Slipknot", "AC/DC",
  "Pink Floyd", "Arctic Monkeys", "Muse", "Queen", "Tool", "Linkin Park", "Ozzy Osbourne", "Deftones", "Alice in Chains",
  "The Offspring", "Van Halen", "My Chemical Romance", "Rage Against the Machine", "Foo Fighters", "Three Days Grace",
  "Slayer", "Scorpions", "Rammstein", "Bon Jovi", "Jimi Hendrix", "Weezer", "blink-182", "Bullet for My Valentine",
  "Pearl Jam", "Limp Bizkit", "Lynyrd Skynyrd", "The Police", "Eric Clapton", "Judas Priest", "The Rolling Stones",
  "Måneskin", "The Smashing Pumpkins", "Creedence Clearwater Revival", "Paramore", "Santana", "Gojira", "Rush", "The Doors",
  "Eagles", "Dire Straits", "Deep Purple", "Aerosmith", "Oasis", "Fleetwood Mac", "The Cure", "Gary Moore", "KISS", "Korn",
  "Ghost", "Toto", "ZZ Top", "Stevie Ray Vaughan", "Soundgarden", "Audioslave", "Dream Theater", "Motörhead", "Def Leppard",
  "Mötley Crüe", "Whitesnake", "Dio", "The Who", "Queens of the Stone Age", "The Strokes", "The White Stripes",
];

// Türkçe rock
const TURKISH = [
  "Duman", "maNga", "Mor ve Ötesi", "Pentagram", "Athena", "Şebnem Ferah", "Teoman", "Cem Karaca", "Barış Manço",
  "Erkin Koray", "Kurban", "Gripin", "Badem", "Model", "Pinhani", "Kargo", "Haluk Levent", "Yüksek Sadakat",
  "Hayko Cepkin", "Bulutsuzluk Özlemi",
];

const norm = (t) =>
  t
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cleanTitle = (t) =>
  t
    .replace(/\s*[([](?:[^)\]]*\b(?:remaster(?:ed)?|mono|stereo|deluxe|bonus track|single version|album version|radio edit)\b[^)\]]*)[)\]]/gi, "")
    .replace(/\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|mono|stereo|single version|album version|radio edit)\b.*$/i, "")
    .trim();

const SKIP = /\b(live|demo|remix|instrumental|karaoke|acoustic version|rehearsal)\b|canlı/i;

async function get(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      if (!data.error) return data;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Deezer: ${url}`);
}

// Aramada doğru sanatçı çıkmayan adlar: bilinen bir şarkısıyla bulunur
const HINTS = { Ghost: "Square Hammer", Korn: "Freak On a Leash", Pentagram: "Anatolia", KISS: "Detroit Rock City", Model: "Pembe Mezarlık" };

async function findArtist(name) {
  if (HINTS[name]) {
    const { data = [] } = await get(`https://api.deezer.com/search?q=${encodeURIComponent(`${name} ${HINTS[name]}`)}&limit=10`);
    const hit = data.find((t) => norm(t.title).includes(norm(HINTS[name])));
    if (hit) return (await get(`https://api.deezer.com/artist/${hit.artist.id}`));
  }
  const { data = [] } = await get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=10`);
  const exact = data.filter((a) => norm(a.name) === norm(name)).sort((a, b) => b.nb_fan - a.nb_fan);
  return exact[0] ?? data[0];
}

async function topSongs(id, name) {
  const { data: top = [] } = await get(`https://api.deezer.com/artist/${id}/top?limit=80`);
  // Deezer'in "top" listesi kısa kalırsa genel aramadan (popülerliğe göre) tamamla
  const { data: more = [] } = top.length >= 40 ? { data: [] } : await get(`https://api.deezer.com/search?q=${encodeURIComponent(name)}&limit=100`);
  const data = [...top, ...more.filter((t) => t.artist?.id === id).sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))];
  const seen = new Set();
  const out = [];
  for (const t of data) {
    if (!t.title || SKIP.test(t.title)) continue;
    const title = cleanTitle(t.title) || t.title;
    const base = norm(title.replace(/\(.*?\)|\[.*?\]/g, ""));
    if (!base || seen.has(base)) continue;
    seen.add(base);
    out.push({ title, album: t.album?.title ?? "", artwork: t.album?.cover_medium ?? "" });
    if (out.length >= SONGS) break;
  }
  return out;
}

const artists = [];
for (const [region, list] of [["world", WORLD], ["tr", TURKISH]]) {
  for (const name of list) {
    try {
      const a = await findArtist(name);
      if (!a) throw new Error("bulunamadı");
      const songs = await topSongs(a.id, a.name);
      artists.push({ name: a.name, deezerId: a.id, picture: a.picture_xl || a.picture_big || "", fans: a.nb_fan ?? 0, region, songs });
      console.log(`✓ ${a.name} (${a.nb_fan} hayran) ${songs.length} şarkı`);
    } catch (err) {
      console.log(`✗ ${name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ source: `Deezer (${new Date().toISOString().slice(0, 10)})`, artists }, null, 1));
console.log(`${artists.length} sanatçı yazıldı.`);
