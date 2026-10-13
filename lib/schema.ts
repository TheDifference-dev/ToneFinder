import { z } from "zod";
import { AMP_EFFECTS, AMP_MODES, INSTRUMENTS, PARTS, PICKUP_CONFIGS, TONE_TYPES } from "./gear";

const partIds = PARTS.map((p) => p.id);
const pickupIds = PICKUP_CONFIGS.map((p) => p.id);

const ids = <T extends readonly { id: string }[]>(list: T) => list.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];

// İstemciden gelen istek
export const ToneRequestSchema = z.object({
  song: z.string().trim().min(1).max(120),
  artist: z.string().trim().max(120).default(""),
  part: z.string().refine((v) => partIds.includes(v)),
  partDetail: z.string().trim().max(120).default(""),
  instrument: z.enum(ids(INSTRUMENTS)).default("guitar"),
  toneType: z.enum(ids(TONE_TYPES)).default("auto"),
  /** true: kayıtlı orijinal araştırmayı kullanma, yeniden araştır */
  fresh: z.boolean().default(false),
  /** "Kulağa yanlış mı geliyor?" geri bildirimi: orijinal araştırma korunur, yalnız uyarlama yenilenir */
  feedback: z.string().trim().max(600).default(""),
  rig: z
    .object({
      amp: z.string().trim().max(120).default(""),
      processor: z.string().trim().max(120).default(""),
      ampMode: z.enum(AMP_MODES.map((m) => m.id) as [string, ...string[]]).default("amp"),
      guitar: z.string().trim().max(120).default(""),
      pickups: z.string().refine((v) => pickupIds.includes(v)),
      pedals: z.string().trim().max(600).default(""),
      ampEffects: z.array(z.enum(AMP_EFFECTS)).max(AMP_EFFECTS.length).default([]),
      pickupModels: z
        .object({
          neck: z.string().trim().max(80).default(""),
          middle: z.string().trim().max(80).default(""),
          bridge: z.string().trim().max(80).default(""),
        })
        .default({ neck: "", middle: "", bridge: "" }),
    })
    .refine((r) => r.amp || r.processor, { message: "Amfi ya da prosesör gerekli" }),
});

export type ToneRequest = z.infer<typeof ToneRequestSchema>;

// Claude'un döndürdüğü yapılandırılmış ton tarifi
const Setting = z.object({
  name: z.string().describe("Düğme/parametre adı, cihazda yazdığı gibi (ör. Gain, Bass, Mic, Distance, Time)"),
  value: z.string().describe("Ayar değeri; 0–10 ölçekli düğmeler için yalnızca sayı (ör. 6.5), diğerleri birimiyle (ör. 380 ms, 2 in, %25, On, SM57)"),
  note: z.string().describe("Kısa açıklama; gerekmiyorsa boş string"),
});

// Kullanıcının cihazında verilen her ayarın dayanağı (ToneMatcher'daki Cited / Inferred / Double-check gibi)
const AdaptedSetting = Setting.extend({
  basis: z
    .enum(["cited", "inferred", "check"])
    .describe(
      "cited: cihaz referansı/profili, kılavuz ya da güvenilir kaynak bu ayarı doğrudan destekliyor; inferred: orijinal tondan ve cihazın yapısından çıkarıldı; check: belirsiz, kulakla kontrol edilmeli",
    ),
});

const Certainty = z.enum(["confirmed", "likely", "guess"]).describe(
  "confirmed: kaynakta açıkça geçiyor; likely: güçlü dolaylı kanıt; guess: tahmin",
);

const Sources = z.array(z.object({ title: z.string(), url: z.string() })).describe("Dayanılan kaynaklar");

