"use client";

import { useEffect, useState } from "react";
import { RigPanel } from "@/components/RigPanel";
import { SettingsPanel, type KeyStatus } from "@/components/SettingsPanel";
import { SongSearch } from "@/components/SongSearch";
import { ToneCard } from "@/components/ToneCard";
import { toneText } from "@/lib/format";
import { INSTRUMENTS, PARTS, TONE_TYPES, type Instrument, type ToneType, type UserRig } from "@/lib/gear";
import type { PartialTone, ToneEvent, ToneMeta, ToneResult } from "@/lib/schema";
import {
  createRigId,
  loadHistory,
  loadRigs,
  loadSaved,
  parseToneFile,
  saveRigs,
  storeHistory,
  storeSaved,
  toneFile,
  type RigStore,
  type SavedTone,
  type SongQuery,
} from "@/lib/storage";

// Boş ekranda tek tıkla doldurulan örnek şarkılar
const QUICK_PICKS: { song: string; artist: string; part: string; detail?: string }[] = [
  { song: "Master of Puppets", artist: "Metallica", part: "rhythm" },
  { song: "Sweet Child O' Mine", artist: "Guns N' Roses", part: "intro" },
  { song: "Comfortably Numb", artist: "Pink Floyd", part: "lead", detail: "son solo" },
  { song: "Enter Sandman", artist: "Metallica", part: "intro" },
  { song: "Hotel California", artist: "Eagles", part: "lead" },
  { song: "Smells Like Teen Spirit", artist: "Nirvana", part: "rhythm" },
  { song: "Pride and Joy", artist: "Stevie Ray Vaughan", part: "full" },
  { song: "Back in Black", artist: "AC/DC", part: "intro" },
];

function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="hud-label mr-1">{label}</span>
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
            value === o.id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

const fileSlug = (t: string) =>
  t
    .toLocaleLowerCase("tr")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "ton";

