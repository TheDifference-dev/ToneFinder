import { NextResponse } from "next/server";
import { z } from "zod";
import { CliError } from "@/lib/claude-cli";
import { isSameOrigin } from "@/lib/guard";
import { identifyQuery, resolveEngine, ToneError } from "@/lib/research";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({ q: z.string().trim().min(2).max(100) });

// Kütüphanede ve Deezer/iTunes'ta çıkmayan bir arama: Claude Code (ya da API) web'de arayıp
// hangi grup ya da şarkının kastedildiğini bulur.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz arama." }, { status: 400 });
  const engine = await resolveEngine();
  if (!engine) return NextResponse.json({ error: "Bunun için Claude Code ya da API anahtarı gerekli.", code: "no_engine" }, { status: 400 });
  try {
    return NextResponse.json(await identifyQuery(engine, parsed.data.q));
  } catch (error) {
    if (error instanceof ToneError || error instanceof CliError) return NextResponse.json({ error: error.message }, { status: 502 });
    console.error(error);
    return NextResponse.json({ error: "Web'de aranamadı, lütfen tekrar dene." }, { status: 502 });
  }
}
