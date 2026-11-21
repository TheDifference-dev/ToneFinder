import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Grup kütüphanesi: ünlü 100 grup/sanatçı ve her birinin en popüler 20 şarkısı
// (scripts/build-library.mjs ile Deezer'dan üretilir). Arama önce buraya bakar, sonra internete.

export interface LibrarySong {
  title: string;
  album: string;
  artwork: string;
}

export interface LibraryArtist {
  name: string;
  deezerId: number;
  picture: string;
  fans: number;
  /** world: dünya, tr: Türkçe rock */
  region: "world" | "tr";
  songs: LibrarySong[];
}

let cache: LibraryArtist[] | null = null;

export function libraryArtists(): LibraryArtist[] {
  if (!cache) {
    try {
      cache = (JSON.parse(readFileSync(join(process.cwd(), "data", "library", "artists.json"), "utf8")) as { artists: LibraryArtist[] }).artists;
    } catch {
      cache = [];
    }
  }
  return cache;
}

/** Türkçe karakterleri ve süslemeleri (KoЯn, Mötley Crüe) yok sayan karşılaştırma anahtarı */
export const normName = (t: string) =>
  t
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/я/g, "r")
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^the /, "")
    .trim();

export function findLibraryArtist(name: string, id = 0): LibraryArtist | null {
  const n = normName(name);
  return libraryArtists().find((a) => (id > 0 && a.deezerId === id) || normName(a.name) === n) ?? null;
}

/** Yazılana uyan kütüphane sanatçıları ve şarkıları */
export function searchLibrary(q: string): { artists: LibraryArtist[]; songs: (LibrarySong & { artist: string })[] } {
  const n = normName(q);
  if (n.length < 2) return { artists: [], songs: [] };
  const all = libraryArtists();
  const artists = all
    .filter((a) => {
      const an = normName(a.name);
      return an.startsWith(n) || an.split(" ").some((w) => w.length > 2 && w.startsWith(n)) || (n.length > 3 && n.startsWith(an));
    })
    .sort((a, b) => Number(normName(b.name) === n) - Number(normName(a.name) === n) || b.fans - a.fans)
    .slice(0, 3);
  const songs: (LibrarySong & { artist: string })[] = [];
  for (const a of all) {
    for (const s of a.songs) {
      const sn = normName(s.title);
      const full = `${sn} ${normName(a.name)}`;
      if (sn.startsWith(n) || (n.length > 3 && (sn.includes(n) || full.includes(n)))) songs.push({ ...s, artist: a.name });
    }
  }
  return { artists, songs: songs.slice(0, 5) };
}
