import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";

export const runtime = "nodejs";

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

interface DeezerTrack {
  title?: string;
  rank?: number;
  artist?: { name?: string };
  album?: { title?: string; cover_medium?: string };
}

function dedupe(songs: SongHit[]): SongHit[] {
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

// Şarkı adı yazılırken öneri: önce Apple'ın iTunes Search API'si (çıkış yılı da verir), olmazsa
// Deezer'ın arama API'si. İkisi de herkese açık, anahtar gerektirmez.
export async function GET(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) return NextResponse.json({ songs: [] });

  for (const search of [searchITunes, searchDeezer]) {
    try {
      const songs = dedupe(await search(q)).slice(0, 8);
      if (songs.length > 0) return NextResponse.json({ songs });
    } catch {
      // sıradaki kaynağı dene
    }
  }
  return NextResponse.json({ songs: [] });
}
