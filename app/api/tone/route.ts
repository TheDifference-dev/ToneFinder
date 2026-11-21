import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { CliError } from "@/lib/claude-cli";
import { findTone, resolveEngine, ToneError } from "@/lib/research";
import { ToneRequestSchema, type ToneEvent } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 900;

function errorMessage(error: unknown): string {
  if (error instanceof ToneError || error instanceof CliError) return error.message;
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Anthropic authentication failed:", error.message);
    return "API anahtarı geçersiz. Ayarlar'dan yeni bir anahtar gir.";
  }
  if (error instanceof Anthropic.RateLimitError) return "Çok fazla istek var, biraz sonra tekrar dene.";
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}:`, error.message);
    return "Yapay zekâ servisine ulaşılamadı.";
  }
  console.error(error);
  return "Beklenmeyen bir hata oluştu.";
}

// Yanıt NDJSON olarak akar: araştırma adımları (status/search/fetch),
// ardından tek bir result ya da error satırı. Geri bildirimle yeniden uyarlamada
// gövdedeki "previous" (önceki sonuç) yapay zekâya bağlam olarak verilir.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  // API anahtarı varsa Anthropic API, yoksa bilgisayardaki Claude Code (kullanıcının aboneliği) kullanılır
  const engine = await resolveEngine();
  if (!engine) {
    return NextResponse.json({ error: "Uyarlama için Claude Code ya da bir API anahtarı gerekli.", code: "no_engine" }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = ToneRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek. Şarkı adını ve ekipmanını kontrol et." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ToneEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        const previous = parsed.data.feedback ? (body as { previous?: unknown }).previous : undefined;
        const { result, meta } = await findTone(engine, parsed.data, emit, previous);
        emit({ type: "result", result, meta });
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
