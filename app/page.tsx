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

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-amber-400";

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Tone<span className="text-amber-400">Finder</span>
        </h1>
        <p className="text-neutral-400">
          Bir şarkı yaz, yapay zekâ o tonu senin ekipmanına göre birebir ayarlara çevirsin.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 font-semibold">🎛️ Ekipmanım</h2>
            {rig && (
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-neutral-400">Amfi / modelleyici</span>
                  <select className={input} value={rig.deviceId} onChange={(e) => updateRig({ deviceId: e.target.value })}>
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
                </label>
                {rig.deviceId === "custom" && (
                  <input
                    className={input}
                    placeholder="ör. Laney Cub-Super12"
                    value={rig.customDevice}
                    onChange={(e) => updateRig({ customDevice: e.target.value })}
                  />
                )}
                <label className="block text-sm">
                  <span className="mb-1 block text-neutral-400">Gitar</span>
                  <input
                    className={input}
                    placeholder="ör. Fender Player Stratocaster"
                    value={rig.guitar}
                    onChange={(e) => updateRig({ guitar: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-neutral-400">Manyetikler</span>
                  <select className={input} value={rig.pickups} onChange={(e) => updateRig({ pickups: e.target.value })}>
                    {PICKUP_CONFIGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-neutral-400">Ek pedallar (isteğe bağlı)</span>
                  <textarea
                    className={`${input} min-h-16`}
                    placeholder="ör. Ibanez TS9, Boss DD-8"
                    value={rig.pedals}
                    onChange={(e) => updateRig({ pedals: e.target.value })}
                  />
                </label>
                <p className="text-xs text-neutral-500">Ekipmanın bu tarayıcıda otomatik kaydedilir.</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 font-semibold">⭐ Kaydedilen tonlar</h2>
            {saved.length === 0 ? (
              <p className="text-sm text-neutral-500">Henüz kayıtlı ton yok.</p>
            ) : (
              <ul className="space-y-2">
                {saved.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setCurrent(s)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                        current?.id === s.id ? "bg-neutral-800" : ""
                      }`}
                    >
                      <div className="font-medium">{s.result.song.title}</div>
                      <div className="text-xs text-neutral-500">
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
          <form onSubmit={findTone} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={input}
                placeholder="Şarkı (ör. Comfortably Numb)"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                required
              />
              <input
                className={input}
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
                  className={`rounded-full border px-3 py-1 text-sm ${
                    part === p.id
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="submit"
                disabled={loading || !song.trim()}
                className="ml-auto rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-300 disabled:opacity-50"
              >
                {loading ? "Ton aranıyor…" : "Tonu bul"}
              </button>
            </div>
            <input
              className={`${input} mt-3`}
              placeholder="Bölüm detayı (isteğe bağlı) — ör. 2. solo, giriş riffi, nakarat ritmi"
              value={partDetail}
              onChange={(e) => setPartDetail(e.target.value)}
            />
          </form>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
          )}

          {loading && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <p className="mb-3 animate-pulse text-neutral-300">
                🎸 Araştırılıyor… ({rig && deviceLabel(rig)}) — bu işlem 1–3 dakika sürebilir.
              </p>
              <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
                {log.map((e, i) => (
                  <li key={i} className="truncate text-neutral-400">
                    {e.type === "status" && <span className="text-neutral-200">{e.message}</span>}
                    {e.type === "search" && <>🔎 {e.query}</>}
                    {e.type === "fetch" && <>📄 {hostOf(e.url)} okunuyor</>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {current && !loading && (
            <div>
              <div className="mb-3 flex items-center justify-between text-sm text-neutral-400">
                <span>
                  {current.part} · {current.deviceLabel}
                </span>
                <button
                  onClick={() => toggleSave(current)}
                  className="rounded-lg border border-neutral-700 px-3 py-1 hover:border-amber-400 hover:text-amber-300"
                >
                  {isSaved ? "★ Kaydedildi" : "☆ Kaydet"}
                </button>
              </div>
              <ToneCard result={current.result} />
            </div>
          )}

          {!current && !loading && !error && (
            <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
              Soldan ekipmanını seç, sonra bir şarkı ara.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
