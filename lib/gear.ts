// Ekipman kataloğu: kullanıcı amfisini, prosesörünü, gitarını ve pedallarını serbest
// metinle yazar; buradaki listeler yalnızca öneri (autocomplete) ve eşleştirme içindir.
// `controls` alanı, yapay zekânın ayarları cihazın gerçek düğme adlarıyla vermesi için
// prompt'a eklenir; `match` kullanıcının yazdığı adı kataloğa bağlar.

export type DeviceCategory = "modeler" | "modeling-amp" | "tube-amp" | "multi-fx";

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  controls: string;
  /** Kullanıcının yazdığı adı bu cihaza bağlayan desen */
  match: RegExp;
  /** Uygulamada doğrulanmış model listesi (lib/devices) var mı */
  verified?: boolean;
}

export const DEVICES: Device[] = [
  { id: "boss-katana-gen3", verified: true, match: /katana.*(gen ?3|3rd)|katana.*artist.*gen/i, name: "Boss Katana Gen 3", category: "modeling-amp", controls: "Amp Type (Acoustic/Clean/Pushed/Crunch/Lead/Brown + Variation), Gain, Volume, Bass, Middle, Treble, Booster/Mod/FX/Delay/Reverb knobs, Tone Studio parameters" },
  { id: "boss-katana-mk2", verified: true, match: /katana/i, name: "Boss Katana MkII", category: "modeling-amp", controls: "Amp Type (Acoustic/Clean/Crunch/Lead/Brown + Variation), Gain, Volume, Bass, Middle, Treble, Booster/Mod, FX, Delay/FX2, Reverb" },
  { id: "fender-mustang-lt", match: /mustang.*lt|lt ?(25|40|50)/i, name: "Fender Mustang LT25 / LT40S / LT50", category: "modeling-amp", controls: "Amp model, Gain, Volume, Treble, Middle, Bass, Stomp/Mod/Delay/Reverb slots via Fender Tone" },
  { id: "fender-mustang-gtx", match: /mustang/i, name: "Fender Mustang GTX", category: "modeling-amp", controls: "Amp model, Gain, Volume, Treble, Middle, Bass, Presence, effect slots" },
  { id: "spark", match: /\bspark\b/i, name: "Positive Grid Spark 40 / Spark 2 / Spark MINI", category: "modeling-amp", controls: "Gate, Comp/Wah, Drive, Amp (Gain, Bass, Mid, Treble, Master), Mod/EQ, Delay, Reverb" },
  { id: "yamaha-thr-ii", match: /\bthr/i, name: "Yamaha THR10II / THR30II", category: "modeling-amp", controls: "Amp type (Clean/Crunch/Lead/Hi Gain/Special/Bass/Acoustic/Flat), Gain, Master, Bass, Middle, Treble, Effect (Chorus/Flanger/Phaser/Tremolo), Echo/Reverb" },
  { id: "vox-valvetronix", match: /valvetronix|vox v[tx]/i, name: "Vox Valvetronix VT / VX serisi", category: "modeling-amp", controls: "Amp model, Gain, Treble, Middle, Bass, Volume, Effect select, Delay/Reverb" },
  { id: "nux-mighty", match: /nux|mighty/i, name: "NUX Mighty serisi", category: "modeling-amp", controls: "Amp model, Gain, Master, Bass, Mid, Treble, Mod, Delay, Reverb" },
  { id: "line6-helix", verified: true, match: /helix/i, name: "Line 6 Helix / Helix LT / Floor", category: "modeler", controls: "Amp blocks (Drive, Bass, Mid, Treble, Ch Vol, Presence, Master, Sag, Bias), Cab/IR blocks, any effect block" },
  { id: "line6-hx-stomp", verified: true, match: /hx ?stomp/i, name: "Line 6 HX Stomp / HX Stomp XL", category: "modeler", controls: "Same blocks as Helix, 6–8 block limit" },
  { id: "line6-pod-go", verified: true, match: /pod ?go/i, name: "Line 6 POD Go", category: "modeler", controls: "Helix amp/cab models, 4 flexible effect blocks + fixed blocks" },
  { id: "quad-cortex", match: /quad ?cortex|neural ?dsp/i, name: "Neural DSP Quad Cortex", category: "modeler", controls: "Amp captures/models (Gain, Bass, Mid, Treble, Presence, Master), Cab/IR, effect blocks" },
  { id: "fractal-fm3", match: /fractal|axe-?fx|\bfm[39]\b/i, name: "Fractal Audio Axe-Fx III / FM3 / FM9", category: "modeler", controls: "Amp block (Input Drive, Bass, Mid, Treble, Master, Presence, Depth), Cab block, effects" },
  { id: "kemper", match: /kemper/i, name: "Kemper Profiler", category: "modeler", controls: "Profile, Gain, Bass, Middle, Treble, Presence, Definition, Clarity, Stomps A–D, X, Mod, Delay, Reverb" },
  { id: "headrush-core", verified: true, match: /headrush.*core/i, name: "HeadRush Core", category: "modeler", controls: "HeadRush and ReValver amp models, amp block params (Gain, Bass, Mid, Treble, Presence, Master...), cab blocks (Mic Type, Break Up, On-Axis), IR loader, FX blocks, clones, NAM captures" },
  { id: "headrush", verified: true, match: /headrush/i, name: "HeadRush Prime / Flex Prime / Pedalboard / Gigboard / MX5", category: "modeler", controls: "HeadRush amp models, Gain, Bass, Mid, Treble, Presence, Master, cab blocks (Mic Type, Break Up, On-Axis), IR loader, effect blocks" },
  { id: "boss-gx", match: /\bgx-?\d|\bgt-?\d|gt-1000/i, name: "Boss GX-100 / GT-1000 / GT-1", category: "multi-fx", controls: "Preamp type, Gain, Bass, Middle, Treble, Presence, Level, FX1/FX2, Delay, Reverb" },
  { id: "zoom", match: /zoom/i, name: "Zoom G1X Four / G3n / G5n / G6", category: "multi-fx", controls: "Amp model (Gain, Tube, Bass, Middle, Treble, Presence, Level), effect chain" },
  { id: "mooer-ge", match: /mooer/i, name: "Mooer GE150 / GE200 / GE300", category: "multi-fx", controls: "Amp model (Gain, Bass, Mid, Treble, Presence, Master), Cab, FX/DS/Mod/Delay/Reverb" },
  { id: "marshall-tube", match: /marshall|jcm|\bdsl\b|jvm|origin/i, name: "Marshall (JCM800 / DSL / JVM / Origin)", category: "tube-amp", controls: "Channel, Gain, Bass, Middle, Treble, Presence, Resonance (if any), Master" },
  { id: "fender-tube", match: /blues junior|deluxe|twin|princeton|bassman|hot rod|fender/i, name: "Fender (Blues Junior / Deluxe / Twin / Princeton)", category: "tube-amp", controls: "Volume, Treble, Bass, Middle, Reverb, Fat/Bright switch" },
  { id: "vox-ac30", match: /ac ?30|ac ?15|\bvox\b/i, name: "Vox AC30 / AC15", category: "tube-amp", controls: "Channel (Normal/Top Boost), Volume, Treble, Bass, Tone Cut, Reverb, Tremolo, Master" },
  { id: "orange-tube", match: /orange|rockerverb|tiny terror|crush/i, name: "Orange (Rockerverb / Tiny Terror / Crush)", category: "tube-amp", controls: "Gain, Bass, Middle, Treble, Volume, Shape (if any), Reverb" },
  { id: "mesa-tube", match: /mesa|boogie|rectifier|mark ?(iv|v|vii)/i, name: "Mesa/Boogie (Mark / Rectifier)", category: "tube-amp", controls: "Channel/Mode, Gain, Treble, Mid, Bass, Presence, Master, Graphic EQ (Mark)" },
];

