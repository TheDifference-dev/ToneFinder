"use client";

import { useState } from "react";
import { songLinks } from "@/lib/format";
import type { OriginalTone } from "@/lib/schema";
import { categoryOf, ChainBlock, ChainCap, ChainLink, ChainRow, type Category } from "./chain";
import { Knob } from "./Knob";

// 1. adım sonucu: şarkının stüdyo kaydındaki ekipman

type Certainty = "confirmed" | "likely" | "guess";

export const CERTAINTY: Record<Certainty, { label: string; color: string }> = {
  confirmed: { label: "Kaynaklı", color: "var(--color-ok)" },
  likely: { label: "Muhtemel", color: "var(--color-warn)" },
  guess: { label: "Tahmin", color: "var(--color-bad)" },
};

const CONFIDENCE = {
  high: { label: "Yüksek güven", color: "var(--color-ok)" },
  medium: { label: "Orta güven", color: "var(--color-warn)" },
  low: { label: "Düşük güven", color: "var(--color-bad)" },
} as const;

interface GearItem {
  category: Category;
  sub: string;
  title: string;
  certainty?: Certainty;
  settings?: { name: string; value: string }[];
  lines: string[];
}

function gearItems(t: OriginalTone): GearItem[] {
  const r = t.original_rig;
  return [
    { category: "guitar" as const, sub: "Gitar", title: r.guitar.model, certainty: r.guitar.certainty, lines: [r.guitar.pickup, r.tuning && `Akort: ${r.tuning}`].filter(Boolean) as string[] },
    ...r.pedals.map((p) => ({
      category: categoryOf(`${p.model} ${p.purpose}`),
      sub: "Pedal",
      title: p.model,
      certainty: p.certainty,
      settings: p.settings,
      lines: [p.purpose],
    })),
    ...r.amps.map((a) => ({
      category: "amp" as const,
      sub: "Amfi",
      title: a.model,
      certainty: a.certainty,
      settings: a.settings,
      lines: [a.channel && `Kanal: ${a.channel}`, a.notes].filter(Boolean) as string[],
    })),
    { category: "cab" as const, sub: "Kabin", title: r.cab.model, certainty: r.cab.certainty, lines: [r.cab.speakers, r.cab.notes].filter(Boolean) as string[] },
    ...r.cab.mics.map((m) => ({
      category: "cab" as const,
      sub: "Mikrofon",
      title: m.model,
      lines: [m.position && `Konum: ${m.position}`, m.distance && `Mesafe: ${m.distance}`].filter(Boolean) as string[],
    })),
  ].filter((g) => g.title?.trim());
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-panel px-4 py-3">
      <div className="hud-label">{label}</div>
      <div className="mt-0.5 truncate font-display text-lg font-semibold text-ink" title={typeof children === "string" ? children : undefined}>
        {children}
      </div>
    </div>
  );
}

function Fold({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 hover:bg-raised/50">
        <span className="hud-label text-ink-soft">
          {title}
          {count !== undefined && <span className="ml-2 text-ink-mute">{count}</span>}
        </span>
        <span className="text-ink-mute transition group-open:rotate-90">›</span>
      </summary>
      <div className="px-5 pb-4 text-sm text-ink-soft">{children}</div>
    </details>
  );
}

