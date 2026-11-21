import { NextResponse } from "next/server";
import { libraryArtists } from "@/lib/library";

export const runtime = "nodejs";

// Ana sayfadaki "Grup kütüphanesi" için grup listesi (şarkılar grup sayfasında gelir)
export function GET() {
  return NextResponse.json({
    artists: libraryArtists().map((a) => ({ id: a.deezerId, name: a.name, picture: a.picture, fans: a.fans, region: a.region, count: a.songs.length })),
  });
}
