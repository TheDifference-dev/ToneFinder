// Gitar sinyal zinciri sırası. Hem orijinal stüdyo ekipmanını hem kullanıcıya uyarlanmış zinciri
// aynı kurala göre sıralar; yapay zekâ pedalları yanlış sırada yazsa bile ekranda doğru görünür.
//
// Temel kural (gitardan hoparlöre), Sweetwater / Guitar Player / Hughes & Kettner rehberlerine göre:
//   Gitar → (vintage fuzz: Fuzz Face, Tone Bender — gitarın manyetiğini görmek ister, en başa)
//   → Tuner → Wah / filtre → Kompresör → Pitch / octave / synth → Boost / Overdrive / Distortion / Fuzz
//   → EQ → Noise gate → Volume pedalı → Modülasyon (chorus, phaser, flanger, vibe, tremolo)
//   → AMFİ (preamp) → [efekt döngüsü: modülasyon, delay, reverb] → Kabin → Mikrofon
//   → Amfi sonrası modülasyon / harmonizer (rack) → Delay → Reverb → Looper
// Delay ve reverb HER ZAMAN amfiden sonra gelir (efekt döngüsünde, prosesörde amfi/kabin bloğundan sonra
// ya da stüdyoda kayıttan sonra). Distorsiyonu amfiden alan tonlarda modülasyon da efekt döngüsüne gider.

export type Stage =
  | "guitar"
  | "fuzzfirst"
  | "tuner"
  | "filter"
  | "comp"
  | "pitch"
  | "drive"
  | "eq"
  | "gate"
  | "volume"
  | "mod"
  | "amp"
  | "cab"
  | "mic"
  | "post"
  | "delay"
  | "reverb"
  | "looper";

export const STAGE_ORDER: Stage[] = ["guitar", "fuzzfirst", "tuner", "filter", "comp", "pitch", "drive", "eq", "gate", "volume", "mod", "amp", "cab", "mic", "post", "delay", "reverb", "looper"];

/** Amfiden sonra gelen aşamalar */
export const POST_AMP: ReadonlySet<Stage> = new Set(["cab", "mic", "post", "delay", "reverb", "looper"]);

/** Açıklamada efekt döngüsü/stüdyo sonrası geçiyorsa modülasyon, EQ ve kompresör de amfiden sonraya gider */
const POST_HINT = /\b(effects? loop|fx loop|loop|send|return|post[- ]?(amp|production|processing)?|mix(ing|down)?|studio|console|desk|rack|plug-?in|mastering)\b|efekt döngü|döngü|stüdyo|miks|kayıttan sonra|amfi sonrası/i;

function matchStage(t: string, post: boolean): Stage | null {
  if (/looper|ditto|rc-?\d0/.test(t)) return "looper";
  if (/fuzz face|tone ?bender|germanium|fuzz factory|maestro fz|fz-1|supa ?fuzz/.test(t)) return "fuzzfirst";
  if (/volume pedal|expression|ev-?30|fv-?\d|ernie ball vp|swell/.test(t)) return "volume";
  if (/wireless|kablosuz|schaffer|switch(ing|er)|anahtarlama/.test(t)) return "tuner";
  if (/leslie|rotary|dönen hoparlör/.test(t)) return post ? "post" : "mod";
  if (/\bwah\b|cry ?baby|envelope|auto-?wah|talk ?box|mu-?tron/.test(t)) return "filter";
  // Adında "Reverb" geçen amfiler (Twin Reverb, Deluxe Reverb…) amfidir
  if (/(twin|deluxe|super|princeton|vibrolux|pro|concert)[ -]?reverb|vibroverb|vibro-?king|bassman|\bamp\b|amfi|amplifier|preamp|\bhead\b|kafa|combo|plexi|jcm|\bdsl\b|recto|dual rectifier|\bmark (i|ii|iii|iv|v)\b|\bac(15|30)\b|5150|super lead|\bjtm/.test(t)) return "amp";
  if (/room mic|\bmic(rophone)?s?\b|mikrofon|sm ?57|md ?421|r-?121|u ?87|royer|ribbon/.test(t)) return "mic";
  if (/reverb|\bverb\b|spring tank|\bplate\b|\bhall\b|\broom\b|chamber|yankı/.test(t)) return "reverb";
  if (/delay|echo|echoplex|memory man|\bdd-?\d|\bdm-?\d|carbon copy|timeline|slapback|gecikme/.test(t)) return "delay";
  if (/h3000|h949|eventide|tc ?(electronic )?2290|\brack\b/.test(t)) return "post";
  if (/\bcab(inet)?s?\b|kabin|\bir\b|impulse|speaker|hoparlör|\d ?x ?1[02]\b|greenback|vintage ?30|\bv30\b|celestion|jensen/.test(t)) return "cab";
  if (/tuner|akort cihaz/.test(t)) return "tuner";
  if (/\bfilter\b/.test(t)) return "filter";
  if (/\bcomp(ressor)?\b|dyna ?comp|sustainer|la-?2a|1176|limiter/.test(t)) return post ? "post" : "comp";
  if (/whammy|octav|pitch|harmoni[sz]er|\bpog\b/.test(t)) return "pitch";
  if (/noise ?gate|\bgate\b|decimator|suppressor|\bns-?2\b|noise reduction/.test(t)) return "gate";
  if (/chorus|flang|phase|phaser|vibe|trem(olo)?|rotary|leslie|vibrato|ensemble|modulation|modülasyon/.test(t)) return post ? "post" : "mod";
  if (/\beq\b|equali[sz]er|graphic|ekolayzer/.test(t)) return post ? "post" : "eq";
  if (/overdrive|distortion|fuzz|boost|drive|screamer|klon|muff|\bds-?1\b|\brat\b|treble booster|rangemaster/.test(t)) return "drive";
  if (/\b(guitar|gitar|bass|bas)\b/.test(t)) return "guitar";
  return null;
}

