import { NextResponse } from "next/server";
import { sheetParts } from "@/lib/song-library";

export const runtime = "nodejs";

// Şarkının kütüphanede hazır olan gitar bölümleri (sonuç ekranında "Bu şarkıdaki diğer bölümler")
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title = params.get("title")?.slice(0, 150) ?? "";
  const artist = params.get("artist")?.slice(0, 150) ?? "";
  return NextResponse.json({ parts: title && artist ? sheetParts(artist, title) : [] });
}
