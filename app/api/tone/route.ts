import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { findDevice, PARTS, PICKUP_CONFIGS } from "@/lib/gear";
import { ToneRequestSchema, ToneResultSchema, type ToneRequest } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

let client: Anthropic | undefined;

const SYSTEM_PROMPT = `Sen deneyimli bir gitar teknisyeni ve stüdyo ton uzmanısın. Görevin, kullanıcının istediği şarkıdaki gitar tonunu, kullanıcının SAHİP OLDUĞU ekipmanla elde edebileceği somut ayarlara çevirmek.

İlkeler:
- Ayarları kullanıcının cihazındaki gerçek amfi modeli, kanal ve düğme adlarıyla ver. Cihazda olmayan bir parametre uydurma.
- 0–10 ölçekli düğmeler için ondalıklı sayı ver (ör. 6.5). Delay süresi gibi değerleri birimiyle yaz; mümkünse şarkının temposuna göre hesapla.
- Orijinal kayıtta kullanılan ekipmanı bildiğin kadarıyla belirt; emin olmadığın yerde bunu açıkça söyle ve confidence alanını buna göre düşür.
- Kullanıcının gitarı/manyetikleri orijinalden farklıysa (ör. single-coil yerine humbucker) bunu gain, EQ ve manyetik seçimiyle telafi et ve adaptation_notes içinde açıkla.
- Kullanıcının ayrıca pedalları varsa, uygun düştüğü yerde onları zincire dahil et.
- Efektleri sinyal sırasına göre listele. Gereksiz efekt ekleme; tonda yoksa reverb/delay koyma.
- Tüm açıklamalar Türkçe olsun; düğme ve model adları cihazda yazdığı gibi (genelde İngilizce) kalsın.`;

function describeRequest(req: ToneRequest): string {
  const device = req.rig.deviceId === "custom" ? undefined : findDevice(req.rig.deviceId);
  const deviceLine = device
    ? `${device.name} (kategori: ${device.category}; mevcut kontroller: ${device.controls})`
    : req.rig.customDevice || "Belirtilmemiş amfi";
  const part = PARTS.find((p) => p.id === req.part)?.label ?? req.part;
  const pickups = PICKUP_CONFIGS.find((p) => p.id === req.rig.pickups)?.label ?? req.rig.pickups;

  return [
    `Şarkı: ${req.song}`,
    `Sanatçı: ${req.artist || "belirtilmedi"}`,
    `Bölüm: ${part}`,
    "",
    "Kullanıcının ekipmanı:",
    `- Amfi / modelleyici: ${deviceLine}`,
    `- Gitar: ${req.rig.guitar || "belirtilmedi"}`,
    `- Manyetik dizilimi: ${pickups}`,
    `- Ek pedallar: ${req.rig.pedals || "yok"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ToneRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek. Şarkı adını ve ekipmanını kontrol et." }, { status: 400 });
  }

  try {
    client ??= new Anthropic();
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium",
        format: betaZodOutputFormat(ToneResultSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: describeRequest(parsed.data) }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Bu istek için ton önerisi üretilemedi." }, { status: 422 });
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return NextResponse.json({ error: "Yanıt eksik geldi, lütfen tekrar dene." }, { status: 502 });
    }

    return NextResponse.json({ result: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic authentication failed:", error.message);
      return NextResponse.json({ error: "Sunucuda API anahtarı ayarlı değil ya da geçersiz." }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Çok fazla istek var, biraz sonra tekrar dene." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return NextResponse.json({ error: "Yapay zekâ servisine ulaşılamadı." }, { status: 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
