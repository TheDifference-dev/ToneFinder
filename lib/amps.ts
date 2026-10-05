// Amfi kataloğu: popüler markaların güncel serileri ve ton tarihinde önemli klasik modeller.
// Her model için kanallar, modlar, ön panel kontrolleri, karakter ve (mümkünse) monitör /
// stereo kullanım notu. Yapay zekâ kullanıcının amfisini bu profil üzerinden ayarlar.
//
// Kaynaklar: üretici kılavuzları ve ürün sayfaları (Boss DUAL CUBE LX Owner's Manual,
// BOSS TONE STUDIO for KATANA Gen3, Mesa Multi-Watt Rectifier kılavuzu, Fender/Vox/Marshall/
// Orange/Blackstar/EVH ürün sayfaları) ve bayi/inceleme sayfaları. `verified: true` olanlar
// doğrudan üretici kılavuzundan kontrol edildi.

export type AmpType = "tube" | "solid-state" | "modeling" | "hybrid";

export interface AmpChannel {
  name: string;
  /** Kanal içindeki modlar / ses tipleri */
  modes?: string[];
  controls: string[];
}

export interface AmpModel {
  id: string;
  brand: string;
  model: string;
  match: RegExp;
  type: AmpType;
  channels: AmpChannel[];
  /** Tüm kanalları etkileyen kontroller ve anahtarlar */
  global?: string[];
  /** Efekt döngüsü, stereo giriş, line out, güç azaltma vb. */
  features?: string[];
  /** Ses karakteri (Türkçe) */
  voicing: string;
  /** Prosesör/modelleyici ile monitör (FRFR) gibi kullanım notu */
  monitor?: string;
  verified?: boolean;
}

