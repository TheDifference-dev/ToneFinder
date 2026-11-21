import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { findLibraryArtist } from "@/lib/library";
import { artistTop, deezerArtist, dedupeTitles, searchArtists, type ArtistHit, type SongHit } from "@/lib/music-search";

export const runtime = "nodejs";

export interface ArtistPage {
  artist: ArtistHit;
  songs: SongHit[];
}

// Grup sayfası: ?name=Duman&id=<deezer kimliği>. Kütüphanedeki gruplar anında açılır;
// olmayanlar Deezer'dan (resim, en popüler şarkılar), o da olmazsa iTunes'tan bulunur.
export async function GET(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const name = params.get("name")?.trim().slice(0, 100) ?? "";
  let id = Number(params.get("id") ?? 0) || 0;
  if (!name && !id) return NextResponse.json({ error: "Grup adı gerekli." }, { status: 400 });

  const lib = findLibraryArtist(name, id);
  if (lib) {
    const page: ArtistPage = {
      artist: { id: lib.deezerId, name: lib.name, picture: lib.picture, fans: lib.fans, inLibrary: true },
      songs: lib.songs.map((s) => ({ title: s.title, artist: lib.name, album: s.album, year: "", artwork: s.artwork })),
    };
    return NextResponse.json(page);
  }

  try {
    let artist: ArtistHit | null = id ? await deezerArtist(id).catch(() => null) : null;
    if (!artist && name) {
      const hits = await searchArtists(name).catch(() => [] as ArtistHit[]);
      if (hits[0]) {
        id = hits[0].id;
        artist = (await deezerArtist(id).catch(() => null)) ?? hits[0];
      }
    }
    const display = artist?.name ?? name;
    const songs = dedupeTitles(await artistTop(display, artist?.id ?? 0)).slice(0, 30);
    if (!artist && !songs.length) return NextResponse.json({ error: "Bu grup bulunamadı." }, { status: 404 });
    const page: ArtistPage = { artist: artist ?? { id: 0, name: display, picture: songs[0]?.artwork ?? "", fans: 0 }, songs };
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Grup bilgisi alınamadı." }, { status: 502 });
  }
}
