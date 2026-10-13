// Claude chat'te (claude.ai) devam etmek için "chat kiti" üretir: uygulamanın araştırma
// talimatı, amfi/gitar katalogları ve cihaz model listeleri, chat'e yüklenebilir Markdown
// dosyaları olarak docs/claude-chat/ klasörüne yazılır. Elle yazılan özet (00-BASLA-BURADAN.md)
// bu script tarafından değiştirilmez.
// Kullanım: npm run build:chatkit

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "claude-chat");
mkdirSync(out, { recursive: true });

const gear = await import(join(root, "lib/gear.ts"));
const amps = await import(join(root, "lib/amps.ts"));
const guitars = await import(join(root, "lib/guitars.ts"));
const { PREFERRED_SOURCES } = await import(join(root, "lib/sources.ts"));
const pedals = await import(join(root, "lib/pedals.ts"));
const pickupModels = await import(join(root, "lib/pickups.ts"));
const { HEADRUSH_REFERENCE } = await import(join(root, "lib/devices/headrush.ts"));
const { HELIX_REFERENCE } = await import(join(root, "lib/devices/helix.ts"));
const { KATANA_REFERENCE } = await import(join(root, "lib/devices/katana.ts"));
const { AMPLITUBE_REFERENCE } = await import(join(root, "lib/devices/amplitube.ts"));

const write = (name, text) => {
  writeFileSync(join(out, name), text.trimEnd() + "\n");
  console.log(`docs/claude-chat/${name} (${(text.length / 1024).toFixed(0)} KB)`);
};

// ---------- 01: araştırma talimatı (uygulamanın kullandığı metin) ----------
const research = readFileSync(join(root, "lib/research.ts"), "utf8");
const promptText = (name) => {
  const m = research.match(new RegExp(`const ${name} = \`([\\s\\S]*?)\`;`));
  if (!m) throw new Error(`${name} not found in lib/research.ts`);
  return m[1];
};
const SOURCES_EXPR = '${PREFERRED_SOURCES.map((s) => `- ${s.name} (${s.url}): ${s.use}`).join("\\n")}';
const originalPrompt = promptText("ORIGINAL_PROMPT");
if (!originalPrompt.includes(SOURCES_EXPR)) throw new Error("PREFERRED_SOURCES expression not found in ORIGINAL_PROMPT");
const researchPrompt = [
  "STEP 1 - ORIGINAL TONE (cached per song/part/tone type)",
  originalPrompt.replace(SOURCES_EXPR, PREFERRED_SOURCES.map((s) => `- ${s.name} (${s.url}): ${s.use}`).join("\n")),
  "",
  "STEP 2 - ADAPT TO THE USER'S GEAR",
  promptText("ADAPT_PROMPT"),
].join("\n");

