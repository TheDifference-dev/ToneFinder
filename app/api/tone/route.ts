import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { findTone, ToneError } from "@/lib/research";
import { ToneRequestSchema, type ToneEvent } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

let client: Anthropic | undefined;

function errorMessage(error: unknown): string {
  if (error instanceof ToneError) return error.message;
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Anthropic authentication failed:", error.message);
    return "Sunucuda API anahtarı ayarlı değil ya da geçersiz.";
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
        client ??= new Anthropic();
        const result = await findTone(client, parsed.data, emit);
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
