// Gitar kataloğu: markaların ton karakteri, manyetik türlerinin profili, seçici (switch)
// konumları ve popüler modeller. Yapay zekâ, orijinal kayıttaki gitar ile kullanıcının
// gitarı arasındaki farkı (ör. Les Paul humbucker → Strat single-coil) bu bilgilerle telafi eder.

export type PickupLayout = "SSS" | "HSS" | "HH" | "SS" | "P90" | "HSH" | "active" | "HS" | "FT";

/** Manyetik türlerinin genel ses profili */
export const PICKUP_TYPES: Record<string, string> = {
  "single-coil":
    "Düşük–orta çıkış, parlak ve net, belirgin tiz ve 'quack'; dinamik ve temiz tonda çok canlı. 60 Hz uğultu yapar (noise gate gerekebilir). Humbucker tonuna yaklaşmak için: gain +1–2, mid artır, treble/presence azalt, önüne boost/overdrive, gitarın tone knob'u 7–8.",
  humbucker:
    "Orta–yüksek çıkış, kalın, sıcak, orta frekansı dolu; uğultusuz. Distorsiyonu daha erken ve yoğun sürer. Single-coil tonuna yaklaşmak için: gain azalt, treble/presence artır, mid azalt; coil-split varsa kullan.",
  "P-90":
    "Single-coil tasarımı ama daha geniş bobin: humbucker ile single-coil arası, ham, hırıltılı orta frekans; biraz uğultu yapar.",
  "mini-humbucker": "Humbucker'dan daha parlak ve odaklı, single-coil'den kalın (ör. Les Paul Deluxe).",
  "Filter'Tron": "Gretsch humbucker'ı; düşük çıkış, parlak, cıngıl, açık; rockabilly ve indie.",
  active:
    "Aktif (EMG, Fishman Fluence) manyetikler: yüksek ve sabit çıkış, sıkıştırılmış, çok sessiz, sıkı alt frekans; modern metal. Pasif gitarla bu tona yaklaşmak için: gain artır, önüne Tube Screamer (drive 0–2, level yüksek), noise gate.",
};

/** Manyetik dizilimine göre seçici konumları (gitarın üstünden alta / köprüden sapa) */
export const SELECTOR_POSITIONS: Record<string, string> = {
  SSS: "5'li seçici: 1 = köprü, 2 = köprü+orta, 3 = orta, 4 = orta+sap, 5 = sap. 2 ve 4 uğultusuz ve 'quack'lı.",
  HSS: "5'li seçici: 1 = köprü humbucker, 2 = köprü (çoğunda split)+orta, 3 = orta, 4 = orta+sap, 5 = sap.",
  HH: "3'lü toggle: Rhythm (yukarı) = sap, orta = ikisi birden, Treble (aşağı) = köprü. Les Paul'de her manyetiğin ayrı volume ve tone'u var.",
  SS: "3'lü seçici (Telecaster): köprü, ikisi birden, sap.",
  P90: "3'lü toggle (iki P-90) ya da tek P-90 (Junior).",
  HSH: "5'li seçici: 1 = köprü humbucker, 2 = köprü iç bobin+orta, 3 = orta, 4 = orta+sap iç bobin, 5 = sap humbucker (Ibanez RG/Jackson'da değişebilir).",
  active: "Çoğunlukla 3'lü toggle (sap / ikisi / köprü); metal lead ve ritim için köprü.",
};

export interface GuitarBrand {
  brand: string;
  character: string;
}

export const GUITAR_BRANDS: GuitarBrand[] = [
  { brand: "Fender", character: "Akçaağaç sap, 25.5\" ölçek, bolt-on sap: parlak, net, 'twang'; Strat ve Tele single-coil dünyası." },
  { brand: "Squier", character: "Fender'ın uygun fiyatlı markası; aynı tasarımlar, daha düşük çıkışlı/ucuz manyetikler." },
  { brand: "Gibson", character: "Maun gövde, 24.75\" ölçek, set-neck: sıcak, kalın, uzun sustain; humbucker ve P-90 dünyası." },
  { brand: "Epiphone", character: "Gibson'ın uygun fiyatlı markası; Les Paul/SG/ES-335 tasarımları, ProBucker humbucker'lar." },
  { brand: "Ibanez", character: "İnce, hızlı saplar, genelde 25.5\" ölçek; RG/S serisinde HSH ve yüksek çıkışlı humbucker'lar, Floyd Rose; shred ve metal." },
  { brand: "PRS", character: "25\" ölçek, maun/akçaağaç; Fender ile Gibson arası, dengeli ve net; coil-split seçenekleri." },
  { brand: "ESP / LTD", character: "Metal odaklı; EMG ve Seymour Duncan aktif/pasif humbucker'lar, sıkı alt frekans (Metallica, James Hetfield, Kirk Hammett modelleri)." },
  { brand: "Jackson", character: "Superstrat ve 'pointy' gövdeler; yüksek çıkışlı humbucker, Floyd Rose; 80'ler shred ve metal." },
  { brand: "Schecter", character: "Modern metal ve hard rock; aktif EMG/Fishman ya da yüksek çıkışlı pasif humbucker, 7 ve 8 telli modeller." },
  { brand: "Gretsch", character: "Hollow/semi-hollow gövdeler, Filter'Tron humbucker'lar, Bigsby; rockabilly, country, indie." },
  { brand: "Yamaha", character: "Pacifica serisi: HSS Strat tarzı, çok yönlü ve uygun fiyatlı; Revstar: humbucker/P-90, sıcak." },
];

