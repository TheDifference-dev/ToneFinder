import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";

export const runtime = "nodejs";

export interface ArtistHit {
  /** Deezer sanatçı kimliği (yoksa 0) */
  id: number;
  name: string;
  picture: string;
  fans: number;
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
const cleanTitle = (t: string) =>
  t
    .replace(/\s*[([](?:[^)\]]*\b(?:remaster(?:ed)?|mono|stereo|deluxe|bonus track|single version|album version)\b[^)\]]*)[)\]]/gi, "")
    .replace(/\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|mono|stereo|single version|album version)\b.*$/i, "")
    .trim();

function dedupe(songs: SongHit[]): SongHit[] {
  songs = songs.map((s) => ({ ...s, title: cleanTitle(s.title) || s.title }));
  const seen = new Set<string>();
  return songs.filter((s) => {
    const id = `${s.title}|${s.artist}`.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

async function searchITunes(q: string): Promise<SongHit[]> {
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

async function searchDeezer(q: string): Promise<SongHit[]> {
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
async function searchArtists(q: string): Promise<ArtistHit[]> {
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
async function artistTop(name: string, id: number): Promise<SongHit[]> {
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
function dedupeTitles(songs: SongHit[]): SongHit[] {
  songs = songs.map((s) => ({ ...s, title: cleanTitle(s.title) || s.title }));
  const seen = new Set<string>();
  return songs.filter((s) => {
    const base = norm(s.title.replace(/\(.*?\)|\[.*?\]|-\s*(remaster|live|remix|demo|mono|stereo).*$/gi, ""));
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

// Arama kutusu: yazılan metne uyan sanatçılar ve şarkılar. Sanatçı seçilince (?artist=&id=) o
// sanatçının popüler şarkıları döner. Kaynaklar: Deezer ve Apple iTunes Search API (anahtarsız).
export async function GET(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const params = new URL(request.url).searchParams;

  const artistName = params.get("artist")?.trim() ?? "";
  if (artistName) {
    if (artistName.length > 100) return NextResponse.json({ songs: [] });
    const id = Number(params.get("id") ?? 0) || 0;
    try {
      return NextResponse.json({ songs: dedupeTitles(await artistTop(artistName, id)).slice(0, 40) });
    } catch {
      return NextResponse.json({ songs: [] });
    }
  }

  const q = params.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) return NextResponse.json({ songs: [], artists: [] });

  const [artists, songs] = await Promise.all([
    searchArtists(q).catch(() => [] as ArtistHit[]),
    (async () => {
      for (const search of [searchITunes, searchDeezer]) {
        try {
          const found = dedupe(await search(q)).slice(0, 8);
          if (found.length > 0) return found;
        } catch {
          // sıradaki kaynağı dene
        }
      }
      return [] as SongHit[];
    })(),
  ]);
  return NextResponse.json({ songs, artists });
}