// 1. adım: şarkının orijinal tonu (kullanıcının ekipmanından bağımsız; önbellekte saklanır)
export const OriginalToneSchema = z.object({
  song: z.object({
    title: z.string(),
    artist: z.string(),
    album_or_year: z.string(),
    tone_character: z.string().describe("Orijinal tonun 1–2 cümlelik Türkçe tarifi"),
    tone_tags: z.array(z.string()).describe("Tonun 3–8 kısa Türkçe özelliği (ör. sıkı alt, orta frekans öne çıkık, parlak, kompresli)"),
    bpm: z.string().describe("Şarkının temposu (ör. 117 BPM); bilinmiyorsa boş string"),
    key: z.string().describe("Şarkının tonalitesi (ör. E minör); bilinmiyorsa boş string"),
  }),
  original_rig: z.object({
    guitar: z.object({ model: z.string(), pickup: z.string(), certainty: Certainty }),
    amps: z.array(
      z.object({ model: z.string(), channel: z.string(), settings: z.array(Setting), certainty: Certainty, notes: z.string() }),
    ),
    cab: z.object({
      model: z.string(),
      speakers: z.string(),
      mics: z.array(z.object({ model: z.string(), position: z.string(), distance: z.string() })),
      certainty: Certainty,
      notes: z.string(),
    }),
    pedals: z.array(
      z.object({ model: z.string(), purpose: z.string(), settings: z.array(Setting), certainty: Certainty }),
    ),
    tuning: z.string(),
    recording_notes: z.string().describe("Stüdyo, prodüktör, double-tracking, post-prodüksiyon efektleri vb."),
  }),
  difficulty: z.object({
    score: z.number().int().describe("Bu bölümü çalmanın zorluğu: 1 çok kolay, 5 çok zor"),
    factors: z.array(z.string()).describe("Zorluğu belirleyen teknikler (ör. hızlı alternate picking, legato, bending)"),
  }),
  sections: z
    .array(z.object({ name: z.string().describe("Türkçe bölüm adı (ör. Temiz giriş, Solo)"), description: z.string() }))
    .describe("Şarkıdaki diğer gitar bölümleri ve tonlarının istenen bölümden farkı; yoksa boş dizi"),
  warnings: z.array(z.string()).describe("Araştırmadaki tartışmalı ya da zayıf noktalar (Türkçe); yoksa boş dizi"),
  research_confidence: z.enum(["high", "medium", "low"]),
  sources: Sources,
});

export type OriginalTone = z.infer<typeof OriginalToneSchema>;

// 2. adım: kullanıcının ekipmanına uyarlama
export const AdaptedToneSchema = z.object({
  chain: z
    .array(
      z.object({
        block: z.string().describe("Blok türü: Noise Gate, Compressor, Drive, Fuzz, Amp, Cab, Mic, EQ, Modulation, Delay, Reverb..."),
        device_model: z
          .string()
          .describe("Amfide kanal/ayar adı, prosesörde seçilecek modelin tam adı ya da kullanıcının pedalının adı"),
        source: z
          .enum(["amp", "processor", "pedal"])
          .describe("amp: kullanıcının amfisi; processor: kullanıcının prosesöründeki blok; pedal: kullanıcının fiziksel pedalı"),
        emulates: z.string().describe("Bu modelin taklit ettiği gerçek ekipman ve orijinal rig'de neyin yerine geçtiği"),
        match: z
          .enum(["exact", "close", "substitute"])
          .describe("exact: orijinaldeki ekipmanın aynısı ya da modeli; close: aynı aileden yakın karşılık; substitute: farklı ekipmanla yerine koyma"),
        start_from: z
          .string()
          .describe("Önce yüklenecek fabrika preseti, kanal hafızası ya da amp type (ör. '[14] Thrash Overkill'); kaynak ya da cihaz referansı desteklemiyorsa boş string"),
        settings: z.array(AdaptedSetting),
        unused_controls: z
          .array(z.object({ name: z.string(), reason: z.string() }))
          .describe("Bu blokta bu ton için dokunulmayacak/kapalı kalacak kontroller ve kısa nedeni (Türkçe); yoksa boş dizi"),
        note: z.string(),
      }),
    )
    .describe(
      "Kullanıcının ekipmanıyla sinyal zinciri, gitardan hoparlöre sırasıyla: pedallar, prosesör blokları ve amfi. Prosesörde cab bloğu varsa mikrofon modeli, pozisyon ve mesafe ayar olarak yer almalı.",
    ),
  guitar: z.object({
    pickup: z.string().describe("Kullanıcının gitarında seçilecek manyetik pozisyonu"),
    selector: z
      .enum(["neck", "neck_middle", "middle", "middle_bridge", "bridge", "neck_bridge", "none"])
      .describe("Seçici konumu: neck=sap, middle=orta, bridge=köprü, ikililer ara konumlar; seçicisi olmayan gitar/bas için none"),
    volume: z.string(),
    tone: z.string(),
    tuning: z.string(),
    notes: z.string(),
    compensation: z
      .array(z.string())
      .describe("Orijinal gitar/manyetik ile kullanıcınınki arasındaki farkı kapatmak için yapılan her ayar ve nedeni"),
  }),
  other_sections: z
    .array(
      z.object({
        name: z.string(),
        changes: z.array(
          z.object({ block: z.string(), setting: z.string(), value: z.string(), why: z.string() }),
        ).describe("Yalnız ana tondan farklı olan ayarlar; listelenmeyen her şey ana tondaki gibi"),
      }),
    )
    .describe("Orijinal araştırmadaki diğer bölümler için ana tona göre farklar; yoksa boş dizi"),
  playing_tips: z.array(z.string()),
  match: z.object({
    percent: z
      .number()
      .int()
      .describe("0–100: kullanıcının ekipmanıyla orijinal tona ne kadar yaklaşılabileceğinin dürüst tahmini; ölçüm değil"),
    reason: z.string().describe("Yüzdeyi düşüren ya da yükselten başlıca nedenler"),
  }),
  limitations: z.array(z.string()).describe("Kullanıcının ekipmanıyla tam yakalanamayacak yönler"),
  alternatives: z.array(z.string()).describe("Farklı bir yaklaşım ya da ileride edinilebilecek ekipmanla alternatifler"),
  adaptation_notes: z.string().describe("Kullanıcının ekipmanına uyarlarken yapılan ödünler ve nasıl telafi edildiği"),
  confidence: z.enum(["high", "medium", "low"]),
  sources: Sources,
});

