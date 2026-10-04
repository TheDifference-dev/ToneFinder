import type { ToneResult } from "@/lib/schema";
import { Knob } from "./Knob";

const CONFIDENCE = {
  high: { label: "Yüksek güven", cls: "bg-emerald-500/15 text-emerald-300" },
  medium: { label: "Orta güven", cls: "bg-amber-500/15 text-amber-300" },
  low: { label: "Düşük güven", cls: "bg-rose-500/15 text-rose-300" },
} as const;

const POSITION = { "pre-amp": "Amfi öncesi", loop: "Efekt döngüsü", "post-amp": "Amfi sonrası" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">{title}</h3>
      {children}
    </section>
  );
}

export function ToneCard({ result }: { result: ToneResult }) {
  const conf = CONFIDENCE[result.confidence];

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-neutral-800 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">{result.song.title}</h2>
            <p className="text-neutral-400">
              {result.song.artist}
              {result.song.album_or_year && ` · ${result.song.album_or_year}`}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${conf.cls}`}>{conf.label}</span>
        </div>
        <p className="mt-3 text-neutral-200">{result.song.tone_character}</p>
        {result.song.original_gear.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {result.song.original_gear.map((g) => (
              <span key={g} className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
                {g}
              </span>
            ))}
          </div>
        )}
      </header>

      <Section title="Amfi">
        <p className="font-semibold text-amber-300">{result.amp.model}</p>
        <p className="mb-4 text-sm text-neutral-400">{result.amp.why}</p>
        <div className="flex flex-wrap gap-3">
          {result.amp.settings.map((s) => (
            <Knob key={s.name} {...s} />
          ))}
        </div>
      </Section>

      {result.effects.length > 0 && (
        <Section title="Efekt zinciri">
          <ol className="space-y-4">
            {result.effects.map((fx, i) => (
              <li key={`${fx.type}-${i}`} className="rounded-lg border border-neutral-800 p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-neutral-950">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{fx.type}</span>
                  <span className="text-neutral-400">· {fx.model}</span>
                  <span className="ml-auto text-xs text-neutral-500">{POSITION[fx.position]}</span>
                </div>
                {fx.note && <p className="mb-3 text-sm text-neutral-400">{fx.note}</p>}
                <div className="flex flex-wrap gap-3">
                  {fx.settings.map((s) => (
                    <Knob key={s.name} {...s} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Gitar">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Manyetik", result.guitar.pickup],
            ["Volume", result.guitar.volume],
            ["Tone", result.guitar.tone],
            ["Akort", result.guitar.tuning],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-neutral-500">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {result.guitar.notes && <p className="mt-3 text-sm text-neutral-400">{result.guitar.notes}</p>}
      </Section>

      {result.adaptation_notes && (
        <Section title="Ekipmanına uyarlama">
          <p className="text-sm text-neutral-300">{result.adaptation_notes}</p>
        </Section>
      )}

      {result.playing_tips.length > 0 && (
        <Section title="Çalım ipuçları">
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
            {result.playing_tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
