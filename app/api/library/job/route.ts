import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/guard";
import { jobStatus, resumeJobIfEnabled, startJob, stopJob } from "@/lib/library-job";

export const runtime = "nodejs";

// Arka plan kütüphane araştırmasının durumu (GET) ve başlat/durdur (POST {action})
export function GET() {
  resumeJobIfEnabled();
  return NextResponse.json(jobStatus());
}

const Body = z.object({ action: z.enum(["start", "stop"]) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "İzin verilmeyen istek." }, { status: 403 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  if (parsed.data.action === "start") startJob();
  else stopJob();
  return NextResponse.json(jobStatus());
}