export const AMPS: AmpModel[] = [
  // ---------------- BOSS / ROLAND ----------------
  {
    id: "boss-dual-cube-lx",
    brand: "Boss",
    model: "Dual Cube LX",
    match: /dual ?cube ?lx|dual ?cube/i,
    type: "modeling",
    verified: true,
    channels: [
      {
        name: "AMP TYPE",
        modes: [
          "ACOUSTIC SIM (elektro gitarı akustik gibi)",
          "JC CLEAN (Roland JC-120)",
          "US COMBO (Fender Deluxe Reverb)",
          "BRIT COMBO (Vox AC-30TB)",
          "HI-GAIN STACK (Marshall 1959, I ve II girişleri paralel)",
          "METAL STACK (Peavey EVH 5150 lead kanalı)",
          "EXTREME (Mesa/Boogie Dual Rectifier Ch2 Modern)",
          "MIC (mikrofon)",
          "STEREO IN (stereo çıkışlı multi-efekt/prosesör girişi)",
        ],
        controls: ["GAIN", "VOLUME (EQ ve efektlerden önceki seviye)", "BASS", "MIDDLE", "TREBLE"],
      },
    ],
    global: [
      "EFFECTS knob: OFF, CHORUS, FLANGER, PHASER, TREMOLO, HEAVY OCTAVE",
      "DELAY/REVERB knob: OFF, DELAY, REVERB, SPRING; TAP butonu (delay süresi)",
      "MEMORY (her amp type için 3 hafıza)",
      "MIC VOL",
      "MASTER",
    ],
    features: [
      "10 W stereo (5 W + 5 W), 2 x 4\" hoparlör",
      "GUITAR/STEREO IN L, R girişleri; sadece L bağlanırsa yalnız sol taraf duyulur",
      "LINE OUT L/MONO, R; PHONES/REC OUT; i-CUBE LINK/AUX IN; USB ses arayüzü; looper",
    ],
    voicing:
      "Küçük, taşınabilir stereo modelleme amfisi. Sinyal yolu: giriş → preamp → EQ → efektler/delay/reverb → MASTER → stereo hoparlörler.",
    monitor:
      "Prosesörle monitör olarak: AMP TYPE = STEREO IN, prosesörün L ve R çıkışlarını iki kabloyla bağla. Kılavuzdaki blok şemasına göre EQ ve efektler bu girişte de sinyal yolunda: BASS/MIDDLE/TREBLE saat 12 (düz), EFFECTS = OFF, DELAY/REVERB = OFF; seviyeyi VOLUME ve MASTER ile ayarla. Prosesörde kabin/IR simülasyonu AÇIK olmalı.",
  },
  {
    id: "boss-katana-gen3",
    brand: "Boss",
    model: "Katana Gen 3 (Mini, 50, 100, Artist, Head)",
    match: /katana.*(gen ?3|3rd|gen3)/i,
    type: "modeling",
    verified: true,
    channels: [
      {
        name: "AMP TYPE",
        modes: ["ACOUSTIC", "CLEAN", "PUSHED", "CRUNCH", "LEAD", "BROWN", "her biri için VARIATION"],
        controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE"],
      },
    ],
    global: [
      "BOOSTER/MOD, DELAY/FX, REVERB knob'ları (her biri 3 renkli varyasyon)",
      "PRESENCE ve tüm efekt parametreleri BOSS TONE STUDIO'da (Booster DRIVE 0–120, TONE −50…+50)",
      "MASTER, POWER CONTROL",
    ],
    features: ["POWER AMP IN girişi (Gen 3)", "LINE OUT AIR FEEL (REC/LIVE/BLEND)", "USB ses arayüzü"],
    voicing: "BOSS'un kendi Tube Logic amfi sesleri; CLEAN temiz/Fender tarzı, CRUNCH İngiliz crunch, LEAD yüksek gain, BROWN 'brown sound' (EVH tarzı).",
    monitor: "Prosesörle: POWER AMP IN girişi preamp'i atlar (prosesörde kabin simülasyonu kapalı ya da açık, kulağa göre). Normal girişte ACOUSTIC/CLEAN ve düz EQ.",
  },
  {
    id: "boss-katana-mk2",
    brand: "Boss",
    model: "Katana MkII (50, 100, Head, Artist)",
    match: /katana/i,
    type: "modeling",
    channels: [
      {
        name: "AMP TYPE",
        modes: ["ACOUSTIC", "CLEAN", "CRUNCH", "LEAD", "BROWN", "her biri için VARIATION"],
        controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE"],
      },
    ],
    global: ["BOOSTER/MOD, FX, DELAY/FX2, REVERB knob'ları (3 renk)", "PRESENCE (BOSS TONE STUDIO)", "MASTER, POWER CONTROL"],
    features: ["Efekt döngüsü (50 hariç modeller)", "Line out", "USB"],
    voicing: "Gen 3'ten önceki Katana; PUSHED tipi yok. Ses tipleri BOSS'un kendi tasarımı.",
    monitor: "Prosesörle: ACOUSTIC ya da CLEAN tipi, düz EQ, efektler kapalı; efekt döngüsü olan modellerde prosesör RETURN'e bağlanabilir.",
  },
  {
    id: "boss-cube-street-2",
    brand: "Boss",
    model: "Cube Street II",
    match: /cube ?street/i,
    type: "modeling",
    channels: [
      {
        name: "Guitar/Mic kanalı AMP TYPE",
        modes: ["NORMAL", "BRIGHT", "WIDE", "INSTRUMENT", "CLEAN", "CRUNCH", "LEAD", "ACOUSTIC SIM", "MIC"],
        controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "EFFECTS", "REVERB"],
      },
    ],
    features: ["Stereo, pille çalışır", "Mikrofon/enstrüman kanalları"],
    voicing: "Sokak performansı için stereo amfi; gitar tipleri BOSS COSM.",
    monitor: "Prosesörle: INSTRUMENT ya da NORMAL tipi, düz EQ.",
  },
  {
    id: "boss-nextone",
    brand: "Boss",
    model: "Nextone Stage / Artist / Special",
    match: /nextone/i,
    type: "solid-state",
    channels: [{ name: "Amp", controls: ["GAIN", "BASS", "MIDDLE", "TREBLE", "PRESENCE", "VOLUME", "MASTER"] }],
    global: ["Power amp tipi: 6V6, 6L6, EL84, EL34 (Tube Logic)", "Booster, Delay/Reverb", "Nextone Editor'de Character Shape"],
    voicing: "Lamba güç katı davranışını taklit eden analog Tube Logic amfi; güç lambası tipi seçilebilir.",
  },
  {
    id: "roland-jc120",
    brand: "Roland",
    model: "JC-120 Jazz Chorus",
    match: /jc-?120|jazz chorus/i,
    type: "solid-state",
    channels: [
      { name: "Channel 1 (Normal)", controls: ["VOLUME", "TREBLE", "MIDDLE", "BASS", "BRIGHT switch"] },
      { name: "Channel 2 (Effect)", controls: ["VOLUME", "TREBLE", "MIDDLE", "BASS", "BRIGHT switch", "DISTORTION", "REVERB", "CHORUS/VIBRATO (SPEED, DEPTH)"] },
    ],
    voicing: "Çok temiz, parlak, yüksek headroom; stereo chorus'u efsanevi (80'ler temiz tonları). Pedal platformu olarak çok kullanılır.",
  },
  {
    id: "roland-blues-cube",
    brand: "Roland",
    model: "Blues Cube Hot / Stage / Artist",
    match: /blues ?cube/i,
    type: "solid-state",
    channels: [{ name: "Amp", modes: ["CLEAN", "CRUNCH"], controls: ["VOLUME", "BASS", "MIDDLE", "TREBLE", "PRESENCE", "REVERB", "BOOST"] }],
    voicing: "Tweed/blackface Fender tarzı lamba tepkisini taklit eden Tube Logic amfi.",
  },

  // ---------------- MARSHALL ----------------
  {
    id: "marshall-1959",
    brand: "Marshall",
    model: "1959 Super Lead Plexi / 1987X",
    match: /1959|1987x?|plexi|super lead/i,
    type: "tube",
    channels: [
      { name: "Normal (I)", controls: ["VOLUME I"] },
      { name: "High Treble (II)", controls: ["VOLUME II"] },
    ],
    global: ["PRESENCE", "BASS", "MIDDLE", "TREBLE", "Master volume yok", "Girişler 'jumper' ile birleştirilebilir"],
    voicing: "60'ların sonu–70'lerin klasik rock sesi (Hendrix, Page, Young); distorsiyon yüksek sesle güç lambalarından gelir.",
  },
  {
    id: "marshall-jtm45",
    brand: "Marshall",
    model: "JTM45",
    match: /jtm ?45/i,
    type: "tube",
    channels: [{ name: "Normal / Bright girişleri", controls: ["VOLUME (her kanal)"] }],
    global: ["PRESENCE", "BASS", "MIDDLE", "TREBLE"],
    voicing: "İlk Marshall; KT66/5881, sıcak, Bluesbreaker tarzı yuvarlak crunch.",
  },
  {
    id: "marshall-jcm800",
    brand: "Marshall",
    model: "JCM800 2203 / 2204 (ve Studio Classic SC20)",
    match: /jcm ?800|2203|2204|sc20|studio classic/i,
    type: "tube",
    channels: [{ name: "Tek kanal (HIGH / LOW giriş)", controls: ["PRE-AMP VOLUME (gain)", "MASTER VOLUME"] }],
    global: ["PRESENCE", "BASS", "MIDDLE", "TREBLE"],
    voicing: "80'lerin hard rock/metal sesi (Slash, Zakk Wylde, Kerry King); orta frekanslı, parlak, önüne Tube Screamer konunca sıkılaşır.",
  },
  {
    id: "marshall-2555x",
    brand: "Marshall",
    model: "Silver Jubilee 2555X",
    match: /jubilee|2555/i,
    type: "tube",
    channels: [{ name: "Lead / Rhythm (Rhythm Clip anahtarı)", controls: ["INPUT GAIN", "LEAD MASTER", "OUTPUT MASTER"] }],
    global: ["PRESENCE", "BASS", "MIDDLE", "TREBLE", "Yarım güç anahtarı"],
    voicing: "Diyot kırpmalı, sıkıştırılmış yüksek gain Marshall (Slash'in Appetite dönemi sahne amfisi, Joe Bonamassa).",
  },
  {
    id: "marshall-jvm410",
    brand: "Marshall",
    model: "JVM410H / JVM410C (ve JVM205/210)",
    match: /jvm/i,
    type: "tube",
    channels: [
      { name: "CLEAN", modes: ["Green", "Orange", "Red"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "REVERB"] },
      { name: "CRUNCH", modes: ["Green", "Orange", "Red"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "REVERB"] },
      { name: "OD1", modes: ["Green", "Orange", "Red"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "REVERB"] },
      { name: "OD2", modes: ["Green", "Orange", "Red"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "REVERB"] },
    ],
    global: ["2 MASTER VOLUME", "RESONANCE", "PRESENCE"],
    features: ["Seri/paralel efekt döngüleri"],
    voicing: "4 kanal x 3 mod = 12 ses; Green en az, Red en çok gain. Crunch Green ≈ Plexi, Crunch Orange/Red ≈ JCM800, OD kanalları modern yüksek gain.",
  },
  {
    id: "marshall-dsl",
    brand: "Marshall",
    model: "DSL40CR / DSL20CR / DSL100H / DSL1CR",
    match: /\bdsl/i,
    type: "tube",
    channels: [
      { name: "CLASSIC GAIN", modes: ["CLEAN", "CRUNCH"], controls: ["GAIN", "VOLUME", "REVERB (kanala özel)"] },
      { name: "ULTRA GAIN", modes: ["OD1", "OD2"], controls: ["GAIN", "VOLUME", "REVERB (kanala özel)"] },
    ],
    global: ["BASS", "MIDDLE", "TREBLE (ortak EQ)", "TONE SHIFT (orta frekansları oyar)", "PRESENCE", "RESONANCE"],
    features: ["Güç azaltma (40 → 20 W)", "Efekt döngüsü"],
    voicing: "JCM2000 DSL'nin devamı; Crunch'ta klasik Marshall, OD1/OD2'de modern rock/metal. Tone Shift metal için orta frekansı keser.",
  },
  {
    id: "marshall-origin",
    brand: "Marshall",
    model: "Origin 5 / 20 / 50",
    match: /origin/i,
    type: "tube",
    channels: [{ name: "Tek kanal (GAIN BOOST push/pull ya da footswitch)", controls: ["GAIN", "TILT (normal ↔ bright giriş karışımı)", "BASS", "MIDDLE", "TREBLE", "MASTER", "PRESENCE"] }],
    global: ["POWERSTEM güç seviyesi: High (20 W) / Mid (5 W) / Low (0.5 W)"],
    features: ["Efekt döngüsü"],
    voicing: "Plexi/JTM tarzı vintage Marshall; TILT, eski amfilerde girişleri köprülemenin yerini alır. Pedal platformu olarak çok iyi.",
  },
  {
    id: "marshall-mg-gold",
    brand: "Marshall",
    model: "MG Gold (MG10G, MG15GR, MG30GFX, MG50GFX, MG100GFX)",
    match: /\bmg ?\d+|mg ?gold/i,
    type: "solid-state",
    channels: [{ name: "Kanallar", modes: ["CLEAN", "CRUNCH", "OD1", "OD2"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "CONTOUR (OD kanalları)"] }],
    global: ["REVERB", "FX modellerinde dahili efektler (chorus, phaser, flanger, delay)"],
    voicing: "Transistörlü çalışma amfisi; temiz kanal iyi, distorsiyonlu kanallar daha 'fizz'li. Gerçek Marshall lamba sesinin kaba bir yorumu.",
  },
  {
    id: "marshall-code",
    brand: "Marshall",
    model: "CODE 25 / 50 / 100",
    match: /\bcode ?\d+/i,
    type: "modeling",
    channels: [{ name: "MST modelleme", modes: ["14 preamp", "4 power amp", "8 kabin modeli"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE"] }],
    global: ["Efektler: Pedal, Mod, Delay, Reverb", "Gateway uygulaması"],
    voicing: "Softube MST modelleme; JTM45, Plexi, JCM800, JCM2000, JVM gibi Marshall preamp modelleri.",
  },

  // ---------------- FENDER ----------------
  {
    id: "fender-deluxe-reverb",
    brand: "Fender",
    model: "'65 Deluxe Reverb / Tone Master Deluxe Reverb",
    match: /deluxe reverb/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME", "TREBLE", "BASS"] },
      { name: "VIBRATO", controls: ["VOLUME", "TREBLE", "BASS", "REVERB", "SPEED", "INTENSITY"] },
    ],
    features: ["Tone Master: 6 kademeli güç anahtarı, kabin simülasyonlu XLR çıkış"],
    voicing: "Blackface temiz ton; parlak, cam gibi temiz, sesi açınca güzel kırılır. Blues, country, pedal platformu.",
  },
  {
    id: "fender-twin-reverb",
    brand: "Fender",
    model: "'65 Twin Reverb / Tone Master Twin Reverb",
    match: /twin reverb|\btwin\b/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME", "TREBLE", "MIDDLE", "BASS", "BRIGHT switch"] },
      { name: "VIBRATO", controls: ["VOLUME", "TREBLE", "MIDDLE", "BASS", "BRIGHT switch", "REVERB", "SPEED", "INTENSITY"] },
    ],
    voicing: "Çok yüksek headroom'lu, kristal temiz Fender; neredeyse hiç kırılmaz, pedal platformu için ideal.",
  },
  {
    id: "fender-princeton",
    brand: "Fender",
    model: "'68 Custom Princeton Reverb / '65 Princeton Reverb",
    match: /princeton/i,
    type: "tube",
    channels: [{ name: "Tek kanal", controls: ["VOLUME", "TREBLE", "BASS", "REVERB", "SPEED", "INTENSITY"] }],
    voicing: "12 W, 10\" hoparlör; düşük seste erken ve tatlı kırılma, stüdyo kayıtlarında çok kullanılır.",
  },
  {
    id: "fender-bassman",
    brand: "Fender",
    model: "'59 Bassman (5F6-A)",
    match: /bassman/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME"] },
      { name: "BRIGHT", controls: ["VOLUME"] },
    ],
    global: ["PRESENCE", "MIDDLE", "BASS", "TREBLE", "Master yok; kanallar köprülenebilir"],
    voicing: "Tweed 4x10; kalın, sıcak kırılma. Marshall JTM45'in atası.",
  },
  {
    id: "fender-blues-junior",
    brand: "Fender",
    model: "Blues Junior IV",
    match: /blues jr|blues junior/i,
    type: "tube",
    channels: [{ name: "Tek kanal", controls: ["VOLUME (gain)", "TREBLE", "BASS", "MIDDLE", "MASTER", "REVERB", "FAT switch (orta/gain boost)"] }],
    voicing: "15 W EL84; sıcak, hafif kırılan temiz ton, blues ve pedal platformu.",
  },
  {
    id: "fender-hot-rod",
    brand: "Fender",
    model: "Hot Rod Deluxe IV / Hot Rod Deville",
    match: /hot rod/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME", "BRIGHT switch"] },
      { name: "DRIVE", modes: ["DRIVE", "MORE DRIVE"], controls: ["DRIVE", "DRIVE VOLUME"] },
    ],
    global: ["TREBLE", "BASS", "MIDDLE (ortak)", "MASTER", "PRESENCE", "REVERB"],
    features: ["Efekt döngüsü"],
    voicing: "Temiz kanalı çok iyi; overdrive kanalı sert, çoğu kişi temiz kanal + pedalla kullanır.",
  },
  {
    id: "fender-mustang-lt",
    brand: "Fender",
    model: "Mustang LT25 / LT40S / LT50",
    match: /mustang ?lt|lt ?(25|40|50)/i,
    type: "modeling",
    channels: [
      {
        name: "Amp modeli (preset'e kayıtlı)",
        modes: ["20 amp modeli, ör. '57 Deluxe, '59 Bassman, '65 Twin, '65 Deluxe, 60s UK Clean, 70s Rock, 80s Rock, 90s Rock, Excelsior, Metal 2000, Doom Metal, Alt Metal"],
        controls: ["GAIN", "VOLUME", "TREBLE", "MIDDLE", "BASS"],
      },
    ],
    global: ["MASTER", "25 efekt (Stomp, Mod, Delay, Reverb slotları)", "Fender Tone uygulaması"],
    voicing: "Fender'ın dijital modelleme serisi; preset tabanlı.",
  },
  {
    id: "fender-mustang-gtx",
    brand: "Fender",
    model: "Mustang GTX50 / GTX100 / GT40",
    match: /mustang/i,
    type: "modeling",
    channels: [{ name: "Amp modeli", controls: ["GAIN", "VOLUME", "TREBLE", "MIDDLE", "BASS", "PRESENCE"] }],
    global: ["MASTER", "efekt slotları", "Fender Tone"],
    voicing: "Mustang serisinin üst modeli; daha fazla amp/efekt modeli, efekt döngüsü (GTX100).",
  },
  {
    id: "fender-champion",
    brand: "Fender",
    model: "Champion 20 / 40 / 100, Champion II",
    match: /champion/i,
    type: "modeling",
    channels: [{ name: "VOICE seçici", modes: ["Tweed, Blackface, British, Metal, Jazz, Acoustic vb. sesler"], controls: ["GAIN", "VOLUME", "TREBLE", "BASS", "FX LEVEL", "FX TYPE"] }],
    voicing: "Giriş seviyesi modelleme amfisi; VOICE knob'u farklı amfi karakterleri seçer.",
  },
  {
    id: "fender-frontman",
    brand: "Fender",
    model: "Frontman 10G / 20G",
    match: /frontman/i,
    type: "solid-state",
    channels: [{ name: "Clean / Overdrive (buton)", controls: ["GAIN", "OVER DRIVE switch", "VOLUME", "TREBLE", "BASS"] }],
    voicing: "Başlangıç transistör amfisi; temiz kanal kullanılabilir, overdrive sınırlı. Ton için pedal önerilir.",
  },

  // ---------------- VOX ----------------
  {
    id: "vox-ac30",
    brand: "Vox",
    model: "AC30C2 / AC30S1 / AC30 Custom",
    match: /ac ?30/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME"] },
      { name: "TOP BOOST", controls: ["VOLUME", "TREBLE", "BASS (çok etkileşimli; treble artınca bass azalır)"] },
    ],
    global: ["TONE CUT (güç katında tiz keser; saat yönü = daha koyu)", "MASTER", "REVERB", "TREMOLO SPEED/DEPTH"],
    voicing: "EL84, A sınıfı 'chime'; parlak, cıngıl temiz ve yuvarlak crunch (The Beatles, Brian May, The Edge, Radiohead).",
  },
  {
    id: "vox-ac15",
    brand: "Vox",
    model: "AC15C1 / AC10C1 / AC4",
    match: /\bac ?(15|10|4)(?!\d)/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME"] },
      { name: "TOP BOOST", controls: ["VOLUME", "TREBLE", "BASS"] },
    ],
    global: ["TONE CUT", "MASTER", "REVERB", "TREMOLO"],
    voicing: "AC30'un küçük kardeşi; aynı chime karakter, daha erken kırılma.",
  },
  {
    id: "vox-valvetronix",
    brand: "Vox",
    model: "Valvetronix VT20X / VT40X / VT100X",
    match: /vt ?\d+x|valvetronix/i,
    type: "hybrid",
    channels: [
      {
        name: "AMP seçici",
        modes: ["DELUXE CL", "TWEED 4x10", "VOX AC30", "BOUTIQUE OD", "VOX AC30TB", "BRIT 800", "BRIT OR MKII", "DOUBLE REC", "BOUTIQUE CL", "BRIT 1959", "BOUTIQUE METAL"],
        controls: ["GAIN", "VOLUME", "TREBLE", "MIDDLE", "BASS"],
      },
    ],
    global: ["EFFECTS (mod), DELAY/REVERB", "POWER LEVEL", "Tone Room yazılımı"],
    voicing: "Nutube/lamba preamplı hibrit modelleme; 11 amp modeli (yazılımla 20).",
  },
  {
    id: "vox-pathfinder",
    brand: "Vox",
    model: "Pathfinder 10",
    match: /pathfinder/i,
    type: "solid-state",
    channels: [{ name: "Clean / Overdrive", controls: ["GAIN", "VOLUME", "TREBLE", "BASS"] }],
    voicing: "Küçük çalışma amfisi; basit temiz/overdrive.",
  },

  // ---------------- ORANGE ----------------
  {
    id: "orange-rockerverb",
    brand: "Orange",
    model: "Rockerverb 50 / 100 MkIII",
    match: /rockerverb/i,
    type: "tube",
    channels: [
      { name: "CLEAN", controls: ["VOLUME", "TREBLE", "BASS"] },
      { name: "DIRTY", controls: ["GAIN", "BASS", "MIDDLE", "TREBLE", "VOLUME"] },
    ],
    global: ["REVERB (lambalı spring)", "ATTENUATOR (footswitch ile bypass)", "Yarım güç (50 → 25 W)"],
    features: ["Efekt döngüsü"],
    voicing: "Kalın, orta frekansı bol İngiliz gain; stoner, doom, hard rock. Temiz kanal sıcak ve geniş.",
  },
  {
    id: "orange-terror",
    brand: "Orange",
    model: "Tiny Terror / Micro Terror / Dark Terror",
    match: /terror/i,
    type: "tube",
    channels: [{ name: "Tek kanal", controls: ["VOLUME", "TONE", "GAIN"] }],
    voicing: "Basit, kalın ve hamlı Orange crunch. Micro Terror hibrit (lamba preamp).",
  },
  {
    id: "orange-th30",
    brand: "Orange",
    model: "TH30 / TH100",
    match: /\bth ?(30|100)/i,
    type: "tube",
    channels: [
      { name: "CLEAN", controls: ["VOLUME", "BASS", "TREBLE"] },
      { name: "DIRTY", controls: ["GAIN", "BASS", "MIDDLE", "TREBLE", "VOLUME"] },
    ],
    global: ["Güç modu (Full/Half)"],
    voicing: "İki kanallı Orange; sıcak temiz ve yoğun, orta frekanslı distorsiyon.",
  },
  {
    id: "orange-or15",
    brand: "Orange",
    model: "OR15 / OR50 / Dual Terror",
    match: /\bor ?(15|50)|dual terror/i,
    type: "tube",
    channels: [{ name: "Tek kanal (Dual Terror: Bright ve Dark kanalları)", controls: ["GAIN", "BASS", "MIDDLE", "TREBLE", "VOLUME"] }],
    voicing: "Vintage Orange 'pics only' sesi; açık, ham crunch.",
  },
  {
    id: "orange-crush",
    brand: "Orange",
    model: "Crush 12 / 20RT / 35RT / Crush Pro",
    match: /crush/i,
    type: "solid-state",
    channels: [
      { name: "CLEAN", controls: ["VOLUME"] },
      { name: "DIRTY", controls: ["GAIN", "VOLUME"] },
    ],
    global: ["BASS", "MIDDLE", "TREBLE (ortak)", "REVERB", "Dahili tuner (RT modelleri)"],
    features: ["Kabin simülasyonlu kulaklık çıkışı", "Efekt döngüsü (35RT)"],
    voicing: "Transistörlü ama Orange karakterli; distorsiyon kanalı kalın ve orta frekanslı.",
  },

  // ---------------- MESA/BOOGIE ----------------
  {
    id: "mesa-mark-v",
    brand: "Mesa/Boogie",
    model: "Mark V (90 W / 35 / 25)",
    match: /mark ?v\b|mark ?five|mark ?5\b/i,
    type: "tube",
    channels: [
      { name: "Channel 1", modes: ["CLEAN", "FAT", "TWEED"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER", "NORMAL/BOLD switch"] },
      { name: "Channel 2", modes: ["EDGE", "CRUNCH", "MARK I"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER", "NORMAL/THICK (Mark I)"] },
      { name: "Channel 3", modes: ["MARK IIC+", "MARK IV", "EXTREME"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER", "NORMAL/BRIGHT", "PENTODE/TRIODE"] },
    ],
    global: ["5 bantlı grafik EQ (80, 240, 750, 2200, 6600 Hz; klasik 'V' şekli)", "Watt seçimi", "Reverb (kanal başına)"],
    features: ["Efekt döngüsü"],
    voicing: "Mark serisinin tamamı; Channel 3 IIC+ modu, 80'lerin Mark IIC+ lead sesi (thrash ve progresif metalde çok kullanıldı). Grafik EQ ile orta frekanslar oyulur.",
  },
  {
    id: "mesa-mark-iv",
    brand: "Mesa/Boogie",
    model: "Mark IV / Mark IIC+ (vintage)",
    match: /mark ?(iv|4|ii ?c|2c)/i,
    type: "tube",
    channels: [
      { name: "Rhythm 1", controls: ["VOLUME", "TREBLE", "BASS", "MIDDLE"] },
      { name: "Rhythm 2", controls: ["GAIN"] },
      { name: "Lead", controls: ["LEAD DRIVE", "LEAD MASTER", "LEAD TREBLE", "LEAD BASS"] },
    ],
    global: ["PRESENCE", "5 bantlı grafik EQ", "Simul-Class / Pentode-Triode"],
    voicing: "Sıkı, odaklı, uzun sustain'li Boogie lead; Metallica, Petrucci, Santana (Mark I).",
  },
  {
    id: "mesa-rectifier",
    brand: "Mesa/Boogie",
    model: "Dual / Triple Rectifier (Multi-Watt), Mini Rectifier",
    match: /rectifier|recto|mini rec/i,
    type: "tube",
    channels: [
      { name: "Channel 1", modes: ["CLEAN", "PUSHED"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER"] },
      { name: "Channel 2", modes: ["RAW", "VINTAGE", "MODERN"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER"] },
      { name: "Channel 3", modes: ["RAW", "VINTAGE", "MODERN"], controls: ["GAIN", "TREBLE", "MID", "BASS", "PRESENCE", "MASTER"] },
    ],
    global: ["Multi-Watt: kanal başına 50 / 100 W", "Rectifier seçimi (diyot / tüp)", "Bias seçimi (6L6/EL34)"],
    features: ["Efekt döngüsü"],
    voicing: "90'lar–2000'ler modern metal/nu-metal; Modern mod sıkı, ağır alt frekanslı ve tiz kenarlı; Vintage daha yumuşak, Raw daha açık ve dinamik. Mini Rectifier: Ch1 Clean/Pushed, Ch2 Vintage/Modern.",
  },

  // ---------------- PEAVEY / EVH ----------------
  {
    id: "peavey-6505",
    brand: "Peavey",
    model: "6505 / 6505+ / 6505 II / 5150 (orijinal)",
    match: /6505|peavey ?5150|5150 ?(ii|2)?$/i,
    type: "tube",
    channels: [
      { name: "RHYTHM", controls: ["PRE GAIN", "POST GAIN", "BRIGHT switch", "CRUNCH switch"] },
      { name: "LEAD", controls: ["PRE GAIN", "POST GAIN"] },
    ],
    global: ["LOW", "MID", "HIGH (ortak)", "PRESENCE", "RESONANCE", "HIGH / LOW GAIN girişleri"],
    voicing: "Metalcore/thrash standardı; Lead kanalı çok yüksek gain, önüne Tube Screamer (gain 0, level yüksek) ile sıkılaştırılır.",
  },
  {
    id: "peavey-classic30",
    brand: "Peavey",
    model: "Classic 30 / Classic 50",
    match: /classic ?(30|50)/i,
    type: "tube",
    channels: [
      { name: "NORMAL", controls: ["VOLUME", "BRIGHT"] },
      { name: "LEAD", controls: ["PRE GAIN", "POST GAIN"] },
    ],
    global: ["BASS", "MIDDLE", "TREBLE", "REVERB"],
    voicing: "EL84 Amerikan combo; temiz kanalı Fender'a yakın, blues/rock.",
  },
  {
    id: "evh-5150-iii",
    brand: "EVH",
    model: "5150III 50W 6L6 / EL34, 5150III 100W",
    match: /5150 ?iii|evh/i,
    type: "tube",
    channels: [
      { name: "Channel 1 CLEAN", controls: ["GAIN/VOLUME (çift eksenli)", "LOW", "MID", "HIGH (Ch1-2 ortak, 50W)"] },
      { name: "Channel 2 CRUNCH", controls: ["GAIN/VOLUME (çift eksenli)", "LOW", "MID", "HIGH (Ch1-2 ortak, 50W)"] },
      { name: "Channel 3 LEAD", controls: ["GAIN", "VOLUME", "LOW", "MID", "HIGH"] },
    ],
    global: ["PRESENCE", "RESONANCE (global)"],
    features: ["Efekt döngüsü"],
    voicing: "Eddie Van Halen'ın 'brown sound'unun modern hali; Lead kanalı sıkı, yüksek gain metal.",
  },

  // ---------------- BLACKSTAR ----------------
  {
    id: "blackstar-ht",
    brand: "Blackstar",
    model: "HT-5R MkIII / HT-20R / HT Club 40 MkIII",
    match: /\bht-?(5|20|club)/i,
    type: "tube",
    channels: [
      { name: "CLEAN", modes: ["American Clean", "British Clean"], controls: ["VOLUME", "TONE"] },
      { name: "OVERDRIVE", modes: ["Classic OD", "Modern OD"], controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE", "ISF"] },
    ],
    global: ["REVERB", "Güç azaltma (HT-5R: 0.5 W)"],
    features: ["Efekt döngüsü", "Kabin simülasyonlu çıkış"],
    voicing: "ISF knob'u EQ'yu Amerikan (sola, Fender/Mesa) ile İngiliz (sağa, Marshall) karakter arasında kaydırır.",
  },
  {
    id: "blackstar-idcore",
    brand: "Blackstar",
    model: "ID:Core V4 Stereo 10 / 20 / 40",
    match: /id ?: ?core|idcore/i,
    type: "modeling",
    channels: [
      {
        name: "VOICE",
        modes: ["CLEAN WARM", "CLEAN BRIGHT", "CRUNCH", "SUPER CRUNCH", "OD1", "OD2"],
        controls: ["GAIN", "VOLUME", "EQ", "ISF"],
      },
    ],
    global: ["MOD, DELAY, REVERB efektleri", "MASTER"],
    features: ["Stereo (2 hoparlör)", "USB ses arayüzü"],
    voicing: "Stereo çalışma amfisi; ISF ile Amerikan/İngiliz karakter.",
    monitor: "Prosesörle: CLEAN WARM, düz EQ, efektler kapalı.",
  },
  {
    id: "blackstar-st-james",
    brand: "Blackstar",
    model: "St. James 50 (6L6 / EL34)",
    match: /st\.? ?james/i,
    type: "tube",
    channels: [
      { name: "CLEAN", controls: ["VOLUME", "BASS", "MIDDLE", "TREBLE"] },
      { name: "OVERDRIVE", controls: ["GAIN", "VOLUME", "BASS", "MIDDLE", "TREBLE"] },
    ],
    global: ["PRESENCE", "RESONANCE", "Güç (50 W / 1 W)"],
    voicing: "Hafif, modern lamba amfisi; 6L6 Amerikan, EL34 İngiliz karakter.",
  },

  // ---------------- YAMAHA ----------------
  {
    id: "yamaha-thr",
    brand: "Yamaha",
    model: "THR10II / THR30II (Wireless)",
    match: /\bthr/i,
    type: "modeling",
    channels: [
      {
        name: "AMP",
        modes: ["CLEAN", "CRUNCH", "LEAD", "HI GAIN", "SPECIAL", "BASS", "ACOUSTIC", "FLAT"],
        controls: ["GAIN", "MASTER", "BASS", "MIDDLE", "TREBLE"],
      },
    ],
    global: ["EFFECT (Chorus/Flanger/Phaser/Tremolo)", "ECHO/REVERB", "Modern/Boutique/Classic amp kolleksiyonları"],
    features: ["Stereo", "USB, Bluetooth"],
    voicing: "Masaüstü stereo modelleme amfisi.",
    monitor: "Prosesörle: FLAT tipi, düz EQ, efektler kapalı.",
  },
];

/** Kullanıcının yazdığı amfi adını katalogdaki bir modele bağla */
export function matchAmp(text: string): AmpModel | undefined {
  const t = text.trim();
  if (!t || /^(yok|none|-)$/i.test(t)) return undefined;
  return AMPS.find((a) => a.match.test(t));
}

/** Yapay zekâya verilecek amfi profili (İngilizce/Türkçe karışık, kompakt) */
export function ampProfileText(a: AmpModel): string {
  const lines = [
    `${a.brand} ${a.model} (${a.type}${a.verified ? ", from the manufacturer's manual" : ""})`,
    ...a.channels.map(
      (c) => `- ${c.name}${c.modes ? `: modes ${c.modes.join(" / ")}` : ""}; controls ${c.controls.join(", ")}`,
    ),
  ];
  if (a.global?.length) lines.push(`- Global: ${a.global.join("; ")}`);
  if (a.features?.length) lines.push(`- Features: ${a.features.join("; ")}`);
  lines.push(`- Voicing: ${a.voicing}`);
  if (a.monitor) lines.push(`- As a monitor with a processor: ${a.monitor}`);
  return lines.join("\n");
}

/** Öneri listesi için "Marka Model" adları */
export const AMP_NAMES = AMPS.map((a) => `${a.brand} ${a.model}`);