/** Amfi alanı için öneriler (modelleme ve lambalı amfiler) */
export const AMP_SUGGESTIONS = [
  "Boss Katana 50 Gen 3", "Boss Katana 100 MkII", "Fender Mustang LT25", "Fender Mustang GTX50", "Positive Grid Spark 40",
  "Yamaha THR30II", "Vox VT20X", "NUX Mighty Plug Pro", "Marshall DSL40CR", "Marshall JCM800 2203", "Marshall Origin 20C",
  "Fender Blues Junior IV", "Fender Hot Rod Deluxe IV", "Fender Twin Reverb", "Vox AC30C2", "Vox AC15C1",
  "Orange Rockerverb 50", "Orange Crush 35RT", "Mesa/Boogie Mark V", "Mesa/Boogie Dual Rectifier", "Peavey 6505+",
  "EVH 5150III", "Laney Cub-Super12", "Blackstar HT-5R", "Blackstar ID:Core 40", "Hughes & Kettner Black Spirit 200",
];

/** Prosesör / multi-efekt alanı için öneriler */
export const PROCESSOR_SUGGESTIONS = [
  "Yok", "HeadRush Core", "HeadRush Prime", "HeadRush Flex Prime", "HeadRush MX5", "Line 6 Helix", "Line 6 HX Stomp",
  "Line 6 POD Go", "Neural DSP Quad Cortex", "Fractal Audio FM3", "Kemper Profiler", "Boss GX-100", "Boss GT-1000",
  "Zoom G6", "Mooer GE300", "Valeton GP-200", "Tone Master Pro",
];

