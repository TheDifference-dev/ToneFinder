import { z } from "zod";
import { DEVICES, PARTS, PICKUP_CONFIGS } from "./gear";

const deviceIds = DEVICES.map((d) => d.id);
const partIds = PARTS.map((p) => p.id);
const pickupIds = PICKUP_CONFIGS.map((p) => p.id);

// İstemciden gelen istek
export const ToneRequestSchema = z.object({
  song: z.string().trim().min(1).max(120),
  artist: z.string().trim().max(120).default(""),
  part: z.string().refine((v) => partIds.includes(v)),
  rig: z.object({
    deviceId: z.string().refine((v) => v === "custom" || deviceIds.includes(v)),
    customDevice: z.string().max(120).default(""),
    guitar: z.string().max(120).default(""),
    pickups: z.string().refine((v) => pickupIds.includes(v)),
    pedals: z.string().max(400).default(""),
  }),
});

export type ToneRequest = z.infer<typeof ToneRequestSchema>;

// Claude'un döndürdüğü yapılandırılmış ton tarifi
const Setting = z.object({
  name: z.string().describe("Cihaz üzerindeki düğme/parametre adı, cihazda yazdığı gibi (ör. Gain, Bass, Mix, Time)"),
  value: z.string().describe("Ayar değeri; 0–10 ölçekli düğmeler için sayı (ör. 6.5), diğerleri için birimiyle (ör. 380 ms, %25, On)"),
  note: z.string().describe("Kısa açıklama; gerekmiyorsa boş string"),
});

export const ToneResultSchema = z.object({
  song: z.object({
    title: z.string(),
    artist: z.string(),
    album_or_year: z.string(),
    tone_character: z.string().describe("Orijinal tonun 1–2 cümlelik Türkçe tarifi"),
    original_gear: z.array(z.string()).describe("Orijinal kayıtta kullanıldığı bilinen/tahmin edilen ekipman"),
  }),
  amp: z.object({
    model: z.string().describe("Kullanıcının cihazında seçilecek amfi modeli / kanal / tip"),
    why: z.string(),
    settings: z.array(Setting),
  }),
  effects: z.array(
    z.object({
      position: z.enum(["pre-amp", "loop", "post-amp"]),
      type: z.string().describe("Efekt türü (Overdrive, Delay, Reverb, Chorus, Wah, Compressor, Noise Gate...)"),
      model: z.string().describe("Kullanıcının cihazındaki karşılığı ya da önerilen pedal"),
      settings: z.array(Setting),
      note: z.string(),
    }),
  ),
  guitar: z.object({
    pickup: z.string().describe("Seçilecek manyetik pozisyonu"),
    volume: z.string(),
    tone: z.string(),
    tuning: z.string(),
    notes: z.string(),
  }),
  playing_tips: z.array(z.string()),
  adaptation_notes: z.string().describe("Kullanıcının ekipmanına uyarlarken yapılan ödünler ve nasıl telafi edildiği"),
  confidence: z.enum(["high", "medium", "low"]),
});

export type ToneResult = z.infer<typeof ToneResultSchema>;
