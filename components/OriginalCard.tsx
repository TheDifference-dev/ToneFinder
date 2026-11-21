"use client";

import { useState } from "react";
import { songLinks } from "@/lib/format";
import type { OriginalTone } from "@/lib/schema";
import { isNoGear, POST_AMP, sortChain, stageOf } from "@/lib/signal-chain";
import { categoryOf, ChainBlock, ChainCap, ChainLink, ChainRow, type Category } from "./chain";
import { Knob } from "./Knob";
import { Artwork } from "./ui";

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
  // Pedallar sinyal zinciri kuralına göre ikiye ayrılır: amfi önü ve amfi sonrası (efekt döngüsü / stüdyo).
  // Delay ve reverb her zaman amfiden sonra gelir.
  const pedals = sortChain(
    r.pedals.filter((p) => p.model?.trim() && !isNoGear(p.model)).map((p) => ({ p, stage: stageOf(p.model, p.purpose, true) })),
    (x) => x.stage,
  ).map(({ p, stage }) => ({
    post: POST_AMP.has(stage),
    item: {
      category: categoryOf(p.model, p.purpose, true),
      sub: POST_AMP.has(stage) ? "Amfi sonrası" : "Pedal",
      title: p.model,
      certainty: p.certainty,
      settings: p.settings,
      lines: [p.purpose],
    } satisfies GearItem,
  }));
  return [
    { category: "guitar" as const, sub: "Gitar", title: r.guitar.model, certainty: r.guitar.certainty, lines: [r.guitar.pickup, r.tuning && `Akort: ${r.tuning}`].filter(Boolean) as string[] },
    ...pedals.filter((x) => !x.post).map((x) => x.item),
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
    ...pedals.filter((x) => x.post).map((x) => x.item),
  ].filter((g) => g.title?.trim());
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-panel px-4 py-3">
      <div className="hud-label">{label}</div>
      <div className="mt-1 truncate text-lg font-semibold text-ink" title={typeof children === "string" ? children : undefined}>
        {children}
      </div>
    </div>
  );
}

function Fold({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-3.5 hover:bg-raised/50">
        <span className="hud-label text-ink-soft">
          {title}
          {count !== undefined && <span className="ml-2 text-ink-mute">{count}</span>}
        </span>
        <span className="text-ink-mute transition group-open:rotate-90">›</span>
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">{children}</div>
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
    <article className="hud-panel rise overflow-hidden">
      {/* Şarkı: renkli bant */}
      <header className="flex flex-wrap items-end gap-6 px-6 pb-7 pt-6" style={{ background: "var(--color-petrol)" }}>
        <Artwork src={artwork} title={tone.song.title} size={112} rounded={14} inverted />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Orijinal stüdyo tonu</div>
          <h2 className="headline mt-1 break-words text-[44px] font-semibold leading-[1.02] text-white">{tone.song.title}</h2>
          <p className="mt-1.5 text-[15px] font-medium text-white/80">
            {tone.song.artist}
            {tone.song.album_or_year && ` · ${tone.song.album_or_year}`}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-ink">
          <span className="h-2 w-2 rounded-full" style={{ background: conf.color }} />
          {conf.label}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 px-6 pt-5 sm:grid-cols-4">
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
      <div className="px-6 pt-5">
        <p className="text-[15px] leading-relaxed text-ink">{tone.song.tone_character}</p>
        {tone.song.tone_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tone.song.tone_tags.map((t) => (
              <span key={t} className="rounded-full bg-petrol-light px-3 py-1 text-xs font-semibold text-petrol">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stüdyo zinciri */}
      <section className="px-6 pb-6 pt-6">
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
          <div className="mt-3 rounded-2xl bg-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="headline text-2xl font-semibold text-ink">{item.title}</span>
              {item.certainty && (
                <span className="text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: CERTAINTY[item.certainty].color }}>
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
              <>
                {/* sayı ya da kısa değer → düğme; uzun açıklama → satır */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.settings
                    .filter((s) => s.value.length <= 12)
                    .map((s) => (
                      <Knob key={s.name} name={s.name} value={s.value} />
                    ))}
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  {item.settings
                    .filter((s) => s.value.length > 12)
                    .map((s) => (
                      <div key={s.name} className="flex gap-2">
                        <dt className="shrink-0 font-semibold text-ink">{s.name}</dt>
                        <dd className="text-ink-soft">{s.value}</dd>
                      </div>
                    ))}
                </dl>
              </>
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
          <a href={links.tab} target="_blank" rel="noopener noreferrer" className="pill pill-soft !px-3.5 !py-2 text-xs">
            Tab ↗
          </a>
          <a href={links.backing} target="_blank" rel="noopener noreferrer" className="pill pill-soft !px-3.5 !py-2 text-xs">
            Backing track ↗
          </a>
        </div>
      </Fold>
    </article>
  );
}