export interface GuitarModel {
  brand: string;
  model: string;
  match: RegExp;
  pickups: PickupLayout;
  pickupDetail: string;
  /** Ton karakteri (Türkçe) */
  tone: string;
}

export const GUITARS: GuitarModel[] = [
  // Fender / Squier
  { brand: "Fender", model: "Stratocaster (Player, American, Vintera)", match: /strat(?!.*hss)/i, pickups: "SSS", pickupDetail: "3 Alnico single-coil, 5'li seçici, 2 tone (orta ve sap)", tone: "Parlak, cam gibi temiz, ara konumlarda 'quack'; blues, funk, klasik rock (Hendrix, Gilmour, Clapton, SRV)." },
  { brand: "Fender", model: "Stratocaster HSS (Player HSS, Fat Strat)", match: /strat.*hss|fat ?strat/i, pickups: "HSS", pickupDetail: "Köprüde humbucker, orta ve sapta single-coil", tone: "Köprüde kalın rock/lead, diğer konumlarda klasik Strat." },
  { brand: "Fender", model: "Telecaster", match: /tele/i, pickups: "SS", pickupDetail: "Köprüde eğik single-coil (metal plaka), sapta kapaklı single-coil", tone: "Köprü manyetiği keskin ve 'twang'lı, sap sıcak ve yumuşak; country, indie, rock (Keith Richards, Jimmy Page'in ilk albümü)." },
  { brand: "Fender", model: "Jazzmaster / Jaguar", match: /jazzmaster|jaguar/i, pickups: "SS", pickupDetail: "Geniş, yassı single-coil'ler", tone: "Yumuşak, yuvarlak, P-90'a yakın; shoegaze, surf, indie." },
  { brand: "Fender", model: "Mustang / Duo-Sonic", match: /fender mustang|duo-?sonic/i, pickups: "SS", pickupDetail: "2 single-coil, kısa ölçek (24\")", tone: "Parlak, hafif; grunge ve indie (Kurt Cobain)." },
  { brand: "Squier", model: "Classic Vibe / Affinity Stratocaster", match: /squier.*strat|affinity|classic vibe/i, pickups: "SSS", pickupDetail: "3 seramik ya da alnico single-coil", tone: "Strat karakteri, Fender'dan biraz daha düşük çıkış ve daha az detay." },

  // Gibson / Epiphone
  { brand: "Gibson", model: "Les Paul Standard / Custom / Studio", match: /les ?paul(?!.*(junior|jr|special))/i, pickups: "HH", pickupDetail: "2 humbucker (Burstbucker / '57 Classic / 490R-498T), her manyetiğe ayrı volume ve tone, 3'lü toggle", tone: "Kalın, sıcak, orta frekanslı, uzun sustain; klasik rock ve hard rock (Jimmy Page, Slash, Gary Moore, Zakk Wylde)." },
  { brand: "Gibson", model: "Les Paul Junior / Special", match: /les ?paul.*(junior|jr|special)|lp ?jr/i, pickups: "P90", pickupDetail: "1 ya da 2 P-90", tone: "Ham, hırıltılı, orta frekanslı; punk ve garage rock." },
  { brand: "Gibson", model: "SG Standard", match: /\bsg\b/i, pickups: "HH", pickupDetail: "2 humbucker (490R/498T ya da '61 Zebra)", tone: "Les Paul'den daha hafif ve açık, orta frekanslı ısırık; AC/DC (Angus Young), Tony Iommi." },
  { brand: "Gibson", model: "ES-335 / ES-339", match: /es-?33[59]|semi.?hollow/i, pickups: "HH", pickupDetail: "2 humbucker, yarı-akustik gövde", tone: "Sıcak, havalı, yuvarlak; blues ve jazz (B.B. King tarzı ES-355, Larry Carlton)." },
  { brand: "Gibson", model: "Explorer / Flying V / Firebird", match: /explorer|flying ?v|firebird/i, pickups: "HH", pickupDetail: "2 humbucker (Firebird: mini humbucker)", tone: "Explorer/V: kalın hard rock ve metal (James Hetfield'ın Explorer'ları); Firebird: daha parlak ve keskin." },
  { brand: "Epiphone", model: "Les Paul Standard / Custom / Studio", match: /epiphone.*les ?paul/i, pickups: "HH", pickupDetail: "2 humbucker (ProBucker / Alnico Classic), 3'lü toggle", tone: "Les Paul karakteri; Gibson'a göre biraz daha az detay ve sustain." },
  { brand: "Epiphone", model: "SG / ES-335 / Casino", match: /epiphone.*(sg|335|casino)/i, pickups: "HH", pickupDetail: "SG/335: 2 humbucker; Casino: 2 P-90 (hollow)", tone: "Casino: The Beatles'ın hollow P-90 sesi; diğerleri Gibson eşdeğerine yakın." },

  // Ibanez
  { brand: "Ibanez", model: "RG serisi (RG550, RG421, RG Prestige)", match: /\brg ?\d|ibanez rg/i, pickups: "HSH", pickupDetail: "HSH ya da HH, yüksek çıkışlı humbucker (V7/V8, DiMarzio), çoğunda Edge/Floyd köprü", tone: "Sıkı, modern, yüksek gain'e uygun; shred ve metal (Steve Vai, Paul Gilbert ilk dönem)." },
  { brand: "Ibanez", model: "S serisi", match: /ibanez s ?\d|ibanez s\b/i, pickups: "HH", pickupDetail: "Genelde HH ya da HSH, ince maun gövde", tone: "RG'den biraz daha sıcak, hızlı ve çok yönlü rock/metal." },
  { brand: "Ibanez", model: "AZ / AZES", match: /\baz(es)? ?\d|ibanez az/i, pickups: "HSS", pickupDetail: "HSS, Seymour Duncan Hyperion (AZ Prestige), dyna-MIX9 anahtar sistemi", tone: "Modern superstrat; temizde Strat'a yakın, köprüde dolu humbucker." },
  { brand: "Ibanez", model: "JEM / PIA (Steve Vai)", match: /\bjem|\bpia\b/i, pickups: "HSH", pickupDetail: "DiMarzio Evolution / UtoPIA, HSH", tone: "Steve Vai imza sesi: parlak, vokal gibi lead." },

  // PRS
  { brand: "PRS", model: "Silver Sky (John Mayer)", match: /silver ?sky/i, pickups: "SSS", pickupDetail: "3 single-coil (635JM)", tone: "Vintage Strat tonuna yakın, daha sıcak orta." },
  { brand: "PRS", model: "Custom 24 / SE Custom 24", match: /custom ?24|prs/i, pickups: "HH", pickupDetail: "2 humbucker (85/15), coil-split (push/pull ya da mini toggle), 5'li seçici (Core)", tone: "Dengeli, net, Fender ile Gibson arası; split ile single-coil'e yakın seçenekler." },

  // ESP / LTD
  { brand: "ESP / LTD", model: "EC-1000 / EC-256 (Eclipse)", match: /\bec-?\d+|eclipse/i, pickups: "active", pickupDetail: "EC-1000: EMG 81/60 aktif ya da Seymour Duncan; EC-256: ESP pasif humbucker", tone: "Les Paul tarzı gövde, modern metal/hard rock tonu; aktif modellerde sıkı ve sıkıştırılmış." },
  { brand: "ESP / LTD", model: "James Hetfield (Snakebyte, Iron Cross, Vulture)", match: /snakebyte|iron cross|vulture|hetfield/i, pickups: "active", pickupDetail: "EMG JH Het Set (aktif)", tone: "Metallica ritim tonu: sıkı, kalın alt, çok sessiz." },
  { brand: "ESP / LTD", model: "Kirk Hammett (KH-2, KH-602, Ouija)", match: /\bkh-?\d+|ouija|hammett/i, pickups: "active", pickupDetail: "EMG KH20/KH21 ya da EMG 81/60 (aktif), Floyd Rose", tone: "Metallica lead tonu: aktif humbucker, wah ile kullanılır." },
  { brand: "ESP / LTD", model: "M / Horizon / MH serisi", match: /\bmh-?\d+|horizon|ltd m-?\d/i, pickups: "HH", pickupDetail: "HH, EMG ya da Seymour Duncan/Fishman", tone: "Superstrat metal gitarı; yüksek gain'e uygun." },

  // Jackson
  { brand: "Jackson", model: "Soloist / Dinky", match: /soloist|dinky/i, pickups: "HSH", pickupDetail: "HH ya da HSH, yüksek çıkışlı Seymour Duncan / Jackson humbucker, Floyd Rose", tone: "80'ler shred ve thrash; sıkı, parlak lead." },
  { brand: "Jackson", model: "Rhoads / Kelly / King V", match: /rhoads|kelly|king ?v/i, pickups: "HH", pickupDetail: "2 humbucker (aktif ya da pasif)", tone: "Randy Rhoads ve thrash metal; agresif, yüksek gain." },

  // Schecter
  { brand: "Schecter", model: "Hellraiser / C-1 / Omen", match: /hellraiser|schecter|omen|\bc-1\b/i, pickups: "active", pickupDetail: "Hellraiser: EMG 81/89 ya da Fishman Fluence (aktif); Omen: pasif humbucker", tone: "Modern metal ve metalcore; sıkı, yüksek çıkış." },

  // Gretsch
  { brand: "Gretsch", model: "Electromatic / Players Edition (G5420, G6120)", match: /gretsch|g5420|g6120|electromatic/i, pickups: "FT", pickupDetail: "2 Filter'Tron humbucker, hollow/semi-hollow gövde, Bigsby", tone: "Parlak, cıngıl, havalı; rockabilly (Brian Setzer), country, AC/DC'de Malcolm Young'ın Jet'i." },

  // Yamaha
  { brand: "Yamaha", model: "Pacifica 112V / 612", match: /pacifica/i, pickups: "HSS", pickupDetail: "Köprüde humbucker, 2 single-coil (612: Seymour Duncan)", tone: "Çok yönlü Strat tarzı; temizde parlak, köprüde dolu rock tonu." },
  { brand: "Yamaha", model: "Revstar", match: /revstar/i, pickups: "HH", pickupDetail: "2 humbucker ya da P-90 (modele göre), 'Dry Switch'", tone: "Sıcak, orta frekanslı rock; Dry Switch tiz netlik ekler." },
];

