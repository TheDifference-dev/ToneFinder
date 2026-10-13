// Sonucu düz metne çevirir ("Ayarları kopyala": prosesöre/not defterine elle aktarmak için)
// ve şarkı için dış bağlantıları üretir.

import type { ToneResult } from "./schema";

const BASIS: Record<string, string> = { cited: "kaynaklı", inferred: "çıkarım", check: "kontrol et" };

export function toneText(r: ToneResult): string {
  const lines = [
    `${r.song.title} — ${r.song.artist}${r.song.album_or_year ? ` (${r.song.album_or_year})` : ""}`,
    [r.song.bpm && `Tempo: ${r.song.bpm}`, r.song.key && `Ton: ${r.song.key}`, r.guitar.tuning && `Akort: ${r.guitar.tuning}`]
      .filter(Boolean)
      .join(" · "),
    "",
    "SİNYAL ZİNCİRİ",
    ...r.chain.flatMap((b, i) => [
      `${i + 1}. ${b.block}: ${b.device_model}${b.emulates ? ` (≈ ${b.emulates})` : ""}`,
      ...b.settings.map((s) => `   ${s.name}: ${s.value}${s.basis ? ` [${BASIS[s.basis] ?? s.basis}]` : ""}${s.note ? ` — ${s.note}` : ""}`),
    ]),
    "",
    "GİTAR",
    `Manyetik: ${r.guitar.pickup} · Volume: ${r.guitar.volume} · Tone: ${r.guitar.tone}`,
    ...r.guitar.compensation.map((c) => `- ${c}`),
  ];
  if (r.playing_tips.length) lines.push("", "ÇALIM", ...r.playing_tips.map((t) => `- ${t}`));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function songLinks(title: string, artist: string) {
  const q = `${artist} ${title}`.trim();
  return {
    tab: `https://www.songsterr.com/?pattern=${encodeURIComponent(q)}`,
    backing: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} guitar backing track`)}`,
  };
}
