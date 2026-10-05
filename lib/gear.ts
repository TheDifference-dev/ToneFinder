// Prosesör / modelleme cihazı kataloğu ve ekipman yapısı. Amfi kataloğu lib/amps.ts,
// gitar kataloğu lib/guitars.ts içindedir; kullanıcı her şeyi serbest metinle yazar,
// kataloglar yalnızca öneri (autocomplete) ve eşleştirme içindir.
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

/** Prosesör / multi-efekt alanı için öneriler */
export const PROCESSOR_SUGGESTIONS = [
  "Yok", "HeadRush Core", "HeadRush Prime", "HeadRush Flex Prime", "HeadRush MX5", "Line 6 Helix", "Line 6 HX Stomp",
  "Line 6 POD Go", "Neural DSP Quad Cortex", "Fractal Audio FM3", "Kemper Profiler", "Boss GX-100", "Boss GT-1000",
  "Zoom G6", "Mooer GE300", "Valeton GP-200", "Tone Master Pro",
];

export const PICKUP_CONFIGS = [
  { id: "SSS", label: "SSS (3 single-coil, Strat)" },
  { id: "HSS", label: "HSS (köprüde humbucker)" },
  { id: "HH", label: "HH (2 humbucker, Les Paul / SG)" },
  { id: "SS", label: "SS (2 single-coil, Telecaster)" },
  { id: "P90", label: "P-90" },
  { id: "HSH", label: "HSH" },
  { id: "active", label: "Aktif manyetik (EMG / Fishman)" },
  { id: "HS", label: "HS (köprüde humbucker, sapta single-coil)" },
  { id: "FT", label: "Filter'Tron (Gretsch)" },
];

/** Kullanıcının amfisini nasıl kullandığı; tonun nerede kurulacağını belirler */
export const AMP_MODES = [
  {
    id: "amp",
    label: "Amfi olarak (kanal, gain, EQ)",
    prompt:
      "The user plays through the amp itself: build the core tone with the amp's own channels, gain and EQ; pedals and the processor (if any) add drives and effects in front.",
  },
  {
    id: "monitor",
    label: "Monitör / Stereo In (ton prosesörden)",
    prompt:
      "The user uses the amp only as a clean (stereo) monitor for the processor. The whole tone (amp model, cab/IR with mic, drives, effects) must come from the processor with cab simulation ON, in stereo where it helps. Set the amp to its stereo-in / flat / clean mode with EQ neutral and its own effects off; give amp settings only for that, never a gain or drive setting on the amp.",
  },
  {
    id: "front",
    label: "Prosesör amfinin önünde",
    prompt:
      "The processor goes into the amp's normal input like a pedalboard: the amp's channel provides the base tone (clean or lightly driven); in the processor use drives, wah, modulation and time effects, with no cab simulation and normally no full amp model.",
  },
  {
    id: "loop",
    label: "Prosesör efekt döngüsünde (4 kablo)",
    prompt:
      "Four-cable method: processor drives/wah/compressor before the amp's input, modulation/delay/reverb in the amp's effects loop; the amp's preamp channel provides the main distortion; no cab simulation in the processor.",
  },
] as const;

export type AmpMode = (typeof AMP_MODES)[number]["id"];

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
  /** Amfinin kullanım şekli (amfi / monitör / önünde / 4 kablo) */
  ampMode: AmpMode;
  guitar: string;
  pickups: string;
  /** Her satıra bir pedal */
  pedals: string;
}

export const DEFAULT_RIG: UserRig = {
  amp: "",
  processor: "",
  ampMode: "amp",
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
  for (const k of ["amp", "processor", "guitar", "pickups", "pedals"] as const) {
    if (typeof raw[k] === "string") rig[k] = raw[k] as string;
  }
  if (AMP_MODES.some((m) => m.id === raw.ampMode)) rig.ampMode = raw.ampMode as AmpMode;
  if (!raw.amp && !raw.processor && typeof raw.deviceId === "string") {
    const old = raw.deviceId === "custom" ? String(raw.customDevice ?? "") : (findDevice(raw.deviceId)?.name ?? "");
    const d = findDevice(raw.deviceId);
    if (d && (d.category === "modeler" || d.category === "multi-fx")) rig.processor = old;
    else rig.amp = old;
  }
  return rig;
}