/** Gitar adını katalogdaki bir modele bağla (marka önce, sonra genel tasarım) */
export function matchGuitar(text: string): GuitarModel | undefined {
  const t = text.trim();
  if (!t) return undefined;
  // "Epiphone Les Paul" gibi markaya özel kayıtlar genel tasarımdan (Gibson Les Paul) önce gelsin
  const branded = GUITARS.filter((g) => t.toLowerCase().includes(g.brand.split(" ")[0].toLowerCase()));
  return branded.find((g) => g.match.test(t)) ?? GUITARS.find((g) => g.match.test(t));
}

export function guitarProfileText(g: GuitarModel): string {
  const brand = GUITAR_BRANDS.find((b) => b.brand === g.brand);
  return [
    `${g.brand} ${g.model}: ${g.pickupDetail}.`,
    `Tone: ${g.tone}`,
    brand ? `Brand character: ${brand.character}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Manyetik dizilimine göre tür profili ve seçici konumları */
export function pickupLayoutText(layout: string): string {
  const types =
    layout === "SSS" || layout === "SS"
      ? ["single-coil"]
      : layout === "HH"
        ? ["humbucker"]
        : layout === "HSS" || layout === "HSH" || layout === "HS"
          ? ["humbucker", "single-coil"]
          : layout === "P90"
            ? ["P-90"]
            : layout === "active"
              ? ["active"]
              : layout === "FT"
                ? ["Filter'Tron"]
                : [];
  return [
    ...types.map((t) => `- ${t}: ${PICKUP_TYPES[t]}`),
    SELECTOR_POSITIONS[layout] ? `- Selector: ${SELECTOR_POSITIONS[layout]}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Öneri listesi için "Marka Model" adları */
export const GUITAR_NAMES = GUITARS.map((g) => `${g.brand} ${g.model}`);

/** Gitar adından tipik manyetik dizilimini tahmin et (kullanıcı değiştirebilir) */
export function guessPickups(guitar: string): string | undefined {
  const g = guitar.toLowerCase();
  if (/emg|fishman|active|aktif/.test(g)) return "active";
  if (/\bhss\b/.test(g)) return "HSS";
  if (/\bhsh\b/.test(g)) return "HSH";
  if (/\bhh\b/.test(g)) return "HH";
  if (/p-?90/.test(g)) return "P90";
  return matchGuitar(guitar)?.pickups;
}
