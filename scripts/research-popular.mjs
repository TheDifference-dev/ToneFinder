// Popüler şarkıların (data/popular/songs.json) orijinal tonlarını toplu araştırır.
// Çalışan bir ToneFinder sunucusunun /api/research ucunu kullanır; yani araştırma uygulamanın
// kendi motoruyla (Claude Code ya da API anahtarı) yapılır ve sonuçlar aynı biçimde çıkar.
// Her şarkının sonucu data/popular/tones/<slug>.json dosyasına yazılır; dosyası olan şarkı atlanır.
//
// Kullanım:
//   node scripts/research-popular.mjs [sunucu adresi] [eşzamanlı iş sayısı]
//   ör. node scripts/research-popular.mjs http://127.0.0.1:3210 3
// Yeniden araştırmak için ilgili dosyayı sil ve betiği tekrar çalıştır.

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://127.0.0.1:3210";
const CONCURRENCY = Math.max(1, Number(process.argv[3] || 3));
const OUT = join(ROOT, "data", "popular", "tones");
const LOG = join(ROOT, "data", "popular", "research.log");
const { songs } = JSON.parse(readFileSync(join(ROOT, "data", "popular", "songs.json"), "utf8"));

mkdirSync(OUT, { recursive: true });
const log = (msg) => {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  appendFileSync(LOG, line + "\n");
};

async function researchOne(s) {
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song: s.title, artist: s.artist, part: s.part, partDetail: "", instrument: "guitar", toneType: "auto" }),
    signal: AbortSignal.timeout(15 * 60_000),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    if (e.type === "error") throw new Error(e.error);
    if (e.type === "original") return e.original;
  }
  throw new Error("Sonuç gelmedi");
}

const queue = songs.filter((s) => !existsSync(join(OUT, `${s.slug}.json`)));
log(`${songs.length} şarkı, ${queue.length} tanesi araştırılacak (eşzamanlı ${CONCURRENCY})`);
let done = 0;
let failed = 0;

async function worker() {
  while (queue.length) {
    const s = queue.shift();
    for (let attempt = 1; attempt <= 2; attempt++) {
      const t0 = Date.now();
      try {
        const original = await researchOne(s);
        writeFileSync(
          join(OUT, `${s.slug}.json`),
          JSON.stringify({ rank: s.rank, part: s.part, researchedAt: Date.now(), original }, null, 1),
        );
        done++;
        log(`✓ ${s.rank}. ${s.artist} - ${s.title} (${Math.round((Date.now() - t0) / 1000)} sn) [${done} tamam]`);
        break;
      } catch (err) {
        log(`✗ ${s.rank}. ${s.artist} - ${s.title} (deneme ${attempt}): ${err.message}`);
        if (attempt === 2) failed++;
        else await new Promise((r) => setTimeout(r, 20_000));
      }
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
log(`Bitti: ${done} yeni, ${failed} başarısız.`);
