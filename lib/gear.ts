// Kullanıcının seçebileceği amfi / modelleyici / multi-efekt cihazları.
// `controls` alanı, yapay zekânın ayarları cihazın gerçek düğme adlarıyla
// vermesi için ipucu olarak prompt'a eklenir.

export type DeviceCategory = "modeler" | "modeling-amp" | "tube-amp" | "multi-fx";

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  controls: string;
}

export const DEVICES: Device[] = [
  { id: "boss-katana-gen3", name: "Boss Katana Gen 3", category: "modeling-amp", controls: "Amp Type (Acoustic/Clean/Pushed/Crunch/Lead/Brown + Variation), Gain, Volume, Bass, Middle, Treble, Booster/Mod/FX/Delay/Reverb knobs, Tone Studio parameters" },
  { id: "boss-katana-mk2", name: "Boss Katana MkII", category: "modeling-amp", controls: "Amp Type (Acoustic/Clean/Crunch/Lead/Brown + Variation), Gain, Volume, Bass, Middle, Treble, Booster/Mod, FX, Delay/FX2, Reverb" },
  { id: "fender-mustang-lt", name: "Fender Mustang LT25 / LT40S / LT50", category: "modeling-amp", controls: "Amp model, Gain, Volume, Treble, Middle, Bass, Stomp/Mod/Delay/Reverb slots via Fender Tone" },
  { id: "fender-mustang-gtx", name: "Fender Mustang GTX", category: "modeling-amp", controls: "Amp model, Gain, Volume, Treble, Middle, Bass, Presence, effect slots" },
  { id: "spark", name: "Positive Grid Spark 40 / Spark 2 / Spark MINI", category: "modeling-amp", controls: "Gate, Comp/Wah, Drive, Amp (Gain, Bass, Mid, Treble, Master), Mod/EQ, Delay, Reverb" },
  { id: "yamaha-thr-ii", name: "Yamaha THR10II / THR30II", category: "modeling-amp", controls: "Amp type (Clean/Crunch/Lead/Hi Gain/Special/Bass/Acoustic/Flat), Gain, Master, Bass, Middle, Treble, Effect (Chorus/Flanger/Phaser/Tremolo), Echo/Reverb" },
  { id: "vox-valvetronix", name: "Vox Valvetronix VT / VX serisi", category: "modeling-amp", controls: "Amp model, Gain, Treble, Middle, Bass, Volume, Effect select, Delay/Reverb" },
  { id: "nux-mighty", name: "NUX Mighty serisi", category: "modeling-amp", controls: "Amp model, Gain, Master, Bass, Mid, Treble, Mod, Delay, Reverb" },
  { id: "line6-helix", name: "Line 6 Helix / Helix LT / Floor", category: "modeler", controls: "Amp blocks (Drive, Bass, Mid, Treble, Ch Vol, Presence, Master, Sag, Bias), Cab/IR blocks, any effect block" },
  { id: "line6-hx-stomp", name: "Line 6 HX Stomp / HX Stomp XL", category: "modeler", controls: "Same blocks as Helix, 6–8 block limit" },
  { id: "line6-pod-go", name: "Line 6 POD Go", category: "modeler", controls: "Helix amp/cab models, 4 flexible effect blocks + fixed blocks" },
  { id: "quad-cortex", name: "Neural DSP Quad Cortex", category: "modeler", controls: "Amp captures/models (Gain, Bass, Mid, Treble, Presence, Master), Cab/IR, effect blocks" },
  { id: "fractal-fm3", name: "Fractal Audio Axe-Fx III / FM3 / FM9", category: "modeler", controls: "Amp block (Input Drive, Bass, Mid, Treble, Master, Presence, Depth), Cab block, effects" },
  { id: "kemper", name: "Kemper Profiler", category: "modeler", controls: "Profile, Gain, Bass, Middle, Treble, Presence, Definition, Clarity, Stomps A–D, X, Mod, Delay, Reverb" },
  { id: "headrush", name: "HeadRush Pedalboard / MX5 / Prime", category: "modeler", controls: "Amp model, Gain, Bass, Mid, Treble, Presence, Master, Cab/IR, effect blocks" },
  { id: "boss-gx", name: "Boss GX-100 / GT-1000 / GT-1", category: "multi-fx", controls: "Preamp type, Gain, Bass, Middle, Treble, Presence, Level, FX1/FX2, Delay, Reverb" },
  { id: "zoom", name: "Zoom G1X Four / G3n / G5n / G6", category: "multi-fx", controls: "Amp model (Gain, Tube, Bass, Middle, Treble, Presence, Level), effect chain" },
  { id: "mooer-ge", name: "Mooer GE150 / GE200 / GE300", category: "multi-fx", controls: "Amp model (Gain, Bass, Mid, Treble, Presence, Master), Cab, FX/DS/Mod/Delay/Reverb" },
  { id: "marshall-tube", name: "Marshall lambalı amfi (JCM800 / DSL / JVM)", category: "tube-amp", controls: "Channel, Gain, Bass, Middle, Treble, Presence, Resonance (if any), Master" },
  { id: "fender-tube", name: "Fender lambalı amfi (Blues Junior / Deluxe / Twin)", category: "tube-amp", controls: "Volume, Treble, Bass, Middle, Reverb, Fat/Bright switch" },
  { id: "vox-ac30", name: "Vox AC30 / AC15", category: "tube-amp", controls: "Channel (Normal/Top Boost), Volume, Treble, Bass, Tone Cut, Reverb, Tremolo, Master" },
  { id: "orange-tube", name: "Orange (Rockerverb / Tiny Terror / Crush)", category: "tube-amp", controls: "Gain, Bass, Middle, Treble, Volume, Shape (if any), Reverb" },
  { id: "mesa-tube", name: "Mesa/Boogie (Mark / Rectifier)", category: "tube-amp", controls: "Channel/Mode, Gain, Treble, Mid, Bass, Presence, Master, Graphic EQ (Mark)" },
];

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
  { id: "rhythm", label: "Ritim" },
  { id: "lead", label: "Solo" },
  { id: "intro", label: "Giriş / Riff" },
  { id: "clean", label: "Temiz bölüm" },
  { id: "full", label: "Genel ton" },
];

export interface UserRig {
  deviceId: string;
  customDevice: string;
  guitar: string;
  pickups: string;
  pedals: string;
}

export const DEFAULT_RIG: UserRig = {
  deviceId: "boss-katana-gen3",
  customDevice: "",
  guitar: "",
  pickups: "HSS",
  pedals: "",
};

export function findDevice(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}
