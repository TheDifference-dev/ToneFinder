import type { ToneResult } from "@/lib/schema";
import { Knob } from "./Knob";

const CONFIDENCE = {
  high: { label: "Yüksek güven", cls: "border-ok/40 bg-ok/10 text-ok" },
  medium: { label: "Orta güven", cls: "border-warn/40 bg-warn/10 text-warn" },
  low: { label: "Düşük güven", cls: "border-bad/40 bg-bad/10 text-bad" },
} as const;

const CERTAINTY = {
  confirmed: { label: "kaynaklı", cls: "border-ok/40 text-ok" },
  likely: { label: "muhtemel", cls: "border-warn/40 text-warn" },
  guess: { label: "tahmin", cls: "border-bad/40 text-bad" },
} as const;

// Zincirdeki her blok kullanıcının hangi ekipmanında ayarlanıyor
const SOURCE = {
  pedal: { label: "pedalın", strip: "border-signal/60 bg-signal/10" },
  processor: { label: "prosesör", strip: "border-accent/30 bg-accent-soft" },
  amp: { label: "amfin", strip: "border-ink/40 bg-ink/5" },
} as const;

type Certainty = keyof typeof CERTAINTY;
type Setting = { name: string; value: string; note: string };

function Panel({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <section className="hud-panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="hud-label text-accent">{code}</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{title}</h3>
        <span className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}

function Badge({ certainty }: { certainty: Certainty }) {
  const c = CERTAINTY[certainty];
  return <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${c.cls}`}>{c.label}</span>;
}

function InlineSettings({ settings }: { settings: Setting[] }) {
  if (settings.length === 0) return null;
  return <p className="mt-1 font-mono text-xs text-ink-mute">{settings.map((s) => `${s.name} ${s.value}`).join(" · ")}</p>;
}

function Row({ label, certainty, children }: { label: string; certainty?: Certainty; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 border-b border-line/70 py-2.5 text-sm last:border-0">
      <div className="hud-label pt-0.5">{label}</div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        {certainty && <Badge certainty={certainty} />}
      </div>
    </div>
  );
}

export function ToneCard({ result }: { result: ToneResult }) {
  const conf = CONFIDENCE[result.confidence];
  const rig = result.original_rig;

  return (
    <div className="space-y-5">
      <header className="hud-panel overflow-hidden p-6">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent-soft to-transparent" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="hud-label mb-1">Hedef ton</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">{result.song.title}</h2>
            <p className="text-ink-soft">
              {result.song.artist}
              {result.song.album_or_year && ` · ${result.song.album_or_year}`}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold ${conf.cls}`}>{conf.label}</span>
        </div>
        <p className="relative mt-4 max-w-2xl text-ink">{result.song.tone_character}</p>
        {(result.song.bpm || result.song.key) && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {result.song.bpm && (
              <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-xs text-ink">
                TEMPO <b className="text-accent">{result.song.bpm}</b>
              </span>
            )}
            {result.song.key && (
              <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-xs text-ink">
                TON <b className="text-accent">{result.song.key}</b>
              </span>
            )}
          </div>
        )}
      </header>

      <Panel title="Senin ekipmanınla sinyal zinciri" code="01">
        <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-line-strong bg-paper p-3">
          <span className="hud-label mr-1">Gitar</span>
          {result.chain.map((b, i) => (
            <span key={`strip-${i}`} className="flex items-center gap-1.5">
              <span className="text-ink-mute">→</span>
              <span
                className={`rounded-md border px-2 py-1 text-xs font-semibold text-ink ${SOURCE[b.source].strip}`}
              >
                {b.device_model}
              </span>
            </span>
          ))}
          <span className="text-ink-mute">→</span>
          <span className="hud-label">Çıkış</span>
        </div>

        <ol className="space-y-3">
          {result.chain.map((b, i) => (
            <li key={`${b.block}-${i}`} className="rounded-lg border border-line bg-white p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-ink font-mono text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="hud-label">{b.block}</span>
                <span className="text-base font-bold text-ink">{b.device_model}</span>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink ${SOURCE[b.source].strip}`}>
                  {SOURCE[b.source].label}
                </span>
              </div>
              <p className="mb-3 text-sm text-ink-soft">≈ {b.emulates}</p>
              <div className="flex flex-wrap gap-3">
                {b.settings.map((s) => (
                  <Knob key={s.name} {...s} />
                ))}
              </div>
              {b.note && <p className="mt-3 border-t border-line/70 pt-2 text-sm text-ink-soft">{b.note}</p>}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Gitar" code="02">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Manyetik", result.guitar.pickup],
            ["Volume", result.guitar.volume],
            ["Tone", result.guitar.tone],
            ["Akort", result.guitar.tuning],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-paper p-3">
              <dt className="hud-label">{k}</dt>
              <dd className="mt-1 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {result.guitar.notes && <p className="mt-3 text-sm text-ink-soft">{result.guitar.notes}</p>}
        {result.guitar.compensation.length > 0 && (
          <div className="mt-4 rounded-lg border border-accent/30 bg-accent-soft p-4">
            <p className="hud-label mb-2 text-accent">Gitar farkı telafisi</p>
            <ul className="space-y-1.5 text-sm text-ink">
              {result.guitar.compensation.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-accent">▸</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Panel title="Orijinal ekipman" code="03">
        <Row label="Gitar" certainty={rig.guitar.certainty}>
          <span className="font-semibold">{rig.guitar.model}</span>
          <span className="text-ink-soft"> · {rig.guitar.pickup}</span>
        </Row>
        {rig.amps.map((a, i) => (
          <Row key={`amp-${i}`} label="Amfi" certainty={a.certainty}>
            <span className="font-semibold">{a.model}</span>
            {a.channel && <span className="text-ink-soft"> · {a.channel}</span>}
            <InlineSettings settings={a.settings} />
            {a.notes && <p className="mt-1 text-xs text-ink-mute">{a.notes}</p>}
          </Row>
        ))}
        <Row label="Kabin" certainty={rig.cab.certainty}>
          <span className="font-semibold">{rig.cab.model}</span>
          {rig.cab.speakers && <span className="text-ink-soft"> · {rig.cab.speakers}</span>}
          {rig.cab.notes && <p className="mt-1 text-xs text-ink-mute">{rig.cab.notes}</p>}
        </Row>
        {rig.cab.mics.map((m, i) => (
          <Row key={`mic-${i}`} label="Mikrofon">
            <span className="font-semibold">{m.model}</span>
            <span className="text-ink-soft">
              {" "}
              · {m.position} · {m.distance}
            </span>
          </Row>
        ))}
        {rig.pedals.map((p, i) => (
          <Row key={`pedal-${i}`} label="Pedal" certainty={p.certainty}>
            <span className="font-semibold">{p.model}</span>
            <span className="text-ink-soft"> · {p.purpose}</span>
            <InlineSettings settings={p.settings} />
          </Row>
        ))}
        <Row label="Akort">{rig.tuning}</Row>
        {rig.recording_notes && <p className="mt-3 text-sm text-ink-soft">{rig.recording_notes}</p>}
      </Panel>

      {(result.adaptation_notes || result.playing_tips.length > 0) && (
        <Panel title="Uyarlama ve çalım" code="04">
          {result.adaptation_notes && <p className="text-sm text-ink">{result.adaptation_notes}</p>}
          {result.playing_tips.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              {result.playing_tips.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-accent">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {result.sources.length > 0 && (
        <Panel title="Kaynaklar" code="05">
          <ul className="space-y-1 text-sm">
            {result.sources.map((s) => (
              <li key={s.url} className="truncate">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
