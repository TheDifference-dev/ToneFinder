// Pedal kataloğu: yaygın pedalların türü, panelindeki düğme ve anahtar adları ve ses karakteri.
// Yapay zekâ, kullanıcının pedalı için ayar verirken yalnız bu düğmeleri kullanır (rakiplerde en çok
// şikâyet edilen "ayarsız pedal önerisi" ve "olmayan düğme" sorununa karşı).
// Düğme adları üreticilerin panel yazılarından; her biri ayrıca kılavuzla tek tek kontrol edilmedi.

export type PedalType =
  | "overdrive"
  | "distortion"
  | "fuzz"
  | "boost"
  | "compressor"
  | "wah"
  | "chorus"
  | "flanger"
  | "phaser"
  | "vibe"
  | "tremolo"
  | "delay"
  | "reverb"
  | "octave"
  | "pitch"
  | "eq"
  | "gate"
  | "multi";

export interface Pedal {
  brand: string;
  model: string;
  type: PedalType;
  /** Paneldeki düğmeler, soldan sağa yaklaşık sırayla */
  controls: string[];
  /** Anahtarlar ve modlar */
  switches?: string[];
  character: string;
  match: RegExp;
}

export const PEDAL_TYPES: Record<PedalType, string> = {
  overdrive: "Overdrive",
  distortion: "Distorsiyon",
  fuzz: "Fuzz",
  boost: "Boost",
  compressor: "Kompresör",
  wah: "Wah",
  chorus: "Chorus",
  flanger: "Flanger",
  phaser: "Phaser",
  vibe: "Uni-Vibe",
  tremolo: "Tremolo",
  delay: "Delay",
  reverb: "Reverb",
  octave: "Octave",
  pitch: "Pitch / Whammy",
  eq: "EQ",
  gate: "Noise gate",
  multi: "Çok amaçlı",
};