write(
  "01-TON-ARASTIRMA-TALIMATI.md",
  `# ToneFinder ton araştırma talimatı (Claude chat için)

Bu dosya, ToneFinder uygulamasının yapay zekâya verdiği araştırma talimatının aynısıdır.
Claude chat'te aynı kalitede sonuç almak için: **web araması açık** bir sohbette (ya da bu
dosyanın bilgi olarak eklendiği bir Claude Projesi'nde) aşağıdaki "İstek şablonu"nu doldurup gönder.

## İstek şablonu (kopyala, doldur, gönder)

\`\`\`
ToneFinder talimatına (01-TON-ARASTIRMA-TALIMATI.md) göre bu tonu araştır ve sonucu
"Sonuç biçimi" bölümündeki başlıklarla Türkçe ver.

Şarkı: <şarkı adı>
Sanatçı: <sanatçı>
Bölüm: <Solo / Ritim / Giriş-Riff / Temiz bölüm / Genel ton> — <detay, ör. "2. solo">
Ton türü: <Otomatik / Temiz / Distorsiyonlu>
Enstrüman: <Gitar / Bas>

Ekipmanım:
- Amfi: <ör. Boss Dual Cube LX>
- Amfiyi nasıl kullanıyorum: <amfi olarak / monitör (Stereo In, ton prosesörden) / prosesör amfinin önünde / 4 kablo>
- Amfinin kendi efektleri: <ör. Reverb, Delay ya da yok>
- Prosesör: <ör. HeadRush Core ya da yok>
- Gitar: <ör. Fender Stratocaster>, manyetikler: <SSS / HSS / HH / ...>
- Pedallar: <her biri ayrı satırda ya da yok>

Amfim, prosesörüm, gitarım ve pedallarım 02/03/04/05 numaralı katalog dosyalarında varsa
oradaki model adlarını ve kanal/mod/düğme adlarını aynen kullan.
\`\`\`

## Amfi kullanım şekilleri (uygulamanın talimatı)

${gear.AMP_MODES.map((m) => `- **${m.label}** — ${m.prompt}`).join("\n")}

## Araştırma talimatı (uygulamanın kullandığı metin, İngilizce)

\`\`\`text
${researchPrompt.trim()}
\`\`\`

Uygulama iki adımda çalışır: önce şarkının orijinal tonu araştırılır (aynı şarkı + bölüm + ton
türü için bir kez; sonra kayıttan kullanılır), sonra bu araştırma kullanıcının ekipmanına uyarlanır.
Kullanıcı "kulağa yanlış geliyor" derse orijinal araştırma korunur, yalnız uyarlama yenilenir.

## Sonuç biçimi (uygulamadaki sonuç ekranının aynısı)

1. **Hedef ton** — şarkı, sanatçı, albüm/yıl, tonun 1–2 cümlelik tarifi, 3–8 ton özelliği etiketi,
   tempo (BPM), tonalite, akort, zorluk (1–5) ve ekipmanla ne kadar yaklaşılabileceğinin dürüst
   tahmini (%; ölçüm değil) ve nedeni. Songsterr tab ve backing track arama bağlantısı.
2. **Senin ekipmanınla sinyal zinciri** — gitardan hoparlöre sırayla her blok: kaynak (amfin /
   prosesör / pedalın), cihazdaki tam model ya da kanal adı, neyi taklit ettiği, tüm ayarlar
   (0–10 düğmeler sayı olarak; süreler ms, mesafeler birimiyle) ve not. **Her ayarın yanında
   dayanağı:** kaynaklı (cihaz listesi/kılavuz) / çıkarım / kontrol et.
3. **Gitar** — hangi manyetik konumu, volume, tone, akort; **gitar farkı telafisi** (her ayar ve nedeni).
4. **Orijinal ekipman** — gitar ve manyetik, amfi ve kanal/ayarlar, kabin ve hoparlör, mikrofon
   (model, konum, mesafe), pedallar ve ayarlar, akort, kayıt notları. Her bilgi için
   **kaynaklı / muhtemel / tahmin** etiketi.
5. **Uyarlama** — yapılan ödünler, sınırlamalar (ekipmanla yakalanamayanlar), alternatifler.
   **Çalım** — gereken teknikler ve çalım ipuçları.
6. **Kaynaklar** — dayanılan sayfaların linkleri.
7. **Güven düzeyi** — yüksek / orta / düşük.
`,
);

// ---------- 02: amfi kataloğu ----------
const ampSections = amps.AMPS.map((a) => {
  const lines = [`### ${a.brand} ${a.model}`, "", `Tür: ${a.type}${a.verified ? " · üretici kılavuzundan kontrol edildi" : ""}`, ""];
  for (const c of a.channels) {
    lines.push(`- **${c.name}**${c.modes ? ` — modlar: ${c.modes.join(" / ")}` : ""}; kontroller: ${c.controls.join(", ")}`);
  }
  if (a.global?.length) lines.push(`- **Genel:** ${a.global.join("; ")}`);
  if (a.features?.length) lines.push(`- **Özellikler:** ${a.features.join("; ")}`);
  lines.push(`- **Karakter:** ${a.voicing}`);
  if (a.monitor) lines.push(`- **Prosesörle monitör olarak:** ${a.monitor}`);
  return lines.join("\n");
});
const brands = [...new Set(amps.AMPS.map((a) => a.brand))];
write(
  "02-AMFI-KATALOGU.md",
  `# ToneFinder amfi kataloğu

Kaynak: \`lib/amps.ts\` (${amps.AMPS.length} model, markalar: ${brands.join(", ")}).
Güncel seriler ve tonda önemli klasik modeller; her model için kanallar, modlar, kontroller,
ses karakteri ve prosesörle monitör kullanım notu.

${ampSections.join("\n\n")}
`,
);