/** Gitar alanı için öneriler ve tipik manyetik dizilimleri */
export const GUITAR_SUGGESTIONS: { name: string; pickups: string }[] = [
  { name: "Fender Stratocaster", pickups: "SSS" },
  { name: "Fender Player Stratocaster HSS", pickups: "HSS" },
  { name: "Squier Classic Vibe Stratocaster", pickups: "SSS" },
  { name: "Fender Telecaster", pickups: "SS" },
  { name: "Gibson Les Paul Standard", pickups: "HH" },
  { name: "Epiphone Les Paul Standard", pickups: "HH" },
  { name: "Gibson SG Standard", pickups: "HH" },
  { name: "Gibson ES-335", pickups: "HH" },
  { name: "Gibson Les Paul Junior", pickups: "P90" },
  { name: "PRS SE Custom 24", pickups: "HH" },
  { name: "Ibanez RG", pickups: "HSH" },
  { name: "Jackson Soloist", pickups: "HSH" },
  { name: "ESP LTD EC-1000 (EMG)", pickups: "active" },
  { name: "Schecter Hellraiser (EMG)", pickups: "active" },
  { name: "Yamaha Pacifica 112V", pickups: "HSS" },
];

/** Gitar adından tipik manyetik dizilimini tahmin et (kullanıcı değiştirebilir) */
export function guessPickups(guitar: string): string | undefined {
  const g = guitar.toLowerCase();
  const exact = GUITAR_SUGGESTIONS.find((s) => s.name.toLowerCase() === g);
  if (exact) return exact.pickups;
  if (/emg|fishman|active|aktif/.test(g)) return "active";
  if (/hss/.test(g)) return "HSS";
  if (/hsh|ibanez rg|soloist/.test(g)) return "HSH";
  if (/p-?90|junior|special/.test(g)) return "P90";
  if (/strat/.test(g)) return "SSS";
  if (/tele/.test(g)) return "SS";
  if (/les paul|\bsg\b|335|prs|explorer|flying v|firebird/.test(g)) return "HH";
  return undefined;
}

export const PICKUP_CONFIGS = [
  { id: "SSS", label: "SSS (3 single-coil, Strat)" },
  { id: "HSS", label: "HSS (köprüde humbucker)" },
  { id: "HH", label: "HH (2 humbucker, Les Paul / SG)" },
  { id: "SS", label: "SS (2 single-coil, Telecaster)" },
  { id: "P90", label: "P-90" },
  { id: "HSH", label: "HSH" },
  { id: "active", label: "Aktif manyetik (EMG / Fishman)" },
];

export const PARTS = [
  { id: "lead", label: "Solo" },
  { id: "rhythm", label: "Ritim" },
  { id: "intro", label: "Giriş / Riff" },
  { id: "clean", label: "Temiz bölüm" },
  { id: "full", label: "Genel ton" },
];

export interface UserRig {
  /** Amfi modeli, serbest metin (ör. "Marshall DSL40CR") */
  amp: string;
  /** Gitar prosesörü / multi-efekt, isteğe bağlı (ör. "HeadRush Core") */
  processor: string;
  guitar: string;
  pickups: string;
  /** Her satıra bir pedal */
  pedals: string;
}

export const DEFAULT_RIG: UserRig = {
  amp: "",
  processor: "",
  guitar: "",
  pickups: "SSS",
  pedals: "",
};

export function findDevice(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

/** Kullanıcının yazdığı amfi/prosesör adını katalogdaki bir cihaza bağla */
export function matchDevice(text: string): Device | undefined {
  const t = text.trim();
  if (!t || /^(yok|none|-)$/i.test(t)) return undefined;
  return DEVICES.find((d) => d.match.test(t));
}

/** Eski sürümdeki { deviceId, customDevice } kaydını yeni yapıya çevir */
export function migrateRig(raw: Record<string, unknown>): UserRig {
  const rig = { ...DEFAULT_RIG } as UserRig;
  for (const k of Object.keys(DEFAULT_RIG) as (keyof UserRig)[]) {
    if (typeof raw[k] === "string") rig[k] = raw[k] as string;
  }
  if (!raw.amp && !raw.processor && typeof raw.deviceId === "string") {
    const old = raw.deviceId === "custom" ? String(raw.customDevice ?? "") : (findDevice(raw.deviceId)?.name ?? "");
    const d = findDevice(raw.deviceId);
    if (d && (d.category === "modeler" || d.category === "multi-fx")) rig.processor = old;
    else rig.amp = old;
  }
  return rig;
}