export type AdaptedTone = z.infer<typeof AdaptedToneSchema>;

/** Ekranda gösterilen tam sonuç: orijinal + uyarlama */
export type ToneResult = OriginalTone & AdaptedTone;

/** Uyarlama bitmeden önce gösterilen kısmi sonuç */
export type PartialTone = OriginalTone & Partial<AdaptedTone>;

export function mergeTone(original: OriginalTone, adapted: AdaptedTone): ToneResult {
  const seen = new Set<string>();
  const sources = [...original.sources, ...adapted.sources].filter((s) => !seen.has(s.url) && seen.add(s.url));
  return { ...original, ...adapted, sources };
}

// API'nin istemciye NDJSON olarak akıttığı olaylar
export type ToneEvent =
  | { type: "status"; message: string }
  | { type: "search"; query: string }
  | { type: "fetch"; url: string }
  | { type: "original"; original: OriginalTone; meta: ToneMeta }
  | { type: "result"; result: ToneResult; meta: ToneMeta }
  | { type: "error"; error: string };

export interface ToneMeta {
  /** Orijinal araştırma önbellekten mi geldi */
  cached: boolean;
  /** Orijinal araştırmanın yapıldığı zaman (ms) */
  researchedAt: number;
}

// Katalogda olmayan bir ekipmanın web'den çıkarılan profili ("Web'de tanıt")
export const GEAR_KINDS = ["amp", "processor", "guitar", "bass", "pedal", "other"] as const;

export const GearProfileSchema = z.object({
  exists: z.boolean().describe("Bu adla gerçek, üretilmiş ya da üretilmekte olan bir ürün bulundu mu"),
  kind: z.enum(GEAR_KINDS),
  brand: z.string(),
  model: z.string().describe("Ürünün tam adı; bulunamadıysa kullanıcının yazdığı ad"),
  summary: z.string().describe("Ne olduğu ve ses karakteri, 1–2 cümle Türkçe; bulunamadıysa nedeni"),
  channels_or_modes: z.array(z.string()).describe("Kanallar, amp type'lar, modlar ya da manyetik dizilimi; yoksa boş"),
  controls: z.array(z.string()).describe("Paneldeki düğme ve anahtar adları, cihazda yazdığı gibi"),
  built_in_effects: z.array(z.string()).describe("Dahili efektler (amfi/prosesör için); yoksa boş"),
  notes: z.string().describe("Ton ayarı için önemli notlar (ör. efekt döngüsü, stereo giriş, aktif manyetik)"),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});

export type GearProfile = z.infer<typeof GearProfileSchema> & { identifiedAt?: number };

export function gearProfileText(p: GearProfile): string {
  return [
    `${p.brand} ${p.model} (${p.kind}; profile researched on the web)`,
    p.summary && `- Summary: ${p.summary}`,
    p.channels_or_modes.length > 0 && `- Channels/modes: ${p.channels_or_modes.join(" / ")}`,
    p.controls.length > 0 && `- Controls: ${p.controls.join(", ")}`,
    p.built_in_effects.length > 0 && `- Built-in effects: ${p.built_in_effects.join(", ")}`,
    p.notes && `- Notes: ${p.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}
