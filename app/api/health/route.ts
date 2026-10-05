import { NextResponse } from "next/server";

// Masaüstü başlatıcısı, portta zaten çalışan bir ToneFinder olup olmadığını buradan anlar.
export function GET() {
  return NextResponse.json({ app: "tonefinder" });
}