export default function Home() {
  const [rigStore, setRigStore] = useState<RigStore | null>(null);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [part, setPart] = useState("lead");
  const [partDetail, setPartDetail] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [toneType, setToneType] = useState<ToneType>("auto");
  const [artwork, setArtwork] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<ToneEvent[]>([]);
  const [current, setCurrent] = useState<SavedTone | null>(null);
  const [partial, setPartial] = useState<PartialTone | null>(null);
  const [saved, setSaved] = useState<SavedTone[]>([]);
  const [history, setHistory] = useState<SavedTone[]>([]);
  const [listTab, setListTab] = useState<"saved" | "history">("saved");

  const activeRig = rigStore?.rigs.find((r) => r.id === rigStore.activeId) ?? null;
  const rig = activeRig?.rig ?? null;

  useEffect(() => {
    setRigStore(loadRigs());
    setSaved(loadSaved());
    setHistory(loadHistory());
    fetch("/api/settings")
      .then((r) => r.json() as Promise<KeyStatus>)
      .then(setKeyStatus)
      .catch(() => setKeyStatus({ configured: false, source: null }));
  }, []);

  function changeRigs(update: (store: RigStore) => RigStore) {
    setRigStore((prev) => {
      if (!prev) return prev;
      const next = update(prev);
      saveRigs(next);
      return next;
    });
  }

  function updateRig(patch: Partial<UserRig>) {
    changeRigs((st) => ({ ...st, rigs: st.rigs.map((r) => (r.id === st.activeId ? { ...r, rig: { ...r.rig, ...patch } } : r)) }));
  }

  const rigActions = {
    onRigSelect: (id: string) => changeRigs((st) => ({ ...st, activeId: id })),
    onRigCreate: () =>
      changeRigs((st) => {
        const base = st.rigs.find((r) => r.id === st.activeId);
        const id = createRigId();
        return { activeId: id, rigs: [...st.rigs, { id, name: `Rig ${st.rigs.length + 1}`, rig: structuredClone(base!.rig) }] };
      }),
    onRigRename: (name: string) =>
      changeRigs((st) => ({ ...st, rigs: st.rigs.map((r) => (r.id === st.activeId ? { ...r, name } : r)) })),
    onRigDelete: () =>
      changeRigs((st) => {
        const rigs = st.rigs.filter((r) => r.id !== st.activeId);
        return rigs.length ? { activeId: rigs[0].id, rigs } : st;
      }),
  };

  const hasGear = Boolean(rig && (rig.amp.trim() || rig.processor.trim()));

  /** Araştırmayı başlatır. fresh: kayıtlı orijinal araştırmayı yenile; feedback: yalnız uyarlamayı yenile */
  async function runTone(query: SongQuery, opts: { fresh?: boolean; feedback?: string; previous?: SavedTone; artwork?: string } = {}) {
    if (!rig || !query.song.trim() || !hasGear) return;
    setLoading(true);
    setError(null);
    setLog([]);
    setPartial(null);
    try {
      const res = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...query,
          rig,
          fresh: opts.fresh ?? false,
          feedback: opts.feedback ?? "",
          previous: opts.feedback ? opts.previous?.result : undefined,
        }),
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
      let meta: ToneMeta | undefined;
      for await (const event of readEvents(res.body)) {
        if (event.type === "result") {
          result = event.result;
          meta = event.meta;
        } else if (event.type === "original") setPartial(event.original);
        else if (event.type === "error") throw new Error(event.error);
        else setLog((prev) => [...prev, event]);
      }
      if (!result) throw new Error("Bağlantı yarıda kesildi, lütfen tekrar dene.");

      setFeedback("");
      const tone: SavedTone = {
        id: crypto.randomUUID(),
        savedAt: Date.now(),
        deviceLabel: rigLabel(rig),
        part: [PARTS.find((p) => p.id === query.part)?.label ?? query.part, query.partDetail.trim()].filter(Boolean).join(" · "),
        result,
        query,
        artwork: opts.artwork ?? opts.previous?.artwork ?? "",
        meta,
        rigName: activeRig?.name,
        pickupLayout: rig.pickups,
      };
      setCurrent(tone);
      setHistory((prev) => {
        const next = [tone, ...prev].slice(0, 20);
        storeHistory(next);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
      setPartial(null);
    }
  }

  function removeFrom(list: "saved" | "history", id: string) {
    if (list === "saved") {
      const next = saved.filter((s) => s.id !== id);
      setSaved(next);
      storeSaved(next);
    } else {
      const next = history.filter((s) => s.id !== id);
      setHistory(next);
      storeHistory(next);
    }
  }

  async function importTone(file: File) {
    const tone = parseToneFile(await file.text());
    if (!tone) {
      setError("Bu dosya bir ToneFinder ton dosyası değil.");
      return;
    }
    const next = [tone, ...saved];
    setSaved(next);
    storeSaved(next);
    setCurrent(tone);
    setListTab("saved");
  }

  function findTone(e: React.FormEvent) {
    e.preventDefault();
    void runTone({ song, artist, part, partDetail, instrument, toneType }, { artwork });
  }

  async function copyTone(tone: SavedTone) {
    try {
      await navigator.clipboard.writeText(toneText(tone.result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Panoya kopyalanamadı.");
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
          {rig && rigStore && (
            <RigPanel
              rig={rig}
              onChange={updateRig}
              rigs={rigStore.rigs}
              activeId={rigStore.activeId}
              {...rigActions}
              canIdentify={keyStatus?.configured ?? false}
            />
          )}

          <section className="hud-panel p-5">
            <Head code="MEM" title="Tonlarım" />
            <div className="mb-3 flex items-center gap-1.5" role="tablist">
              {(
                [
                  ["saved", `Kayıtlı (${saved.length})`],
                  ["history", `Geçmiş (${history.length})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={listTab === id}
                  onClick={() => setListTab(id)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    listTab === id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft"
                  }`}
                >
                  {label}
                </button>
              ))}
              <label className="ml-auto cursor-pointer rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent">
                İçe aktar
                <input
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importTone(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {(listTab === "saved" ? saved : history).length === 0 ? (
              <p className="text-sm text-ink-mute">
                {listTab === "saved" ? "Henüz kayıtlı ton yok." : "Son 20 sonuç burada tutulur."}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {(listTab === "saved" ? saved : history).map((s) => (
                  <li key={s.id} className="group flex items-stretch gap-1">
                    <button
                      onClick={() => setCurrent(s)}
                      className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
                        current?.id === s.id ? "border-accent bg-accent-soft" : "border-transparent hover:border-line hover:bg-paper"
                      }`}
                    >
                      <div className="truncate font-semibold text-ink">{s.result.song.title}</div>
                      <div className="truncate text-xs text-ink-mute">
                        {s.result.song.artist} · {s.part} · {s.rigName ?? s.deviceLabel}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFrom(listTab, s.id)}
                      className="shrink-0 rounded-md px-2 text-ink-mute opacity-60 hover:bg-paper hover:text-bad group-hover:opacity-100"
                      aria-label={`${s.result.song.title} sil`}
                      title="Listeden sil"
                    >
                      ✕
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
            <SongSearch
              song={song}
              artist={artist}
              artwork={artwork}
              onChange={(p) => {
                if (p.song !== undefined) setSong(p.song);
                if (p.artist !== undefined) setArtist(p.artist);
                if (p.artwork !== undefined) setArtwork(p.artwork);
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Chips label="Enstrüman" options={INSTRUMENTS} value={instrument} onChange={setInstrument} />
              <Chips label="Ton" options={TONE_TYPES} value={toneType} onChange={setToneType} />
            </div>
            <div className="mt-3">
              <Chips label="Bölüm" options={PARTS} value={part} onChange={setPart} />
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
            {!current && !loading && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="hud-label mr-1">Popüler</span>
                {QUICK_PICKS.map((q) => (
                  <button
                    type="button"
                    key={q.song}
                    onClick={() => {
                      setSong(q.song);
                      setArtist(q.artist);
                      setPart(q.part);
                      setPartDetail(q.detail ?? "");
                      setArtwork("");
                    }}
                    className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent"
                  >
                    {q.song} · {q.artist}
                  </button>
                ))}
              </div>
            )}
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
                {partial ? "Uyarlanıyor…" : "Araştırılıyor…"}{" "}
                <span className="font-normal text-ink-soft">— genelde 1–3 dakika sürer</span>
              </p>
              <ul className={`${partial ? "max-h-24" : "max-h-72"} space-y-1 overflow-y-auto font-mono text-xs`}>
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

          {loading && partial && <ToneCard result={partial} pending />}

          {current && !loading && (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="hud-label mr-auto">
                  {current.part} · {current.deviceLabel}
                </span>
                <button
                  onClick={() => download(`${fileSlug(current.result.song.title)}.tonefinder.json`, toneFile(current))}
                  className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-accent"
                  title="Başka bir bilgisayara ya da arkadaşına göndermek için dosya olarak indir"
                >
                  Dışa aktar
                </button>
                <button
                  onClick={() => copyTone(current)}
                  className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-accent"
                >
                  {copied ? "✓ Kopyalandı" : "Ayarları kopyala"}
                </button>
                <button
                  onClick={() => toggleSave(current)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                    isSaved ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-ink hover:border-accent"
                  }`}
                >
                  {isSaved ? "★ Kaydedildi" : "☆ Kaydet"}
                </button>
              </div>
              {current.meta && (
                <p className="mb-3 rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink-soft">
                  {current.meta.cached ? "Orijinal ton araştırması kayıttan kullanıldı" : "Orijinal ton araştırması yapıldı"} (
                  {new Date(current.meta.researchedAt).toLocaleDateString("tr-TR")}); ayarlar şu anki ekipmanına göre uyarlandı.
                  {current.query && (
                    <button
                      type="button"
                      disabled={loading || needsKey}
                      onClick={() => current.query && runTone(current.query, { fresh: true, previous: current })}
                      className="ml-2 font-semibold text-accent hover:underline disabled:opacity-40"
                    >
                      Orijinali yeniden araştır
                    </button>
                  )}
                </p>
              )}
              <ToneCard key={current.id} result={current.result} pickupLayout={current.pickupLayout} />
              {current.query && (
                <section className="hud-panel mt-5 p-5">
                  <Head code="FDB" title="Kulağa yanlış mı geliyor?" />
                  <p className="mb-3 text-sm text-ink-soft">
                    Ayarları denedikten sonra neyin farklı olduğunu yaz (ör. &quot;çok bulanık&quot;, &quot;yeterince distorsiyon yok&quot;,
                    &quot;tiz batıyor&quot;). Orijinal araştırma korunur, yalnız ayarlar yeniden uyarlanır.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (current.query && feedback.trim()) void runTone(current.query, { feedback: feedback.trim(), previous: current });
                    }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <textarea
                      className="hud-input min-h-16"
                      maxLength={600}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Ne farklı geliyor?"
                      aria-label="Geri bildirim"
                    />
                    <button
                      type="submit"
                      disabled={loading || needsKey || !feedback.trim()}
                      className="shrink-0 self-end rounded-lg bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-accent disabled:opacity-40"
                    >
                      Yeniden uyarla
                    </button>
                  </form>
                </section>
              )}
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