export function OriginalCard({ tone, artwork }: { tone: OriginalTone; artwork?: string }) {
  const items = gearItems(tone);
  const ampIndex = items.findIndex((g) => g.category === "amp");
  const [selected, setSelected] = useState(ampIndex >= 0 ? ampIndex : 0);
  const item = items[selected];
  const links = songLinks(tone.song.title, tone.song.artist);
  const difficulty = Math.min(5, Math.max(1, Math.round(tone.difficulty?.score ?? 0))) || null;
  const conf = CONFIDENCE[tone.research_confidence];

  return (
    <article className="hud-panel overflow-hidden">
      {/* Şarkı */}
      <header className="flex flex-wrap items-center gap-4 p-5">
        {artwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork} alt="" className="h-16 w-16 rounded-md object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-3xl font-bold leading-tight text-ink">{tone.song.title}</h2>
          <p className="truncate text-sm text-ink-soft">
            {tone.song.artist}
            {tone.song.album_or_year && ` · ${tone.song.album_or_year}`}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-ink-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: conf.color }} />
          {conf.label}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-4">
        <Spec label="Tempo">{tone.song.bpm || "—"}</Spec>
        <Spec label="Ton">{tone.song.key || "—"}</Spec>
        <Spec label="Akort">{tone.original_rig.tuning || "—"}</Spec>
        <Spec label="Zorluk">
          {difficulty ? (
            <span aria-label={`5 üzerinden ${difficulty}`}>
              {"●".repeat(difficulty)}
              <span className="text-line-strong">{"●".repeat(5 - difficulty)}</span>
            </span>
          ) : (
            "—"
          )}
        </Spec>
      </div>

      {/* Karakter */}
      <div className="px-5 pt-4">
        <p className="text-[15px] leading-relaxed text-ink">{tone.song.tone_character}</p>
        {tone.song.tone_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tone.song.tone_tags.map((t) => (
              <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stüdyo zinciri */}
      <section className="px-5 pb-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="hud-label text-ink-soft">Stüdyo ekipmanı</h3>
          <span className="flex gap-3 text-[11px] text-ink-mute">
            {Object.values(CERTAINTY).map((c) => (
              <span key={c.label} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </span>
            ))}
          </span>
        </div>
        <ChainRow>
          <ChainCap label="In" />
          {items.map((g, i) => (
            <span key={`${g.sub}-${i}`} className="flex items-center">
              <ChainLink />
              <ChainBlock
                category={g.category}
                sub={g.sub}
                title={g.title}
                selected={i === selected}
                dot={g.certainty ? CERTAINTY[g.certainty].color : undefined}
                onClick={() => setSelected(i)}
              />
            </span>
          ))}
          <ChainLink />
          <ChainCap label="Out" />
        </ChainRow>

        {item && (
          <div className="mt-3 rounded-lg border border-line bg-raised p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xl font-semibold text-ink">{item.title}</span>
              {item.certainty && (
                <span className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: CERTAINTY[item.certainty].color }}>
                  {CERTAINTY[item.certainty].label}
                </span>
              )}
            </div>
            {item.lines.map((l) => (
              <p key={l} className="mt-1 text-sm text-ink-soft">
                {l}
              </p>
            ))}
            {item.settings && item.settings.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.settings.map((s) => (
                  <Knob key={s.name} name={s.name} value={s.value} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ayrıntılar */}
      {tone.original_rig.recording_notes && (
        <Fold title="Kayıt notları">
          <p>{tone.original_rig.recording_notes}</p>
        </Fold>
      )}
      {tone.warnings.length > 0 && (
        <Fold title="Uyarılar" count={tone.warnings.length}>
          <ul className="list-disc space-y-1 pl-4">
            {tone.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Fold>
      )}
      {tone.sections.length > 0 && (
        <Fold title="Şarkının diğer bölümleri" count={tone.sections.length}>
          <ul className="space-y-1.5">
            {tone.sections.map((s) => (
              <li key={s.name}>
                <b className="text-ink">{s.name}:</b> {s.description}
              </li>
            ))}
          </ul>
        </Fold>
      )}
      {tone.difficulty?.factors.length > 0 && (
        <Fold title="Çalım teknikleri" count={tone.difficulty.factors.length}>
          <ul className="list-disc space-y-1 pl-4">
            {tone.difficulty.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Fold>
      )}
      <Fold title="Kaynaklar" count={tone.sources.length}>
        <ul className="space-y-1">
          {tone.sources.map((s) => (
            <li key={s.url} className="truncate">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {s.title || s.url}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <a href={links.tab} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent">
            Tab ↗
          </a>
          <a href={links.backing} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent">
            Backing track ↗
          </a>
        </div>
      </Fold>
    </article>
  );
}
