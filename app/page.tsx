"use client";

import { useEffect, useState } from "react";
import { ToneCard } from "@/components/ToneCard";
import { DEVICES, PARTS, PICKUP_CONFIGS, findDevice, type DeviceCategory, type UserRig } from "@/lib/gear";
import type { ToneEvent, ToneResult } from "@/lib/schema";
import { loadRig, loadSaved, saveRig, storeSaved, type SavedTone } from "@/lib/storage";

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  "modeling-amp": "Modelleme amfileri",
  modeler: "Modelleyiciler",
  "multi-fx": "Multi-efekt",
  "tube-amp": "Lambalı amfiler",
};

function deviceLabel(rig: UserRig) {
  return rig.deviceId === "custom" ? rig.customDevice || "Diğer" : (findDevice(rig.deviceId)?.name ?? rig.deviceId);
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

export default function Home() {
  const [rig, setRig] = useState<UserRig | null>(null);
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [part, setPart] = useState("full");
  const [partDetail, setPartDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<ToneEvent[]>([]);
  const [current, setCurrent] = useState<SavedTone | null>(null);
  const [saved, setSaved] = useState<SavedTone[]>([]);

  useEffect(() => {
    setRig(loadRig());
    setSaved(loadSaved());
  }, []);

  function updateRig(patch: Partial<UserRig>) {
    setRig((prev) => {
      const next = { ...(prev as UserRig), ...patch };
      saveRig(next);
      return next;
    });
  }

  async function findTone(e: React.FormEvent) {
    e.preventDefault();
    if (!rig || !song.trim()) return;
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
        const data = (await res.json().catch(() => ({}))) as { error?: string };
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
        deviceLabel: deviceLabel(rig),
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

  const device = rig && rig.deviceId !== "custom" ? findDevice(rig.deviceId) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="hud-panel mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-lg text-white" aria-hidden>
            ◉
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-ink">
              TONE<span className="text-accent">FINDER</span>
            </h1>
            <p className="hud-label">Yapay zekâ ton motoru</p>
          </div>
        </div>
        <p className="hidden max-w-md text-sm text-ink-soft md:block">
          Bir şarkı yaz; yapay zekâ orijinal ekipmanı bulsun ve o tonu senin ekipmanına göre ayarlara çevirsin.
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">
            RİG <b className="text-accent">{rig ? deviceLabel(rig) : "—"}</b>
          </span>
          <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">
            MANYETİK <b className="text-accent">{rig?.pickups ?? "—"}</b>
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">
            <span className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-signal" : "bg-ok"}`} />
            {loading ? "ARAŞTIRIYOR" : "HAZIR"}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        <aside className="space-y-6">
          <section className="hud-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="hud-label text-accent">RIG</span>
              <h2 className="text-sm font-bold uppercase tracking-wider">Ekipmanım</h2>
              <span className="h-px flex-1 bg-line" />
            </div>
            {rig && (
              <div className="space-y-4">
                <label className="block">
                  <span className="hud-label mb-1.5 block">Amfi / prosesör</span>
                  <select className="hud-input" value={rig.deviceId} onChange={(e) => updateRig({ deviceId: e.target.value })}>
                    {(Object.keys(CATEGORY_LABELS) as DeviceCategory[]).map((cat) => (
                      <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                        {DEVICES.filter((d) => d.category === cat).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">Diğer (kendim yazacağım)</option>
                  </select>
                  <span className="mt-1.5 block text-xs text-ink-mute">
                    {device?.verified
                      ? "✓ Doğrulanmış model listesi hazır"
                      : "Model listesi araştırma sırasında web'den bulunur"}
                  </span>
                </label>
                {rig.deviceId === "custom" && (
                  <input
                    className="hud-input"
                    placeholder="ör. Laney Cub-Super12, Fractal FM3"
                    value={rig.customDevice}
                    onChange={(e) => updateRig({ customDevice: e.target.value })}
                  />
                )}
                <label className="block">
                  <span className="hud-label mb-1.5 block">Gitar</span>
                  <input
                    className="hud-input"
                    placeholder="ör. Fender Player Stratocaster"
                    value={rig.guitar}
                    onChange={(e) => updateRig({ guitar: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="hud-label mb-1.5 block">Manyetikler</span>
                  <select className="hud-input" value={rig.pickups} onChange={(e) => updateRig({ pickups: e.target.value })}>
                    {PICKUP_CONFIGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="hud-label mb-1.5 block">Pedallarım (isteğe bağlı)</span>
                  <textarea
                    className="hud-input min-h-16"
                    placeholder="ör. Ibanez TS9, Boss DD-8"
                    value={rig.pedals}
                    onChange={(e) => updateRig({ pedals: e.target.value })}
                  />
                </label>
                <p className="text-xs text-ink-mute">Ekipmanın bu bilgisayarda otomatik kaydedilir.</p>
              </div>
            )}
          </section>

          <section className="hud-panel p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="hud-label text-accent">MEM</span>
              <h2 className="text-sm font-bold uppercase tracking-wider">Kayıtlı tonlar</h2>
              <span className="h-px flex-1 bg-line" />
            </div>
            {saved.length === 0 ? (
              <p className="text-sm text-ink-mute">Henüz kayıtlı ton yok.</p>
            ) : (
              <ul className="space-y-1.5">
                {saved.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setCurrent(s)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        current?.id === s.id
                          ? "border-accent bg-accent-soft"
                          : "border-transparent hover:border-line hover:bg-paper"
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
          <form onSubmit={findTone} className="hud-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="hud-label text-accent">SRC</span>
              <h2 className="text-sm font-bold uppercase tracking-wider">Şarkı</h2>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="hud-input"
                placeholder="Şarkı (ör. Comfortably Numb)"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                required
              />
              <input
                className="hud-input"
                placeholder="Sanatçı (ör. Pink Floyd)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {PARTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPart(p.id)}
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
                placeholder="Bölüm detayı (isteğe bağlı) — ör. 2. solo, giriş riffi"
                value={partDetail}
                onChange={(e) => setPartDetail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !song.trim()}
                className="shrink-0 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink disabled:opacity-40"
              >
                {loading ? "Aranıyor…" : "Tonu bul"}
              </button>
            </div>
          </form>

          {error && (
            <div className="hud-panel border-bad/40 p-4 text-sm text-bad">
              <span className="hud-label mr-2 text-bad">HATA</span>
              {error}
            </div>
          )}

          {loading && (
            <div className="hud-panel hud-scan p-5">
              <p className="mb-3 font-semibold text-ink">
                Araştırılıyor… <span className="font-normal text-ink-soft">({rig && deviceLabel(rig)}) — 1–3 dakika sürebilir</span>
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
            <div className="hud-panel flex flex-col items-center gap-2 p-12 text-center">
              <span className="hud-label">Bekleniyor</span>
              <p className="text-ink-soft">Soldan ekipmanını seç, sonra bir şarkı ara.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