// ---------- 03: gitar kataloğu ----------
write(
  "03-GITAR-KATALOGU.md",
  `# ToneFinder gitar kataloğu

Kaynak: \`lib/guitars.ts\`.

## Manyetik türleri

${Object.entries(guitars.PICKUP_TYPES).map(([k, v]) => `- **${k}:** ${v}`).join("\n")}

## Seçici (switch) konumları

${Object.entries(guitars.SELECTOR_POSITIONS).map(([k, v]) => `- **${k}:** ${v}`).join("\n")}

## Markaların karakteri

${guitars.GUITAR_BRANDS.map((b) => `- **${b.brand}:** ${b.character}`).join("\n")}

## Modeller

| Marka | Model | Dizilim | Manyetikler | Ton |
|---|---|---|---|---|
${guitars.GUITARS.map((g) => `| ${g.brand} | ${g.model} | ${g.pickups} | ${g.pickupDetail} | ${g.tone} |`).join("\n")}

## Manyetik modelleri (stok olmayan manyetikler için)

| Marka | Model | Tür | Çıkış | Karakter |
|---|---|---|---|---|
${pickupModels.PICKUP_MODELS.map((p) => `| ${p.brand} | ${p.model} | ${p.kind} | ${pickupModels.PICKUP_OUTPUT_LABELS[p.output]} | ${p.character} |`).join("\n")}
`,
);

// ---------- 05: pedal kataloğu ----------
write(
  "05-PEDAL-KATALOGU.md",
  `# ToneFinder pedal kataloğu

Kaynak: \`lib/pedals.ts\` (${pedals.PEDALS.length} pedal). Düğme adları üreticilerin panel yazılarından;
her biri ayrıca kılavuzla tek tek kontrol edilmedi. Pedal ayarı verirken yalnız bu düğmeleri kullan.

| Marka | Model | Tür | Düğmeler | Anahtar / mod | Karakter |
|---|---|---|---|---|---|
${pedals.PEDALS.map((p) => `| ${p.brand} | ${p.model} | ${pedals.PEDAL_TYPES[p.type]} | ${p.controls.join(", ")} | ${(p.switches ?? []).join("; ")} | ${p.character} |`).join("\n")}
`,
);

// ---------- 04: cihaz model listeleri ----------
write(
  "04-CIHAZ-MODEL-LISTELERI.md",
  `# Doğrulanmış cihaz model listeleri

Prosesör ve modelleme amfilerinde model adlarının doğru olması için resmî listeler.

## HeadRush Core (ve diğer HeadRush cihazları)

Kaynak: headrushfx.com Core sayfası "Full List" (Core firmware 5.1 dönemi) ve HeadRush Core User Guide v5.1.0.

\`\`\`text
${HEADRUSH_REFERENCE}
\`\`\`

## Line 6 Helix / HX Stomp / POD Go

Kaynak: line6.com/helix-models (Helix 3.80).

\`\`\`text
${HELIX_REFERENCE}
\`\`\`

## IK Multimedia AmpliTube 5 (PC/Mac yazılımı)

Kaynak: IK'nın CS / SE / AmpliTube 5 / MAX karşılaştırma tablosu (tüm gear ve hangi sürümde olduğu) ve AmpliTube 5 User Manual.

\`\`\`text
${AMPLITUBE_REFERENCE}
\`\`\`

## Boss Katana Gen 3 / MkII

Kaynak: BOSS TONE STUDIO for KATANA Gen3 parametre kılavuzu.

\`\`\`text
${KATANA_REFERENCE}
\`\`\`
`,
);
