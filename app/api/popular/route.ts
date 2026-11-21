import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { popularCatalog } from "@/lib/popular";

export const runtime = "nodejs";

// Popüler şarkı kataloğu: sıra, bölüm, kapak ve hazır araştırmanın özeti
export async function GET(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  return NextResponse.json({ songs: popularCatalog() });
}
