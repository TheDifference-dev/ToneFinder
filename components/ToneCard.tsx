"use client";

import { useState } from "react";
import type { AdaptedTone } from "@/lib/schema";
import { categoryOf, ChainBlock, ChainCap, ChainLink, ChainRow } from "./chain";
import { Knob } from "./Knob";
import { PickupSelector } from "./PickupSelector";

// 2. adım sonucu: orijinal ton kullanıcının ekipmanına uyarlanmış hâli

const SOURCE = { pedal: "Pedalın", processor: "Prosesör", amp: "Amfin" } as const;

const MATCH = {
  exact: { label: "Birebir", color: "var(--color-ok)" },
  close: { label: "Yakın", color: "var(--color-accent)" },
  substitute: { label: "Yerine", color: "var(--color-warn)" },
} as const;

function Fold({ title, count, open, children }: { title: string; count?: number; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group border-t border-line" open={open}>
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

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-4">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function ToneCard({ result, pickupLayout }: { result: Partial<AdaptedTone>; pickupLayout?: string }) {
  const chain = result.chain ?? [];
  const sections = result.other_sections ?? [];
  const [section, setSection] = useState(-1);
  const [selected, setSelected] = useState(() => Math.max(0, chain.findIndex((b) => /amp/i.test(b.block))));
  const block = chain[selected];
  const activeSection = section >= 0 ? sections[section] : undefined;
  const match = result.match ? Math.min(100, Math.max(0, Math.round(result.match.percent))) : null;

  return (
    <article className="hud-panel overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 p-5">
        <h2 className="flex-1 font-display text-2xl font-bold text-ink">Senin ekipmanınla</h2>
        {match !== null && (
          <span className="rounded-full border border-line px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-ink-soft" title={result.match?.reason}>
            Yakınlık (tahmin) <b className="text-accent">%{match}</b>
          </span>
        )}
      </header>

      {sections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3" role="tablist" aria-label="Bölümler">
          {[{ name: "Ana ton" }, ...sections].map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              role="tab"
              aria-selected={section === i - 1}
              onClick={() => setSection(i - 1)}
              className={`rounded-md border px-3 py-1 font-display text-sm font-semibold uppercase tracking-wide ${
                section === i - 1 ? "border-accent bg-accent text-paper" : "border-line text-ink-soft hover:border-line-strong"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {activeSection ? (
        <section className="px-5 pb-5">
          <p className="mb-2 text-xs text-ink-mute">Yalnız değişen ayarlar; gerisi ana tondaki gibi.</p>
          <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
            {activeSection.changes.map((c, i) => (
              <li key={i} className="flex items-start justify-between gap-3 p-3 text-sm">
                <span>
                  <span className="hud-label mr-2">{c.block}</span>
                  <b className="text-ink">{c.setting}</b>
                  <span className="block text-xs text-ink-mute">{c.why}</span>
                </span>
                <span className="font-display text-lg font-semibold text-accent">{c.value}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="px-5 pb-5">
          <ChainRow>
            <ChainCap label="In" />
            {chain.map((b, i) => (
              <span key={`${b.block}-${i}`} className="flex items-center">
                <ChainLink />
                <ChainBlock
                  category={categoryOf(`${b.block} ${b.device_model}`)}
                  sub={`${b.block} · ${SOURCE[b.source]}`}
                  title={b.device_model}
                  selected={i === selected}
                  dot={b.match ? MATCH[b.match]?.color : undefined}
                  onClick={() => setSelected(i)}
                />
              </span>
            ))}
            <ChainLink />
            <ChainCap label="Out" />
          </ChainRow>

          {block && (
            <div className="mt-3 rounded-lg border border-line bg-raised p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl font-semibold text-ink">{block.device_model}</span>
                {block.match && MATCH[block.match] && (
                  <span className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: MATCH[block.match].color }}>
                    {MATCH[block.match].label}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink-mute">≈ {block.emulates}</p>
              {block.start_from && (
                <p className="mt-3 rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-ink">
                  <span className="hud-label mr-2 text-accent">Önce yükle</span>
                  {block.start_from}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {block.settings.map((s) => (
                  <Knob key={s.name} name={s.name} value={s.value} basis={s.basis} />
                ))}
              </div>
              {block.settings.some((s) => s.note) && (
                <dl className="mt-3 space-y-1 border-t border-line pt-3 text-xs">
                  {block.settings
                    .filter((s) => s.note)
                    .map((s) => (
                      <div key={s.name} className="flex gap-2">
                        <dt className="shrink-0 font-semibold text-ink">{s.name}</dt>
                        <dd className="text-ink-soft">{s.note}</dd>
                      </div>
                    ))}
                </dl>
              )}
              {block.note && <p className="mt-3 text-sm text-ink-soft">{block.note}</p>}
              {(block.unused_controls?.length ?? 0) > 0 && (
                <p className="mt-3 text-xs text-ink-mute">
                  Dokunma: {block.unused_controls!.map((u) => `${u.name} (${u.reason})`).join(", ")}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {result.guitar && (
        <section className="grid gap-4 border-t border-line p-5 sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="hud-label mb-2 text-ink-soft">Gitar</h3>
            <div className="flex flex-wrap gap-2">
              <Knob name="Manyetik" value={result.guitar.pickup} />
              <Knob name="Volume" value={result.guitar.volume} />
              <Knob name="Tone" value={result.guitar.tone} />
            </div>
            {result.guitar.compensation.length > 0 && (
              <div className="mt-3 text-sm text-ink-soft">
                <Bullets items={result.guitar.compensation} />
              </div>
            )}
          </div>
          <PickupSelector layout={pickupLayout} selected={result.guitar.selector} />
        </section>
      )}

      {result.adaptation_notes && (
        <Fold title="Uyarlama notu">
          <p>{result.adaptation_notes}</p>
        </Fold>
      )}
      {(result.limitations?.length ?? 0) > 0 && (
        <Fold title="Sınırlamalar" count={result.limitations!.length}>
          <Bullets items={result.limitations!} />
        </Fold>
      )}
      {(result.alternatives?.length ?? 0) > 0 && (
        <Fold title="Alternatifler" count={result.alternatives!.length}>
          <Bullets items={result.alternatives!} />
        </Fold>
      )}
      {(result.playing_tips?.length ?? 0) > 0 && (
        <Fold title="Çalım ipuçları" count={result.playing_tips!.length}>
          <Bullets items={result.playing_tips!} />
        </Fold>
      )}
    </article>
  );
}
