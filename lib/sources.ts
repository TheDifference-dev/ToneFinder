// Araştırmada öncelik verilecek siteler. Yapay zekâ önce bunlara bakar,
// gerekirse forumlar, röportajlar ve üretici kılavuzlarıyla tamamlar.
// Yeni site eklemek için listeye bir kayıt eklemen yeterli.

export interface PreferredSource {
  name: string;
  url: string;
  use: string;
}

export const PREFERRED_SOURCES: PreferredSource[] = [
  { name: "Equipboard", url: "https://equipboard.com", use: "sanatçıların kullandığı ekipman listeleri" },
  { name: "GuitarGeek", url: "https://www.guitargeek.com", use: "sanatçı rig diyagramları ve sinyal zinciri" },
  { name: "The Gear Page", url: "https://www.thegearpage.net", use: "ton ve ekipman forumu" },
  { name: "Ultimate Guitar", url: "https://www.ultimate-guitar.com", use: "şarkı bazlı ton tartışmaları" },
  { name: "Reddit r/guitarpedals, r/Guitar", url: "https://www.reddit.com/r/guitarpedals", use: "forum tartışmaları" },
  { name: "Premier Guitar Rig Rundown", url: "https://www.premierguitar.com/gear/rig-rundown", use: "sanatçıların sahne/stüdyo rig videoları ve dökümleri" },
  { name: "Guitar World", url: "https://www.guitarworld.com", use: "röportajlar, kayıt hikâyeleri" },
  { name: "Tunebat", url: "https://tunebat.com", use: "şarkının BPM ve tonalitesi (delay senkronu için)" },
];
