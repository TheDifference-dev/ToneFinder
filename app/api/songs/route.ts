import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { normName, searchLibrary } from "@/lib/library";
import { artistTop, dedupe, dedupeTitles, searchArtists, searchDeezer, searchITunes, type ArtistHit, type SongHit } from "@/lib/music-search";

export const runtime = "nodejs";

export type { ArtistHit, SongHit };

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

  // Önce uygulamanın grup kütüphanesi, sonra internet (Deezer / iTunes)
  const lib = searchLibrary(q);
  const libArtists: ArtistHit[] = lib.artists.map((a) => ({ id: a.deezerId, name: a.name, picture: a.picture, fans: a.fans, inLibrary: true }));
  const libSongs: SongHit[] = lib.songs.map((s) => ({ title: s.title, artist: s.artist, album: s.album, year: "", artwork: s.artwork }));
  const [online, onlineSongs] = await Promise.all([
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
  const artists = [...libArtists, ...online.filter((a) => !libArtists.some((l) => l.id === a.id || normName(l.name) === normName(a.name)))].slice(0, 4);
  // Servislerin bulanık eşleşmelerinden yazılan kelimeleri gerçekten içerenleri öne al (yoksa hepsini göster)
  const words = normName(q).split(" ").filter(Boolean);
  const relevant = onlineSongs.filter((x) => {
    const t = normName(`${x.title} ${x.artist}`);
    return words.every((w) => t.includes(w));
  });
  const songs = dedupe([...libSongs, ...(relevant.length ? relevant : onlineSongs)]).slice(0, 8);
  return NextResponse.json({ songs, artists });
}
