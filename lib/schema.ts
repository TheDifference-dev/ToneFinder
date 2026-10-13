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

export const ToneResultSchema = z.object({
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
        settings: z.array(AdaptedSetting),
        note: z.string(),
      }),
    )
    .describe(
      "Kullanıcının ekipmanıyla sinyal zinciri, gitardan hoparlöre sırasıyla: pedallar, prosesör blokları ve amfi. Prosesörde cab bloğu varsa mikrofon modeli, pozisyon ve mesafe ayar olarak yer almalı.",
    ),
  guitar: z.object({
    pickup: z.string().describe("Kullanıcının gitarında seçilecek manyetik pozisyonu"),
    volume: z.string(),
    tone: z.string(),
    tuning: z.string(),
    notes: z.string(),
    compensation: z
      .array(z.string())
      .describe("Orijinal gitar/manyetik ile kullanıcınınki arasındaki farkı kapatmak için yapılan her ayar ve nedeni"),
  }),
  playing_tips: z.array(z.string()),
  difficulty: z.object({
    score: z.number().int().describe("Bu bölümü çalmanın zorluğu: 1 çok kolay, 5 çok zor"),
    factors: z.array(z.string()).describe("Zorluğu belirleyen teknikler (ör. hızlı alternate picking, legato, bending)"),
  }),
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
  sources: z.array(z.object({ title: z.string(), url: z.string() })).describe("Araştırmada dayanılan kaynaklar"),
});

export type ToneResult = z.infer<typeof ToneResultSchema>;

// API'nin istemciye NDJSON olarak akıttığı olaylar
export type ToneEvent =
  | { type: "status"; message: string }
  | { type: "search"; query: string }
  | { type: "fetch"; url: string }
  | { type: "result"; result: ToneResult; meta: ToneMeta }
  | { type: "error"; error: string };

export interface ToneMeta {
  /** Orijinal araştırma önbellekten mi geldi */
  cached: boolean;
  /** Orijinal araştırmanın yapıldığı zaman (ms) */
  researchedAt: number;
}
