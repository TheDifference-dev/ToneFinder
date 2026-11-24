import { NextResponse } from "next/server";
import { libraryArtists } from "@/lib/library";
import { resumeJobIfEnabled } from "@/lib/library-job";

export const runtime = "nodejs";

// Ana sayfadaki "Grup kütüphanesi" için grup listesi (şarkılar grup sayfasında gelir)
export function GET() {
  // Uygulama her açıldığında: açık bırakılmış kütüphane araştırması kaldığı yerden sürsün
  resumeJobIfEnabled();
  return NextResponse.json({
    artists: libraryArtists().map((a) => ({ id: a.deezerId, name: a.name, picture: a.picture, fans: a.fans, region: a.region, count: a.songs.length })),
  });
}
