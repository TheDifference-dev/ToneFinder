import "server-only";

// Anahtarsız müzik araması: Deezer ve Apple iTunes Search API.
// Arama kutusu (/api/songs) ve grup sayfası (/api/artist) bunları kullanır.

export interface ArtistHit {
  /** Deezer sanatçı kimliği (yoksa 0) */
  id: number;
  name: string;
  picture: string;
  fans: number;
  /** Uygulamanın grup kütüphanesinde mi (100 grup × 20 şarkı) */
  inLibrary?: boolean;
}

export interface SongHit {
  title: string;
  artist: string;
  album: string;
  year: string;
  artwork: string;
}

interface ITunesTrack {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

interface DeezerArtist {
  id?: number;
  name?: string;
  picture_medium?: string;
  nb_fan?: number;
}

interface DeezerTrack {
  title?: string;
  rank?: number;
  artist?: { name?: string };
  album?: { title?: string; cover_medium?: string };
}

/** "Enter Sandman (Remastered 2021)" → "Enter Sandman"; canlı/remix gibi farklı kayıtlar korunur */
export const cleanTitle = (t: string) =>
  t
    .replace(/\s*[([](?:[^)\]]*\b(?:remaster(?:ed)?|mono|stereo|deluxe|bonus track|single version|album version)\b[^)\]]*)[)\]]/gi, "")
    .replace(/\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|mono|stereo|single version|album version)\b.*$/i, "")
    .trim();

export function dedupe(songs: SongHit[]): SongHit[] {
  songs = songs.map((s) => ({ ...s, title: cleanTitle(s.title) || s.title }));
  const seen = new Set<string>();
  return songs.filter((s) => {
    const id = `${s.title}|${s.artist}`.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export async function searchITunes(q: string): Promise<SongHit[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({ term: q, media: "music", entity: "song", limit: "10" }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const data = (await res.json()) as { results?: ITunesTrack[] };
  return (data.results ?? [])
    .filter((t) => t.trackName && t.artistName)
    .map((t) => ({
      title: t.trackName!,
      artist: t.artistName!,
      album: t.collectionName ?? "",
      year: t.releaseDate?.slice(0, 4) ?? "",
      artwork: t.artworkUrl100 ?? "",
    }));
}

export async function searchDeezer(q: string): Promise<SongHit[]> {
  const url = new URL("https://api.deezer.com/search");
  url.search = new URLSearchParams({ q, limit: "15" }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Deezer ${res.status}`);
  const data = (await res.json()) as { data?: DeezerTrack[] };
  return (data.data ?? [])
    .filter((t) => t.title && t.artist?.name)
    .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
    .map((t) => ({
      title: t.title!,
      artist: t.artist!.name!,
      album: t.album?.title ?? "",
      year: "",
      artwork: t.album?.cover_medium ?? "",
    }));
}

const norm = (t: string) =>
  t
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Yazılan metne uyan sanatçılar (Deezer). Yalnız adı yazılana gerçekten benzeyenler döner. */
export async function searchArtists(q: string): Promise<ArtistHit[]> {
  const url = new URL("https://api.deezer.com/search/artist");
  url.search = new URLSearchParams({ q, limit: "6" }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Deezer ${res.status}`);
  const data = (await res.json()) as { data?: DeezerArtist[] };
  const nq = norm(q);
  return (data.data ?? [])
    .filter((a) => a.id && a.name)
    .filter((a) => {
      const n = norm(a.name!);
      return n.startsWith(nq) || nq.startsWith(n) || n.split(" ").some((w) => w.length > 2 && nq.split(" ").includes(w));
    })
    .sort((a, b) => (b.nb_fan ?? 0) - (a.nb_fan ?? 0))
    .slice(0, 3)
    .map((a) => ({ id: a.id!, name: a.name!, picture: a.picture_medium ?? "", fans: a.nb_fan ?? 0 }));
}

/** Bir sanatçının en popüler şarkıları: önce Deezer, olmazsa iTunes */
export async function artistTop(name: string, id: number): Promise<SongHit[]> {
  if (id > 0) {
    try {
      const res = await fetch(`https://api.deezer.com/artist/${id}/top?limit=50`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = (await res.json()) as { data?: DeezerTrack[] };
        const songs = (data.data ?? [])
          .filter((t) => t.title)
          .map((t) => ({
            title: t.title!,
            artist: t.artist?.name ?? name,
            album: t.album?.title ?? "",
            year: "",
            artwork: t.album?.cover_medium ?? "",
          }));
        if (songs.length) return songs;
      }
    } catch {
      // iTunes'a geç
    }
  }
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({ term: name, media: "music", entity: "song", attribute: "artistTerm", limit: "50" }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: ITunesTrack[] };
  const n = norm(name);
  return (data.results ?? [])
    .filter((t) => t.trackName && t.artistName && norm(t.artistName).includes(n))
    .map((t) => ({
      title: t.trackName!,
      artist: t.artistName!,
      album: t.collectionName ?? "",
      year: t.releaseDate?.slice(0, 4) ?? "",
      artwork: t.artworkUrl100 ?? "",
    }));
}

/** Aynı şarkının remaster/live sürümlerini tek satıra indir */
export function dedupeTitles(songs: SongHit[]): SongHit[] {
  songs = songs.map((s) => ({ ...s, title: cleanTitle(s.title) || s.title }));
  const seen = new Set<string>();
  return songs.filter((s) => {
    const base = norm(s.title.replace(/\(.*?\)|\[.*?\]|-\s*(remaster|live|remix|demo|mono|stereo).*$/gi, ""));
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

/** Deezer'dan sanatçı bilgisi (resim, hayran sayısı) */
export async function deezerArtist(id: number): Promise<ArtistHit | null> {
  const res = await fetch(`https://api.deezer.com/artist/${id}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  const a = (await res.json()) as DeezerArtist & { picture_xl?: string; error?: unknown };
  if (a.error || !a.id || !a.name) return null;
  return { id: a.id, name: a.name, picture: a.picture_xl ?? a.picture_medium ?? "", fans: a.nb_fan ?? 0 };
}
