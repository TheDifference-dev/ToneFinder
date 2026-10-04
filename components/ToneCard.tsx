import type { ToneResult } from "@/lib/schema";
import { Knob } from "./Knob";

const CONFIDENCE = {
  high: { label: "Yüksek güven", cls: "bg-emerald-500/15 text-emerald-300" },
  medium: { label: "Orta güven", cls: "bg-amber-500/15 text-amber-300" },
  low: { label: "Düşük güven", cls: "bg-rose-500/15 text-rose-300" },
} as const;

const CERTAINTY = {
  confirmed: { label: "kaynaklı", cls: "text-emerald-300 border-emerald-500/40" },
  likely: { label: "muhtemel", cls: "text-amber-300 border-amber-500/40" },
  guess: { label: "tahmin", cls: "text-rose-300 border-rose-500/40" },
} as const;

type Certainty = keyof typeof CERTAINTY;
type Setting = { name: string; value: string; note: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">{title}</h3>
      {children}
    </section>
  );
}

function Badge({ certainty }: { certainty: Certainty }) {
  const c = CERTAINTY[certainty];
  return <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase ${c.cls}`}>{c.label}</span>;
}

function InlineSettings({ settings }: { settings: Setting[] }) {
  if (settings.length === 0) return null;
  return (
    <p className="mt-1 text-xs text-neutral-400">
      {settings.map((s) => `${s.name} ${s.value}`).join(" · ")}
    </p>
  );
}

function Row({ label, certainty, children }: { label: string; certainty?: Certainty; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 border-b border-neutral-800/70 py-2 text-sm last:border-0">
      <div className="text-neutral-500">{label}</div>
      <div>
        <div className="flex flex-wrap items-center gap-2">{children}{certainty && <Badge certainty={certainty} />}</div>
      </div>
    </div>
  );
}

export function ToneCard({ result }: { result: ToneResult }) {
  const conf = CONFIDENCE[result.confidence];
  const rig = result.original_rig;

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
        {(result.song.bpm || result.song.key) && (
          <div className="mt-3 flex gap-2 text-xs">
            {result.song.bpm && <span className="rounded-md bg-neutral-800 px-2 py-1">⏱ {result.song.bpm}</span>}
            {result.song.key && <span className="rounded-md bg-neutral-800 px-2 py-1">🎼 {result.song.key}</span>}
          </div>
        )}
      </header>

      <Section title="Orijinal ekipman">
        <Row label="Gitar" certainty={rig.guitar.certainty}>
          <span className="font-medium">{rig.guitar.model}</span>
          <span className="text-neutral-400">· {rig.guitar.pickup}</span>
        </Row>
        {rig.amps.map((a, i) => (
          <Row key={`amp-${i}`} label="Amfi" certainty={a.certainty}>
            <div className="w-full">
              <span className="font-medium">{a.model}</span>
              {a.channel && <span className="text-neutral-400"> · {a.channel}</span>}
              <InlineSettings settings={a.settings} />
              {a.notes && <p className="mt-1 text-xs text-neutral-500">{a.notes}</p>}
            </div>
          </Row>
        ))}
        <Row label="Kabin" certainty={rig.cab.certainty}>
          <div className="w-full">
            <span className="font-medium">{rig.cab.model}</span>
            {rig.cab.speakers && <span className="text-neutral-400"> · {rig.cab.speakers}</span>}
            {rig.cab.notes && <p className="mt-1 text-xs text-neutral-500">{rig.cab.notes}</p>}
          </div>
        </Row>
        {rig.cab.mics.map((m, i) => (
          <Row key={`mic-${i}`} label="Mikrofon">
            <span className="font-medium">{m.model}</span>
            <span className="text-neutral-400">
              · {m.position} · {m.distance}
            </span>
          </Row>
        ))}
        {rig.pedals.map((p, i) => (
          <Row key={`pedal-${i}`} label="Pedal" certainty={p.certainty}>
            <div className="w-full">
              <span className="font-medium">{p.model}</span>
              <span className="text-neutral-400"> · {p.purpose}</span>
              <InlineSettings settings={p.settings} />
            </div>
          </Row>
        ))}
        <Row label="Akort">{rig.tuning}</Row>
        {rig.recording_notes && <p className="mt-3 text-sm text-neutral-400">{rig.recording_notes}</p>}
      </Section>

      <Section title="Senin cihazında sinyal zinciri">
        <ol className="space-y-4">
          {result.chain.map((b, i) => (
            <li key={`${b.block}-${i}`} className="rounded-lg border border-neutral-800 p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-neutral-950">
                  {i + 1}
                </span>
                <span className="text-xs uppercase tracking-wide text-neutral-500">{b.block}</span>
                <span className="font-semibold text-amber-300">{b.device_model}</span>
                {b.source === "user_pedal" && (
                  <span className="rounded border border-sky-500/40 px-1.5 py-0.5 text-[10px] uppercase text-sky-300">
                    senin pedalın
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-neutral-400">≈ {b.emulates}</p>
              <div className="flex flex-wrap gap-3">
                {b.settings.map((s) => (
                  <Knob key={s.name} {...s} />
                ))}
              </div>
              {b.note && <p className="mt-3 text-sm text-neutral-400">{b.note}</p>}
            </li>
          ))}
        </ol>
      </Section>

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
        {result.guitar.compensation.length > 0 && (
          <div className="mt-4 rounded-lg bg-neutral-800/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Gitar farkı telafisi</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
              {result.guitar.compensation.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
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

      {result.sources.length > 0 && (
        <Section title="Kaynaklar">
          <ul className="space-y-1 text-sm">
            {result.sources.map((s) => (
              <li key={s.url} className="truncate">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
