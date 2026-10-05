"use client";

import { useEffect, useState } from "react";
import { RigPanel } from "@/components/RigPanel";
import { SettingsPanel, type KeyStatus } from "@/components/SettingsPanel";
import { ToneCard } from "@/components/ToneCard";
import { PARTS, type UserRig } from "@/lib/gear";
import type { ToneEvent, ToneResult } from "@/lib/schema";
import { loadRig, loadSaved, saveRig, storeSaved, type SavedTone } from "@/lib/storage";

function rigLabel(rig: UserRig) {
  const parts = [rig.amp, rig.processor].map((s) => s.trim()).filter((s) => s && !/^yok$/i.test(s));
  return parts.join(" + ") || "—";
}

async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ToneEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) yield JSON.parse(line) as ToneEvent;
  }
  if (buffer.trim()) yield JSON.parse(buffer) as ToneEvent;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Head({ code, title }: { code: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="hud-label text-accent">{code}</span>
      <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export default function Home() {
  const [rig, setRig] = useState<UserRig | null>(null);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [part, setPart] = useState("lead");
  const [partDetail, setPartDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<ToneEvent[]>([]);
  const [current, setCurrent] = useState<SavedTone | null>(null);
  const [saved, setSaved] = useState<SavedTone[]>([]);

  useEffect(() => {
    setRig(loadRig());
    setSaved(loadSaved());
    fetch("/api/settings")
      .then((r) => r.json() as Promise<KeyStatus>)
      .then(setKeyStatus)
      .catch(() => setKeyStatus({ configured: false, source: null }));
  }, []);

  function updateRig(patch: Partial<UserRig>) {
    setRig((prev) => {
      const next = { ...(prev as UserRig), ...patch };
      saveRig(next);
      return next;
    });
  }

  const hasGear = Boolean(rig && (rig.amp.trim() || rig.processor.trim()));

  async function findTone(e: React.FormEvent) {
    e.preventDefault();
    if (!rig || !song.trim() || !hasGear) return;
    setLoading(true);
    setError(null);
    setLog([]);
    try {
      const res = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song, artist, part, partDetail, rig }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        if (data.code === "no_api_key") {
          setKeyStatus({ configured: false, source: null });
          return;
        }
        throw new Error(data.error ?? "Bir şeyler ters gitti.");
      }

      let result: ToneResult | null = null;
      for await (const event of readEvents(res.body)) {
        if (event.type === "result") result = event.result;
        else if (event.type === "error") throw new Error(event.error);
        else setLog((prev) => [...prev, event]);
      }
      if (!result) throw new Error("Bağlantı yarıda kesildi, lütfen tekrar dene.");

      setCurrent({
        id: crypto.randomUUID(),
        savedAt: Date.now(),
        deviceLabel: rigLabel(rig),
        part: [PARTS.find((p) => p.id === part)?.label ?? part, partDetail.trim()].filter(Boolean).join(" · "),
        result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSave(tone: SavedTone) {
    const exists = saved.some((s) => s.id === tone.id);
    const next = exists ? saved.filter((s) => s.id !== tone.id) : [tone, ...saved];
    setSaved(next);
    storeSaved(next);
  }

  const isSaved = current ? saved.some((s) => s.id === current.id) : false;
  const needsKey = keyStatus !== null && !keyStatus.configured;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="hud-panel mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="9" fill="none" stroke="#fff" strokeWidth="2" />
              <line x1="11" y1="11" x2="16" y2="6" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-ink">
              TONE<span className="text-accent">FINDER</span>
            </h1>
            <p className="hud-label">Yapay zekâ ton motoru</p>
          </div>
        </div>
        <p className="hidden max-w-md text-sm text-ink-soft md:block">
          Ünlü bir şarkının stüdyo kaydında kullanılan ekipmanı bulur, o tonu senin amfine, gitarına ve pedallarına göre
          ayarlara çevirir.
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="max-w-64 truncate rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">
            RİG <b className="text-accent">{rig ? rigLabel(rig) : "—"}</b>
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">
            <span className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-signal" : needsKey ? "bg-bad" : "bg-ok"}`} />
            {loading ? "ARAŞTIRIYOR" : needsKey ? "KURULUM GEREKLİ" : "HAZIR"}
          </span>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="rounded-md border border-line bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-ink hover:border-accent hover:text-accent"
          >
            AYARLAR
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          {rig && <RigPanel rig={rig} onChange={updateRig} />}

          <section className="hud-panel p-5">
            <Head code="MEM" title="Kayıtlı tonlar" />
            {saved.length === 0 ? (
              <p className="text-sm text-ink-mute">Henüz kayıtlı ton yok.</p>
            ) : (
              <ul className="space-y-1.5">
                {saved.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setCurrent(s)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        current?.id === s.id ? "border-accent bg-accent-soft" : "border-transparent hover:border-line hover:bg-paper"
                      }`}
                    >
                      <div className="font-semibold text-ink">{s.result.song.title}</div>
                      <div className="text-xs text-ink-mute">
                        {s.result.song.artist} · {s.part} · {s.deviceLabel}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <div className="space-y-6">
          {keyStatus && (needsKey || settingsOpen) && (
            <SettingsPanel
              status={keyStatus}
              onSaved={(s) => {
                setKeyStatus(s);
                if (s.configured) setSettingsOpen(false);
              }}
              onClose={() => setSettingsOpen(false)}
            />
          )}

          <form onSubmit={findTone} className="hud-panel p-5">
            <Head code="SRC" title="Şarkı" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="hud-input"
                placeholder="Şarkı (ör. Master of Puppets)"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                required
                aria-label="Şarkı"
              />
              <input
                className="hud-input"
                placeholder="Sanatçı (ör. Metallica)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                aria-label="Sanatçı"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Bölüm">
              {PARTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPart(p.id)}
                  aria-pressed={part === p.id}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    part === p.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="hud-input"
                placeholder="Hangi bölüm? (isteğe bağlı) — ör. Kirk Hammett'ın 2. solosu, giriş riffi"
                value={partDetail}
                onChange={(e) => setPartDetail(e.target.value)}
                aria-label="Bölüm detayı"
              />
              <button
                type="submit"
                disabled={loading || !song.trim() || !hasGear || needsKey}
                className="shrink-0 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink disabled:opacity-40"
              >
                {loading ? "Aranıyor…" : "Tonu bul"}
              </button>
            </div>
          </form>

          {error && (
            <div className="hud-panel border-bad/40 p-4 text-sm text-bad" role="alert">
              <span className="hud-label mr-2 text-bad">HATA</span>
              {error}
            </div>
          )}

          {loading && (
            <div className="hud-panel hud-scan p-5" aria-live="polite">
              <p className="mb-3 font-semibold text-ink">
                Araştırılıyor… <span className="font-normal text-ink-soft">— genelde 1–3 dakika sürer</span>
              </p>
              <ul className="max-h-72 space-y-1 overflow-y-auto font-mono text-xs">
                {log.map((e, i) => (
                  <li key={i} className="truncate text-ink-soft">
                    {e.type === "status" && <span className="font-semibold text-ink">» {e.message}</span>}
                    {e.type === "search" && <>⌕ {e.query}</>}
                    {e.type === "fetch" && <>↳ {hostOf(e.url)} okunuyor</>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {current && !loading && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="hud-label">
                  {current.part} · {current.deviceLabel}
                </span>
                <button
                  onClick={() => toggleSave(current)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                    isSaved ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-ink hover:border-accent"
                  }`}
                >
                  {isSaved ? "★ Kaydedildi" : "☆ Kaydet"}
                </button>
              </div>
              <ToneCard result={current.result} />
            </div>
          )}

          {!current && !loading && !error && (
            <div className="hud-panel p-8">
              <p className="hud-label mb-3 text-center">Nasıl çalışır</p>
              <ol className="mx-auto grid max-w-xl gap-3 text-ink-soft">
                <li>
                  <b className="font-mono text-accent">1.</b> Solda amfini, varsa prosesörünü, gitarını ve pedallarını yaz.
                </li>
                <li>
                  <b className="font-mono text-accent">2.</b> Şarkıyı ve bölümü seç (ör. Solo, &quot;2. solo&quot;).
                </li>
                <li>
                  <b className="font-mono text-accent">3.</b> ToneFinder stüdyo kaydında kullanılan gitarı, amfiyi, kabini,
                  mikrofonu ve pedalları araştırır; sonra senin amfi, gitar ve pedal ayarlarını düğme düğme verir.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
