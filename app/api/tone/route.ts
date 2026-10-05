import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { findTone, ToneError } from "@/lib/research";
import { getApiKey } from "@/lib/settings";
import { ToneRequestSchema, type ToneEvent } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

function errorMessage(error: unknown): string {
  if (error instanceof ToneError) return error.message;
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
// ardından tek bir result ya da error satırı.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const apiKey = await getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "API anahtarı ayarlı değil.", code: "no_api_key" }, { status: 400 });
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
        const result = await findTone(new Anthropic({ apiKey: apiKey.key }), parsed.data, emit);
        emit({ type: "result", result });
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
