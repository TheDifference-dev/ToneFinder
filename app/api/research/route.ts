import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CliError, findClaudeCli } from "@/lib/claude-cli";
import { isSameOrigin } from "@/lib/guard";
import { getOriginal, ToneError, type Engine } from "@/lib/research";
import { ToneRequestSchema, type ToneEvent } from "@/lib/schema";
import { getApiKey } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 600;

function errorMessage(error: unknown): string {
  if (error instanceof ToneError || error instanceof CliError) return error.message;
  if (error instanceof Anthropic.AuthenticationError) return "API anahtarı geçersiz. Ayarlar'dan yeni bir anahtar gir.";
  if (error instanceof Anthropic.RateLimitError) return "Çok fazla istek var, biraz sonra tekrar dene.";
  if (error instanceof Anthropic.APIError) return "Yapay zekâ servisine ulaşılamadı.";
  console.error(error);
  return "Beklenmeyen bir hata oluştu.";
}

// 1. adım: şarkının orijinal stüdyo tonu. API anahtarı varsa Anthropic API, yoksa bilgisayardaki
// Claude Code (kullanıcının Claude aboneliği) kullanılır. Kullanıcının ekipmanı gerekmez.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  // ekipman bu adımda kullanılmaz; şema rig istediği için boş bir prosesörle doğrulanır
  const parsed = ToneRequestSchema.safeParse({ ...body, rig: { processor: "-", pickups: "SSS" } });
  if (!parsed.success) return NextResponse.json({ error: "Şarkı adını kontrol et." }, { status: 400 });

  const apiKey = await getApiKey();
  const cli = apiKey ? null : findClaudeCli();
  const engine: Engine | null = apiKey
    ? { kind: "api", client: new Anthropic({ apiKey: apiKey.key }) }
    : cli
      ? { kind: "cli", cli }
      : null;
  if (!engine) {
    return NextResponse.json(
      { error: "Araştırma için Claude Code ya da bir API anahtarı gerekli.", code: "no_engine" },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ToneEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        const { original, meta } = await getOriginal(engine, parsed.data, emit);
        emit({ type: "original", original: original.structured, meta });
      } catch (error) {
        emit({ type: "error", error: errorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
