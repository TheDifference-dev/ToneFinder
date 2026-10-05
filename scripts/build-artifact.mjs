// artifact/template.html + uygulama verileri (cihaz listesi, doğrulanmış model
// referansları) → artifact/tonefinder.html. Ücretsiz (API anahtarsız) Claude Artifact
// sürümünü Next.js uygulamasıyla aynı veride tutar.
// Kullanım: npm run build:artifact

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// lib/*.ts dosyaları import içermeyen saf veri modülleri; Node'un tip ayıklamasıyla
// doğrudan yüklenebilirler.
const gear = await import(join(root, "lib/gear.ts"));
const amps = await import(join(root, "lib/amps.ts"));
const guitars = await import(join(root, "lib/guitars.ts"));
const { HEADRUSH_REFERENCE } = await import(join(root, "lib/devices/headrush.ts"));
const { HELIX_REFERENCE } = await import(join(root, "lib/devices/helix.ts"));
const { KATANA_REFERENCE } = await import(join(root, "lib/devices/katana.ts"));

const data = {
  // RegExp JSON'a çevrilemez; sayfada kaynağından yeniden kurulur
  devices: gear.DEVICES.map((d) => ({ ...d, match: d.match.source })),
  processorSuggestions: gear.PROCESSOR_SUGGESTIONS,
  ampModes: gear.AMP_MODES,
  // Amfi ve gitar profilleri yapay zekâya verilecek metin olarak önceden hazırlanır
  amps: amps.AMPS.map((a) => ({
    name: `${a.brand} ${a.model}`,
    match: a.match.source,
    profile: amps.ampProfileText(a),
    monitor: a.monitor ?? "",
  })),
  guitars: guitars.GUITARS.map((g) => ({
    name: `${g.brand} ${g.model}`,
    brandKey: g.brand.split(" ")[0].toLowerCase(),
    match: g.match.source,
    pickups: g.pickups,
    detail: g.pickupDetail,
    profile: guitars.guitarProfileText(g),
  })),
  pickupProfiles: Object.fromEntries(gear.PICKUP_CONFIGS.map((p) => [p.id, guitars.pickupLayoutText(p.id)])),
  pickups: gear.PICKUP_CONFIGS,
  parts: gear.PARTS,
  references: {
    "headrush-core": HEADRUSH_REFERENCE,
    headrush: HEADRUSH_REFERENCE,
    "line6-helix": HELIX_REFERENCE,
    "line6-hx-stomp": HELIX_REFERENCE,
    "line6-pod-go": HELIX_REFERENCE,
    "boss-katana-gen3": KATANA_REFERENCE,
    "boss-katana-mk2": KATANA_REFERENCE,
  },
};

const template = readFileSync(join(root, "artifact/template.html"), "utf8");
// </script> kaçışı: veri içinde geçerse script bloğunu kapatmasın
const json = JSON.stringify(data).replace(/<\//g, "<\\/");
const out = template.replace("/*__DATA__*/null", json);
if (out === template) throw new Error("DATA placeholder not found in template");
writeFileSync(join(root, "artifact/tonefinder.html"), out);
console.log(`artifact/tonefinder.html written (${(out.length / 1024).toFixed(0)} KB)`);
