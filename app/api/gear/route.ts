import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readGearProfile, writeGearProfile } from "@/lib/gear-profiles";
import { isSameOrigin } from "@/lib/guard";
import { identifyGear, ToneError } from "@/lib/research";
import { GEAR_KINDS } from "@/lib/schema";
import { getApiKey } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 300;

// GET ?name=A&name=B: daha önce "Web'de tanıt" ile kaydedilmiş profiller
export async function GET(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const names = new URL(request.url).searchParams.getAll("name").slice(0, 20);
  const entries = await Promise.all(names.map(async (n) => [n, await readGearProfile(n)] as const));
  return NextResponse.json({ profiles: Object.fromEntries(entries) });
}

const IdentifySchema = z.object({ name: z.string().trim().min(2).max(120), kind: z.enum(GEAR_KINDS) });

// POST { name, kind }: ekipmanı web'de araştırıp profilini kaydeder
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const apiKey = await getApiKey();
  if (!apiKey) return NextResponse.json({ error: "API anahtarı ayarlı değil.", code: "no_api_key" }, { status: 400 });
  const parsed = IdentifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  try {
    const profile = await identifyGear(new Anthropic({ apiKey: apiKey.key }), parsed.data.name, parsed.data.kind);
    await writeGearProfile(parsed.data.name, profile);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ToneError) return NextResponse.json({ error: error.message }, { status: 502 });
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "API anahtarı geçersiz. Ayarlar'dan yeni bir anahtar gir." }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Ekipman araştırılamadı, lütfen tekrar dene." }, { status: 502 });
  }
}
