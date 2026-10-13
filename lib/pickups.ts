// Manyetik kataloğu: gitarın her pozisyonuna takılı manyetiğin türü ve çıkış seviyesi.
// Rakiplerdeki "custom pickups" gibi: stok olmayan manyetikler (ör. Strat'ın köprüsünde
// Seymour Duncan JB) gitar farkı telafisini değiştirir. Çıkış seviyeleri üreticilerin
// "vintage / medium / hot / high output" sınıflandırmasına göredir; DC direnç değerleri verilmedi.

export type PickupKind = "single-coil" | "humbucker" | "P-90" | "active" | "mini-humbucker" | "bass";
export type PickupOutput = "low" | "medium" | "high" | "very high";

export interface PickupModel {
  brand: string;
  model: string;
  kind: PickupKind;
  output: PickupOutput;
  character: string;
  match: RegExp;
}

export const PICKUP_OUTPUT_LABELS: Record<PickupOutput, string> = {
  low: "düşük çıkış",
  medium: "orta çıkış",
  high: "yüksek çıkış",
  "very high": "çok yüksek çıkış",
};

export const PICKUP_MODELS: PickupModel[] = [
  // Humbucker
  { brand: "Seymour Duncan", model: "JB (SH-4)", kind: "humbucker", output: "high", character: "Sıcak köprü humbucker'ı, tiz ve üst ortası belirgin; klasik rock/metal lead.", match: /\bjb\b|sh-?4/i },
  { brand: "Seymour Duncan", model: "'59 (SH-1)", kind: "humbucker", output: "medium", character: "PAF tarzı, açık ve dengeli, vintage.", match: /'?59\b|sh-?1\b/i },
  { brand: "Seymour Duncan", model: "Jazz (SH-2)", kind: "humbucker", output: "medium", character: "Temiz, net sap humbucker'ı.", match: /\bjazz\b|sh-?2\b/i },
  { brand: "Seymour Duncan", model: "Distortion (SH-6)", kind: "humbucker", output: "very high", character: "Çok yüksek çıkış, sıkı alt, metal.", match: /sh-?6|duncan distortion/i },
  { brand: "Seymour Duncan", model: "Invader (SH-8)", kind: "humbucker", output: "very high", character: "Kalın, sıkıştırılmış, çok yüksek çıkış.", match: /invader|sh-?8/i },
  { brand: "Seymour Duncan", model: "Pearly Gates (SH-PG1)", kind: "humbucker", output: "medium", character: "Parlak, havadar, Billy Gibbons tonu.", match: /pearly ?gates/i },
  { brand: "DiMarzio", model: "Super Distortion (DP100)", kind: "humbucker", output: "very high", character: "70'lerin yüksek çıkışlı humbucker'ı, kalın orta.", match: /super ?distortion|dp-?100/i },
  { brand: "DiMarzio", model: "Evolution (DP158/159)", kind: "humbucker", output: "high", character: "Agresif üst orta, Steve Vai.", match: /evolution|dp-?15[89]/i },
  { brand: "DiMarzio", model: "PAF Pro / PAF 36th", kind: "humbucker", output: "medium", character: "Modern PAF, açık ve dinamik.", match: /paf ?(pro|36)/i },
  { brand: "Gibson", model: "490R / 498T", kind: "humbucker", output: "medium", character: "Modern Gibson seti, 498T köprüde biraz sıcak.", match: /49[08]/i },
  { brand: "Gibson", model: "Burstbucker / '57 Classic", kind: "humbucker", output: "medium", character: "Vintage PAF tarzı, açık.", match: /burstbucker|'?57 classic/i },
  { brand: "Epiphone", model: "ProBucker", kind: "humbucker", output: "medium", character: "PAF tarzı Epiphone manyetiği.", match: /probucker/i },
  { brand: "Epiphone", model: "Alnico Classic Pro", kind: "humbucker", output: "medium", character: "Eski Epiphone stok humbucker'ı.", match: /alnico classic/i },
  { brand: "Bare Knuckle", model: "Aftermath / Painkiller", kind: "humbucker", output: "very high", character: "Modern metal, sıkı ve agresif.", match: /aftermath|painkiller|bare ?knuckle/i },
  // Aktif
  { brand: "EMG", model: "81", kind: "active", output: "very high", character: "Aktif köprü, sıkıştırılmış, kesik ve sessiz (Hetfield, Wylde).", match: /emg ?81/i },
  { brand: "EMG", model: "85 / 60", kind: "active", output: "high", character: "Aktif sap, daha sıcak ve yuvarlak.", match: /emg ?(85|60)/i },
  { brand: "Fishman", model: "Fluence Modern / Classic", kind: "active", output: "high", character: "Aktif, çok sessiz, ses modları seçilebilir.", match: /fluence|fishman/i },
  // Single-coil
  { brand: "Fender", model: "Custom Shop Texas Special", kind: "single-coil", output: "medium", character: "Biraz sıcak Strat manyetiği, SRV tonu.", match: /texas special/i },
  { brand: "Fender", model: "Custom Shop Fat '50s / '69", kind: "single-coil", output: "low", character: "Vintage, parlak ve net.", match: /fat ?'?50|custom shop '?69/i },
  { brand: "Fender", model: "V-Mod / Pure Vintage", kind: "single-coil", output: "low", character: "Vintage çıkış, cam gibi parlak.", match: /v-?mod|pure vintage/i },
  { brand: "Fender", model: "Noiseless (Gen 4 / N3)", kind: "single-coil", output: "medium", character: "Uğultusuz stacked single-coil.", match: /noiseless|n3\b/i },
  { brand: "Seymour Duncan", model: "Hot Rails / Little '59 (single boyutlu humbucker)", kind: "humbucker", output: "high", character: "Single-coil yuvasına humbucker sesi.", match: /hot ?rails|little ?'?59/i },
  { brand: "DiMarzio", model: "Area '61 / '67", kind: "single-coil", output: "low", character: "Uğultusuz vintage Strat sesi.", match: /area ?'?6[17]/i },
  // P-90
  { brand: "Gibson", model: "P-90", kind: "P-90", output: "medium", character: "Ham, hırıltılı orta frekans.", match: /p-?90/i },
  // Mini humbucker
  { brand: "Gibson", model: "Mini-humbucker", kind: "mini-humbucker", output: "medium", character: "Humbucker'dan parlak ve odaklı.", match: /mini-?humbucker/i },
];

export function matchPickup(text: string): PickupModel | undefined {
  const t = text.trim();
  if (!t || /^(stok|stock|-)$/i.test(t)) return undefined;
  return PICKUP_MODELS.find((p) => p.match.test(t));
}

export const PICKUP_MODEL_NAMES = PICKUP_MODELS.map((p) => `${p.brand} ${p.model}`);

export const PICKUP_POSITIONS = [
  { id: "neck", label: "Sap" },
  { id: "middle", label: "Orta" },
  { id: "bridge", label: "Köprü" },
] as const;
export type PickupPosition = (typeof PICKUP_POSITIONS)[number]["id"];

/** Stok olmayan manyetikler için yapay zekâya verilecek satırlar */
export function customPickupsText(models: Partial<Record<PickupPosition, string>>): string {
  return PICKUP_POSITIONS.filter((p) => models[p.id]?.trim())
    .map((p) => {
      const text = models[p.id]!.trim();
      const known = matchPickup(text);
      return `- ${p.id}: ${text}${known ? ` (${known.kind}, ${known.output} output: ${known.character})` : ""}`;
    })
    .join("\n");
}
