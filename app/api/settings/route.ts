import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/guard";
import { clearApiKey, getApiKey, saveApiKey } from "@/lib/settings";

export const runtime = "nodejs";

// Anahtarın kendisi asla geri döndürülmez; yalnızca ayarlı olup olmadığı.
export async function GET() {
  const current = await getApiKey();
  return NextResponse.json({ configured: Boolean(current), source: current?.source ?? null });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null;
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "Bu bir Anthropic API anahtarına benzemiyor (sk-ant- ile başlamalı)." }, { status: 400 });
  }

  // Kaydetmeden önce anahtarın çalıştığını ücretsiz bir çağrıyla doğrula
  try {
    await new Anthropic({ apiKey }).models.list({ limit: 1 });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      return NextResponse.json({ error: "Anahtar geçersiz ya da devre dışı. Konsoldan yeni bir anahtar oluştur." }, { status: 400 });
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return NextResponse.json({ error: "Anthropic'e bağlanılamadı. İnternet bağlantını kontrol et." }, { status: 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Anahtar doğrulanamadı, lütfen tekrar dene." }, { status: 502 });
  }

  await saveApiKey(apiKey);
  return NextResponse.json({ configured: true, source: "file" });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  await clearApiKey();
  const current = await getApiKey();
  return NextResponse.json({ configured: Boolean(current), source: current?.source ?? null });
}