export const PEDALS: Pedal[] = [
  // Overdrive
  { brand: "Ibanez", model: "TS9 Tube Screamer", type: "overdrive", controls: ["Drive", "Tone", "Level"], character: "Orta frekans tümseği, alt frekansı sıkılaştırır; lambalı amfiyi itmek için boost olarak klasik (Drive düşük, Level yüksek).", match: /\bts ?9\b|tube ?screamer(?!.*(mini|808))/i },
  { brand: "Ibanez", model: "TS808 Tube Screamer", type: "overdrive", controls: ["Overdrive", "Tone", "Level"], character: "TS9'a göre biraz daha yumuşak ve sıcak; aynı orta tümseği.", match: /\bts ?808\b|808/i },
  { brand: "Ibanez", model: "TS Mini", type: "overdrive", controls: ["Overdrive", "Tone", "Level"], character: "TS808 devresinin küçük sürümü.", match: /ts ?mini/i },
  { brand: "Boss", model: "SD-1 Super OverDrive", type: "overdrive", controls: ["Level", "Tone", "Drive"], character: "Asimetrik kırpma, Tube Screamer'a yakın orta tümseği; metal amfi önünde sıkılaştırıcı.", match: /\bsd-?1\b|super ?overdrive/i },
  { brand: "Boss", model: "BD-2 Blues Driver", type: "overdrive", controls: ["Level", "Tone", "Gain"], character: "Şeffaf, dinamik, amfi gibi açılan overdrive; düşük gain'de temiz-kirli sınırı.", match: /\bbd-?2\b|blues ?driver/i },
  { brand: "Boss", model: "OD-3 OverDrive", type: "overdrive", controls: ["Level", "Tone", "Drive"], character: "Daha dolgun alt frekanslı, daha fazla gain'li overdrive.", match: /\bod-?3\b/i },
  { brand: "Boss", model: "OD-1X", type: "overdrive", controls: ["Level", "Low", "High", "Drive"], character: "Modern, dengeli overdrive; ayrı Low/High EQ.", match: /\bod-?1x\b/i },
  { brand: "Fulltone", model: "OCD", type: "overdrive", controls: ["Volume", "Drive", "Tone"], switches: ["HP / LP"], character: "Amfi benzeri, geniş aralıklı overdrive/distorsiyon; HP daha çok gain ve parlaklık.", match: /\bocd\b/i },
  { brand: "Klon / Electronic Audio Experiments", model: "Klon Centaur / KTR", type: "overdrive", controls: ["Gain", "Treble", "Output"], character: "Şeffaf boost-overdrive; düşük gain'de temiz sinyal karışımı korunur.", match: /klon|centaur|\bktr\b/i },
  { brand: "Wampler", model: "Tumnus", type: "overdrive", controls: ["Volume", "Treble", "Gain"], character: "Klon tarzı şeffaf overdrive, küçük kasa.", match: /tumnus/i },
  { brand: "MXR", model: "Distortion+ (M104)", type: "overdrive", controls: ["Output", "Distortion"], character: "Germanyum diyotlu, sert ve orta frekanslı kirli ton (Randy Rhoads).", match: /distortion ?\+|distortion plus|m104/i },
  { brand: "Electro-Harmonix", model: "Soul Food", type: "overdrive", controls: ["Volume", "Treble", "Drive"], character: "Klon tarzı şeffaf overdrive, uygun fiyatlı.", match: /soul ?food/i },
  { brand: "Marshall", model: "Guv'nor", type: "overdrive", controls: ["Gain", "Bass", "Middle", "Treble", "Volume"], character: "Kutudaki Marshall: crunch'tan distorsiyona, 3 bantlı EQ.", match: /guv'?nor/i },
  // Distortion
  { brand: "Boss", model: "DS-1 Distortion", type: "distortion", controls: ["Tone", "Level", "Dist"], character: "Parlak, sert distorsiyon; Tone düşük tutulunca daha yumuşak (Satriani, Cobain).", match: /\bds-?1\b/i },
  { brand: "Boss", model: "DS-2 Turbo Distortion", type: "distortion", controls: ["Level", "Tone", "Dist"], switches: ["Mode I / II (Turbo)"], character: "DS-1'e Turbo modu eklenmiş, Mode II orta frekansı öne çıkarır (Frusciante).", match: /\bds-?2\b|turbo ?distortion/i },
  { brand: "ProCo", model: "RAT 2", type: "distortion", controls: ["Distortion", "Filter", "Volume"], character: "Op-amp distorsiyon, fuzz'a yakın; Filter saat yönünde koyulaştırır (ters tone).", match: /\brat\b/i },
  { brand: "Boss", model: "MT-2 Metal Zone", type: "distortion", controls: ["Level", "Dist", "High", "Low", "Middle", "Mid Freq"], character: "Yüksek gain, parametrik orta; EQ ince ayar ister.", match: /\bmt-?2\b|metal ?zone/i },
  { brand: "Boss", model: "HM-2 Heavy Metal", type: "distortion", controls: ["Level", "Low", "High", "Dist"], character: "İsveç death metal 'testere' tonu (Low ve High tam açık).", match: /\bhm-?2\b|heavy ?metal/i },
  { brand: "MXR", model: "Super Badass Distortion", type: "distortion", controls: ["Output", "Bass", "Mid", "Treble", "Distortion"], character: "Marshall tarzı, 3 bantlı EQ'lu modern distorsiyon.", match: /badass/i },
  // Fuzz
  { brand: "Electro-Harmonix", model: "Big Muff Pi", type: "fuzz", controls: ["Volume", "Tone", "Sustain"], character: "Kalın, sürdürülen fuzz, orta frekans oyuk (Gilmour, Smashing Pumpkins).", match: /big ?muff/i },
  { brand: "Dunlop", model: "Fuzz Face", type: "fuzz", controls: ["Volume", "Fuzz"], character: "Gitar volume'üne çok duyarlı, volume kısılınca temizlenir (Hendrix); gitara doğrudan bağlanmalı.", match: /fuzz ?face/i },
  { brand: "Zvex", model: "Fuzz Factory", type: "fuzz", controls: ["Vol", "Gate", "Comp", "Drive", "Stab"], character: "Aşırı, osilasyonlu, gate'li fuzz.", match: /fuzz ?factory/i },
  { brand: "Dallas / Dunlop", model: "Rangemaster Treble Booster", type: "boost", controls: ["Boost"], character: "Tiz ve orta tizi yükselten germanyum booster (Brian May, Iommi, Clapton Beano).", match: /rangemaster|treble ?boost/i },
  // Boost
  { brand: "MXR", model: "Micro Amp (M133)", type: "boost", controls: ["Gain"], character: "Temiz, düz frekanslı boost.", match: /micro ?amp|m133/i },
  { brand: "Xotic", model: "EP Booster", type: "boost", controls: ["Boost"], switches: ["İç DIP: Bright, +3 dB"], character: "Echoplex preamp tabanlı, hafif parlak ve dolgun boost.", match: /ep ?booster/i },
  { brand: "TC Electronic", model: "Spark Booster", type: "boost", controls: ["Level", "Gain", "Bass", "Treble"], switches: ["Fat / Clean / Mid"], character: "EQ'lu temiz/kirli boost.", match: /spark ?booster/i },
  // Compressor
  { brand: "MXR", model: "Dyna Comp (M102)", type: "compressor", controls: ["Output", "Sensitivity"], character: "Klasik country/funk sıkıştırması, attack'ı kırpar.", match: /dyna ?comp|m102/i },
  { brand: "Boss", model: "CS-3 Compression Sustainer", type: "compressor", controls: ["Level", "Tone", "Attack", "Sustain"], character: "Ayarlanabilir attack ve tone'lu kompresör.", match: /\bcs-?3\b/i },
  { brand: "Keeley", model: "Compressor Plus", type: "compressor", controls: ["Level", "Sustain", "Blend", "Tone"], switches: ["Single Coil / Humbucker"], character: "Blend ile paralel sıkıştırma, şeffaf.", match: /keeley.*comp/i },
  // Wah
  { brand: "Dunlop", model: "Cry Baby GCB95", type: "wah", controls: ["Pedal (topuk-uç)"], character: "Klasik wah; yarım açık 'cocked wah' tonu için sabit konumda bırakılabilir.", match: /cry ?baby(?!.*(mini|535))|gcb-?95/i },
  { brand: "Dunlop", model: "Cry Baby 535Q", type: "wah", controls: ["Pedal", "Q", "Volume boost"], switches: ["6 konumlu aralık seçici"], character: "Ayarlanabilir aralık ve Q'lu wah.", match: /535q?/i },
  { brand: "Dunlop", model: "Cry Baby Mini", type: "wah", controls: ["Pedal"], switches: ["Low / Mid / Vintage"], character: "Küçük kasa, 3 voicing.", match: /cry ?baby ?mini/i },
  { brand: "Vox", model: "V847 Wah", type: "wah", controls: ["Pedal"], character: "Klasik Vox wah, daha vokal ve yumuşak tepe.", match: /v ?847|v ?846|vox.*wah/i },
  // Modulation
  { brand: "Boss", model: "CE-2W Chorus", type: "chorus", controls: ["Rate", "Depth"], switches: ["Standard / CE-1 Chorus / CE-1 Vibrato"], character: "Sıcak analog chorus (80'ler temiz tonları).", match: /\bce-?2/i },
  { brand: "Electro-Harmonix", model: "Small Clone", type: "chorus", controls: ["Rate"], switches: ["Depth (iki konum)"], character: "Derin, sulu chorus (Cobain 'Come As You Are').", match: /small ?clone/i },
  { brand: "Boss", model: "CH-1 Super Chorus", type: "chorus", controls: ["E.Level", "EQ", "Rate", "Depth"], character: "Parlak, net stereo chorus.", match: /\bch-?1\b/i },
  { brand: "MXR", model: "Phase 90 (M101)", type: "phaser", controls: ["Speed"], character: "Tek düğmeli klasik phaser (Van Halen).", match: /phase ?90|m101/i },
  { brand: "Electro-Harmonix", model: "Small Stone", type: "phaser", controls: ["Rate"], switches: ["Color"], character: "Daha geniş, sulu phaser.", match: /small ?stone/i },
  { brand: "Electro-Harmonix", model: "Electric Mistress", type: "flanger", controls: ["Rate", "Range", "Color"], switches: ["Filter Matrix"], character: "Klasik flanger (Andy Summers, Gilmour).", match: /electric ?mistress/i },
  { brand: "MXR", model: "Flanger (M117R)", type: "flanger", controls: ["Manual", "Width", "Speed", "Regen"], character: "Jet uçağı flanger (Van Halen 'Unchained').", match: /m117|mxr.*flanger/i },
  { brand: "Boss", model: "BF-3 Flanger", type: "flanger", controls: ["Manual", "Res", "Depth", "Rate"], switches: ["Standard / Ultra / Gate-Pan / Momentary"], character: "Çok modlu flanger.", match: /\bbf-?[23]\b/i },
  { brand: "Dunlop", model: "Uni-Vibe UV1SC", type: "vibe", controls: ["Volume", "Intensity", "Speed (pedal)"], switches: ["Chorus / Vibrato"], character: "Hendrix ve Trower'ın titreşen faz tonu.", match: /uni-?vibe/i },
  { brand: "Boss", model: "TR-2 Tremolo", type: "tremolo", controls: ["Rate", "Wave", "Depth"], character: "Klasik amfi tremolosu.", match: /\btr-?2\b/i },
  // Delay
  { brand: "Boss", model: "DD-3 Digital Delay", type: "delay", controls: ["E.Level", "F.Back", "D.Time"], switches: ["Mode: 50 / 200 / 800 ms, Hold"], character: "Temiz dijital delay (Slash).", match: /\bdd-?3/i },
  { brand: "Boss", model: "DD-8 Digital Delay", type: "delay", controls: ["E.Level", "F.Back", "D.Time", "Mode"], switches: ["Tap tempo (harici/basılı tutma)"], character: "11 modlu delay: Standard, Analog, Tape, Shimmer, Reverse, Looper...", match: /\bdd-?8/i },
  { brand: "Boss", model: "DD-7 / DD-200 / DD-500", type: "delay", controls: ["E.Level", "F.Back", "D.Time", "Mode"], character: "Çok modlu Boss delay'leri.", match: /\bdd-?(7|200|500)\b/i },
  { brand: "MXR", model: "Carbon Copy", type: "delay", controls: ["Regen", "Mix", "Delay"], switches: ["Mod (iç: Width, Rate)"], character: "Sıcak bucket-brigade analog delay, 600 ms'ye kadar.", match: /carbon ?copy/i },
  { brand: "Electro-Harmonix", model: "Memory Man", type: "delay", controls: ["Level", "Blend", "Feedback", "Delay"], switches: ["Chorus / Vibrato"], character: "Modülasyonlu analog delay (The Edge).", match: /memory ?man/i },
  { brand: "TC Electronic", model: "Flashback 2", type: "delay", controls: ["Delay", "Feedback", "FX Level", "Mode"], switches: ["Tap / MASH, TonePrint"], character: "Çok modlu dijital delay.", match: /flashback/i },
  { brand: "Strymon", model: "Timeline", type: "delay", controls: ["Value", "Time", "Repeats", "Mix", "Filter", "Grit", "Speed", "Depth"], character: "12 delay makinesi, preset kaydı.", match: /timeline/i },
  // Reverb
  { brand: "Boss", model: "RV-6 Reverb", type: "reverb", controls: ["E.Level", "Tone", "Time", "Mode"], character: "Room, Hall, Plate, Spring, Modulate, Dynamic, Shimmer, +Delay modları.", match: /\brv-?6/i },
  { brand: "Electro-Harmonix", model: "Holy Grail", type: "reverb", controls: ["Reverb"], switches: ["Spring / Hall / Flerb"], character: "Tek düğmeli, sade reverb.", match: /holy ?grail/i },
  { brand: "TC Electronic", model: "Hall of Fame 2", type: "reverb", controls: ["Decay", "Tone", "FX Level", "Mode"], switches: ["Short / Long, TonePrint"], character: "Çok modlu reverb.", match: /hall ?of ?fame/i },
  { brand: "Strymon", model: "BigSky", type: "reverb", controls: ["Value", "Decay", "Pre-Delay", "Mix", "Tone", "Param 1", "Param 2"], character: "12 reverb makinesi.", match: /big ?sky/i },
  // Pitch / octave
  { brand: "DigiTech", model: "Whammy (5. nesil / DT / Ricochet)", type: "pitch", controls: ["Pedal", "Mod seçici (aralık)"], switches: ["Classic / Chords"], character: "Pitch-shift pedalı (Morello, Dimebag, Jack White).", match: /whammy/i },
  { brand: "Boss", model: "OC-5 Octave", type: "octave", controls: ["Direct Level", "Oct 1 Level", "Oct 2 Level", "Range"], switches: ["Vintage / Poly"], character: "Alt oktav ekler.", match: /\boc-?[235]\b/i },
  // EQ / gate
  { brand: "Boss", model: "GE-7 Equalizer", type: "eq", controls: ["100", "200", "400", "800", "1.6k", "3.2k", "6.4k (Hz)", "Level"], character: "7 bant grafik EQ; ±15 dB sürgüler.", match: /\bge-?7\b/i },
  { brand: "MXR", model: "10 Band EQ (M108)", type: "eq", controls: ["31.25", "62.5", "125", "250", "500", "1k", "2k", "4k", "8k", "16k (Hz)", "Volume", "Gain"], character: "10 bant grafik EQ.", match: /10 ?band ?eq|m108/i },
  { brand: "Boss", model: "NS-2 Noise Suppressor", type: "gate", controls: ["Threshold", "Decay"], switches: ["Mode: Reduction / Mute"], character: "Gürültü bastırıcı; 4 kablo yöntemiyle amfinin FX loop'unda da çalışır.", match: /\bns-?2\b|noise ?suppressor/i },
  { brand: "ISP", model: "Decimator", type: "gate", controls: ["Threshold"], character: "Hızlı ve şeffaf noise gate; yüksek gain için.", match: /decimator/i },
];

/** Kullanıcının yazdığı pedal adını katalogdaki bir pedala bağla */
export function matchPedal(text: string): Pedal | undefined {
  const t = text.trim();
  if (!t) return undefined;
  return PEDALS.find((p) => p.match.test(t));
}

export function pedalProfileText(p: Pedal): string {
  return [
    `${p.brand} ${p.model} (${PEDAL_TYPES[p.type]})`,
    `Controls: ${p.controls.join(", ")}`,
    ...(p.switches ? [`Switches/modes: ${p.switches.join("; ")}`] : []),
    `Character: ${p.character}`,
  ].join("\n");
}

export const PEDAL_NAMES = PEDALS.map((p) => `${p.brand} ${p.model}`);