/**
 * Bir bloğun zincirdeki aşaması. Önce asıl ada (pedal modeli ya da blok türü) bakılır, bulunamazsa açıklamaya.
 * pedal=true: fiziksel pedal/efekt listesinden geliyor; amfi/kabin/gitar sayılmaz.
 */
export function stageOf(text: string, detail = "", pedal = false): Stage {
  const post = POST_HINT.test(`${text} ${detail}`);
  let s = matchStage(text.toLowerCase(), post) ?? matchStage(`${text} ${detail}`.toLowerCase(), post) ?? "drive";
  if (pedal && (s === "amp" || s === "cab" || s === "mic" || s === "guitar")) {
    s = matchStage(detail.toLowerCase().replace(/\b(amp|amfi|amplifier|head|combo)\b/g, ""), post) ?? "drive";
    if (s === "amp" || s === "cab" || s === "mic" || s === "guitar") s = "drive";
  }
  return s;
}

/** Kararlı sıralama: aynı aşamadakiler yapay zekânın verdiği sırayı korur */
/** "Yok", "None", "Pedal yok" gibi pedal olmayan kayıtlar */
export function isNoGear(model: string): boolean {
  return /^\s*(yok|none|no |pedal yok|-)|\b(pedal yok|yok \(|belirgin [^)]*yok)/i.test(model);
}

export function sortChain<T>(items: T[], stage: (item: T) => Stage): T[] {
  return items
    .map((item, i) => ({ item, i, s: STAGE_ORDER.indexOf(stage(item)) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.item);
}

/** Yapay zekâ talimatlarına eklenen sinyal zinciri kuralları */
export const SIGNAL_CHAIN_RULES = `Signal chain order (follow it strictly, from guitar to speaker):
1. Guitar → vintage fuzz (Fuzz Face, Tone Bender, germanium fuzz: first, so it sees the pickups; with a wah in front it needs a buffer) → tuner → wah / envelope filter → compressor → pitch/octave/synth (Whammy, octaver: they track best on a clean signal) → boost / overdrive / distortion / fuzz → EQ pedal → noise gate → volume pedal → modulation in front of the amp (chorus, phaser, flanger, Uni-Vibe, tremolo).
2. Amp (preamp). If the distortion comes from the amp itself (high gain channel), modulation, delay and reverb go in the amp's effects loop (FX send → effects → FX return, between preamp and power amp). With a processor/amp-sim (AmpliTube, Helix, HeadRush) they go after the amp and cab blocks; the four-cable method puts drives before the amp input and time effects in the loop.
3. Cab → microphone(s).
4. After the amp only: rack/studio processing (harmonizer such as Eventide H3000, studio compression), then DELAY, then REVERB, then looper. Delay and reverb ALWAYS come after the amp and after any distortion (in the effects loop, after the amp/cab block in a modeler, or added in the studio after recording) — never in front of the amp's preamp or a drive pedal, even if a vintage echo unit was historically placed there; if so, mention that only as a note.
List pedals and effects in this order and say for each whether it sits in front of the amp, in the effects loop, or was added in the studio/mix.`;
