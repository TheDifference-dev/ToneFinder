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
];
