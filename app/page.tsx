"use client";

import { useEffect, useState } from "react";
import { OriginalCard } from "@/components/OriginalCard";
import { RigPanel } from "@/components/RigPanel";
import { SettingsPanel, type KeyStatus } from "@/components/SettingsPanel";
import { SongSearch } from "@/components/SongSearch";
import { ToneCard } from "@/components/ToneCard";
import { toneText } from "@/lib/format";
import { INSTRUMENTS, PARTS, TONE_TYPES, type Instrument, type ToneType, type UserRig } from "@/lib/gear";
import type { OriginalTone, PartialTone, ToneEvent, ToneMeta, ToneResult } from "@/lib/schema";
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

type View = "research" | "rig" | "library";

const QUICK_PICKS: { song: string; artist: string; part: string; detail?: string }[] = [
  { song: "Master of Puppets", artist: "Metallica", part: "rhythm" },
  { song: "Sweet Child O' Mine", artist: "Guns N' Roses", part: "intro" },
  { song: "Comfortably Numb", artist: "Pink Floyd", part: "lead", detail: "son solo" },
  { song: "Back in Black", artist: "AC/DC", part: "intro" },
  { song: "Hotel California", artist: "Eagles", part: "lead" },
  { song: "Smells Like Teen Spirit", artist: "Nirvana", part: "rhythm" },
];

const PART_SHORT: Record<string, string> = { lead: "Solo", rhythm: "Ritim", intro: "Riff", clean: "Temiz", full: "Genel" };
const TONE_SHORT: Record<string, string> = { auto: "Oto", clean: "Temiz", distorted: "Dist" };

function rigLabel(rig: UserRig) {
  const parts = [rig.amp, rig.processor].map((s) => s.trim()).filter((s) => s && !/^(yok|-)$/i.test(s));
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

const isAdapted = (r: PartialTone): r is ToneResult => Array.isArray(r.chain);

function Segmented<T extends string>({
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
    <div className="flex items-center gap-2" role="group" aria-label={label || undefined}>
      {label && <span className="hud-label">{label}</span>}
      <div className="flex overflow-hidden rounded-md border border-line">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`border-l border-line px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide first:border-l-0 ${
              value === o.id ? "bg-accent text-paper" : "bg-raised text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, primary, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition disabled:opacity-40 ${
        primary ? "bg-accent text-paper hover:brightness-110" : "border border-line bg-raised text-ink hover:border-line-strong"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("research");
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
  const [busy, setBusy] = useState<"research" | "adapt" | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<SavedTone | null>(null);
  const [saved, setSaved] = useState<SavedTone[]>([]);
  const [history, setHistory] = useState<SavedTone[]>([]);
  const [listTab, setListTab] = useState<"saved" | "history">("saved");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const activeRig = rigStore?.rigs.find((r) => r.id === rigStore.activeId) ?? null;
  const rig = activeRig?.rig ?? null;
  const canResearch = Boolean(keyStatus?.configured || keyStatus?.cli);
  const canAdapt = Boolean(keyStatus?.configured);
  const hasGear = Boolean(rig && (rig.amp.trim() || rig.processor.trim()));

  useEffect(() => {
    setRigStore(loadRigs());
    setSaved(loadSaved());
    setHistory(loadHistory());
    fetch("/api/settings")
      .then((r) => r.json() as Promise<KeyStatus>)
      .then(setKeyStatus)
      .catch(() => setKeyStatus({ configured: false, source: null, cli: null }));
  }, []);

  function changeRigs(update: (store: RigStore) => RigStore) {
    setRigStore((prev) => {
      if (!prev) return prev;
      const next = update(prev);
      saveRigs(next);
      return next;
    });
  }

  const rigActions = {
    onChange: (patch: Partial<UserRig>) =>
      changeRigs((st) => ({ ...st, rigs: st.rigs.map((r) => (r.id === st.activeId ? { ...r, rig: { ...r.rig, ...patch } } : r)) })),
    onRigSelect: (id: string) => changeRigs((st) => ({ ...st, activeId: id })),
    onRigCreate: () =>
      changeRigs((st) => {
        const base = st.rigs.find((r) => r.id === st.activeId);
        const id = createRigId();
        return { activeId: id, rigs: [...st.rigs, { id, name: `Rig ${st.rigs.length + 1}`, rig: structuredClone(base!.rig) }] };
      }),
    onRigRename: (name: string) => changeRigs((st) => ({ ...st, rigs: st.rigs.map((r) => (r.id === st.activeId ? { ...r, name } : r)) })),
    onRigDelete: () =>
      changeRigs((st) => {
        const rigs = st.rigs.filter((r) => r.id !== st.activeId);
        return rigs.length ? { activeId: rigs[0].id, rigs } : st;
      }),
  };

  function remember(tone: SavedTone) {
    setCurrent(tone);
    setHistory((prev) => {
      const next = [tone, ...prev.filter((t) => t.id !== tone.id)].slice(0, 20);
      storeHistory(next);
      return next;
    });
  }

  /** NDJSON akışını okur; ilerlemeyi kısa satırlar olarak gösterir */
  async function stream(
    url: string,
    body: unknown,
    onOriginal: (o: OriginalTone, m: ToneMeta) => void,
    onResult?: (r: ToneResult, m: ToneMeta) => void,
  ) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok || !res.body) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Bir şeyler ters gitti.");
    }
    for await (const e of readEvents(res.body)) {
      if (e.type === "error") throw new Error(e.error);
      if (e.type === "original") onOriginal(e.original, e.meta);
      else if (e.type === "result") onResult?.(e.result, e.meta);
      else if (e.type === "status") setProgress((p) => [...p, e.message]);
      else if (e.type === "search") setProgress((p) => [...p, `Aranıyor: ${e.query}`]);
      else if (e.type === "fetch") setProgress((p) => [...p, `Okunuyor: ${hostOf(e.url)}`]);
    }
  }

  /** 1. adım: şarkının orijinal stüdyo tonunu araştır */
  async function research(query: SongQuery, opts: { fresh?: boolean; artwork?: string } = {}) {
    if (!query.song.trim()) return;
    setBusy("research");
    setError(null);
    setProgress([]);
    setFeedback("");
    try {
      let tone: SavedTone | null = null;
      await stream("/api/research", { ...query, fresh: opts.fresh ?? false }, (original, meta) => {
        tone = {
          id: crypto.randomUUID(),
          savedAt: Date.now(),
          deviceLabel: "",
          part: [PARTS.find((p) => p.id === query.part)?.label ?? query.part, query.partDetail.trim()].filter(Boolean).join(" · "),
          result: original,
          query,
          artwork: opts.artwork ?? "",
          meta,
        };
      });
      if (!tone) throw new Error("Bağlantı yarıda kesildi, lütfen tekrar dene.");
      remember(tone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setBusy(null);
    }
  }

  /** 2. adım: orijinal tonu aktif rig'e uyarla (API anahtarı gerekir) */
  async function adapt(withFeedback?: string) {
    if (!current?.query || !rig || !hasGear) return;
    const base = current;
    setBusy("adapt");
    setError(null);
    setProgress([]);
    try {
      let result: ToneResult | null = null;
      await stream(
        "/api/tone",
        { ...base.query, rig, feedback: withFeedback ?? "", previous: withFeedback ? base.result : undefined },
        () => {},
        (r) => (result = r),
      );
      if (!result) throw new Error("Bağlantı yarıda kesildi, lütfen tekrar dene.");
      setFeedback("");
      remember({
        ...base,
        id: crypto.randomUUID(),
        savedAt: Date.now(),
        result,
        deviceLabel: rigLabel(rig),
        rigName: activeRig?.name,
        pickupLayout: rig.pickups,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setBusy(null);
    }
  }

  function toggleSave(tone: SavedTone) {
    const exists = saved.some((s) => s.id === tone.id);
    const next = exists ? saved.filter((s) => s.id !== tone.id) : [tone, ...saved];
    setSaved(next);
    storeSaved(next);
  }

  function removeFrom(list: "saved" | "history", id: string) {
    const next = (list === "saved" ? saved : history).filter((s) => s.id !== id);
    if (list === "saved") {
      setSaved(next);
      storeSaved(next);
    } else {
      setHistory(next);
      storeHistory(next);
    }
  }

  async function importTone(file: File) {
    const tone = parseToneFile(await file.text());
    if (!tone) return setError("Bu dosya bir ToneFinder ton dosyası değil.");
    const next = [tone, ...saved];
    setSaved(next);
    storeSaved(next);
    setCurrent(tone);
    setView("research");
  }

  async function copyTone(tone: ToneResult) {
    try {
      await navigator.clipboard.writeText(toneText(tone));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Panoya kopyalanamadı.");
    }
  }

  const isSaved = current ? saved.some((s) => s.id === current.id) : false;
  const engine = keyStatus?.configured ? "API" : keyStatus?.cli ? "Claude Code" : null;
  const adapted = current && isAdapted(current.result) ? current.result : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
              <circle cx="11" cy="11" r="9" fill="none" stroke="var(--color-line-strong)" strokeWidth="2" />
              <path d="M5.3 16.7 A 8 8 0 1 1 16.7 16.7" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
              <line x1="11" y1="11" x2="15" y2="6.5" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden font-display text-xl font-bold tracking-wide text-ink sm:inline">
              TONE<span className="text-accent">FINDER</span>
            </span>
          </div>
          <nav className="flex h-full items-stretch" aria-label="Bölümler">
            {(
              [
                ["research", "Araştır"],
                ["rig", "Ekipmanım"],
                ["library", "Tonlarım"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-current={view === id ? "page" : undefined}
                className={`border-b-2 px-2.5 font-display text-sm font-semibold uppercase tracking-wider transition sm:px-3 ${
                  view === id ? "border-accent text-ink" : "border-transparent text-ink-mute hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wider text-ink-mute sm:flex">
              <span className={`h-2 w-2 rounded-full ${busy ? "animate-pulse bg-accent" : engine ? "bg-ok" : "bg-bad"}`} />
              {busy ? "Çalışıyor" : (engine ?? "Kurulum gerekli")}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-md p-2 text-ink-mute hover:bg-raised hover:text-ink"
              aria-label="Ayarlar"
              title="Ayarlar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && keyStatus && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-4 pt-20" onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <SettingsPanel status={keyStatus} onSaved={setKeyStatus} onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {error && (
          <div className="rounded-lg border border-bad/50 bg-bad/10 px-4 py-3 text-sm text-ink" role="alert">
            {error}
          </div>
        )}

        {view === "research" && (
          <>
            <form
              className="hud-panel space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void research({ song, artist, part, partDetail, instrument, toneType }, { artwork });
              }}
            >
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
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Segmented label="Bölüm" options={PARTS.map((p) => ({ id: p.id, label: PART_SHORT[p.id] ?? p.label }))} value={part} onChange={setPart} />
                <Segmented label="Ton" options={TONE_TYPES.map((t) => ({ id: t.id, label: TONE_SHORT[t.id] }))} value={toneType} onChange={setToneType} />
                <Segmented label="" options={INSTRUMENTS} value={instrument} onChange={setInstrument} />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="hud-input"
                  placeholder="Hangi bölüm? (isteğe bağlı, ör. 2. solo)"
                  value={partDetail}
                  onChange={(e) => setPartDetail(e.target.value)}
                  aria-label="Bölüm detayı"
                />
                <Btn primary type="submit" disabled={busy !== null || !song.trim() || !canResearch} className="shrink-0 px-8">
                  {busy === "research" ? "Araştırılıyor…" : "Araştır"}
                </Btn>
              </div>
              {keyStatus && !canResearch && (
                <p className="text-sm text-warn">
                  Araştırma için bu bilgisayarda Claude Code gerekli.{" "}
                  <button type="button" className="underline" onClick={() => setSettingsOpen(true)}>
                    Nasıl?
                  </button>
                </p>
              )}
            </form>

            {!current && !busy && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PICKS.map((q) => (
                  <button
                    key={q.song}
                    onClick={() => {
                      setSong(q.song);
                      setArtist(q.artist);
                      setPart(q.part);
                      setPartDetail(q.detail ?? "");
                      setArtwork("");
                    }}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent"
                  >
                    {q.song} · {q.artist}
                  </button>
                ))}
              </div>
            )}

            {busy && (
              <div className="hud-panel hud-scan flex items-center gap-3 px-5 py-4" aria-live="polite">
                <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-accent" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{progress.at(-1) ?? "Başlıyor…"}</span>
                <span className="font-display text-xs uppercase tracking-wider text-ink-mute">{busy === "research" ? "~1–2 dk" : "~1–3 dk"}</span>
              </div>
            )}

            {current && busy !== "research" && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="hud-label mr-auto">
                    {current.part}
                    {current.meta?.cached && " · kayıttan"}
                  </span>
                  <Btn type="button" onClick={() => toggleSave(current)}>
                    {isSaved ? "★ Kayıtlı" : "☆ Kaydet"}
                  </Btn>
                  <Btn type="button" onClick={() => download(`${fileSlug(current.result.song.title)}.tonefinder.json`, toneFile(current))}>
                    Dışa aktar
                  </Btn>
                  {current.query && (
                    <Btn
                      type="button"
                      disabled={busy !== null || !canResearch}
                      onClick={() => current.query && research(current.query, { fresh: true, artwork: current.artwork })}
                    >
                      Yeniden araştır
                    </Btn>
                  )}
                </div>

                <OriginalCard key={`o-${current.id}`} tone={current.result} artwork={current.artwork} />

                <section className="hud-panel flex flex-wrap items-center gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">2 · Ekipmanına çevir</h3>
                    <p className="truncate text-sm text-ink-mute">
                      {activeRig?.name}: {rig ? rigLabel(rig) : "—"}
                      {rig?.guitar && ` · ${rig.guitar}`}
                    </p>
                  </div>
                  <Btn type="button" onClick={() => setView("rig")}>
                    Ekipman
                  </Btn>
                  <Btn
                    primary
                    type="button"
                    disabled={busy !== null || !canAdapt || !hasGear || !current.query}
                    onClick={() => adapt()}
                    title={!canAdapt ? "Bu adım için API anahtarı gerekli" : undefined}
                  >
                    {busy === "adapt" ? "Çevriliyor…" : adapted ? "Yeniden çevir" : "Çevir"}
                  </Btn>
                  {!canAdapt && (
                    <p className="w-full text-xs text-ink-mute">
                      Şimdilik kapalı: bu adım API anahtarı istiyor.{" "}
                      <button className="underline" onClick={() => setSettingsOpen(true)}>
                        Ayarlar
                      </button>
                    </p>
                  )}
                </section>

                {adapted && busy !== "adapt" && (
                  <>
                    <div className="flex justify-end">
                      <Btn type="button" onClick={() => copyTone(adapted)}>
                        {copied ? "✓ Kopyalandı" : "Ayarları kopyala"}
                      </Btn>
                    </div>
                    <ToneCard key={`a-${current.id}`} result={adapted} pickupLayout={current.pickupLayout} />
                    <form
                      className="hud-panel flex flex-col gap-3 p-5 sm:flex-row"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (feedback.trim()) void adapt(feedback.trim());
                      }}
                    >
                      <input
                        className="hud-input"
                        maxLength={600}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Kulağa yanlış mı geliyor? Ne farklı? (ör. çok bulanık)"
                        aria-label="Geri bildirim"
                      />
                      <Btn type="submit" disabled={busy !== null || !canAdapt || !feedback.trim()} className="shrink-0">
                        Yeniden uyarla
                      </Btn>
                    </form>
                  </>
                )}
              </>
            )}
          </>
        )}

        {view === "rig" && rig && rigStore && (
          <RigPanel rig={rig} rigs={rigStore.rigs} activeId={rigStore.activeId} {...rigActions} canIdentify={canAdapt} />
        )}

        {view === "library" && (
          <section className="hud-panel p-5">
            <div className="mb-4 flex items-center gap-2">
              {(
                [
                  ["saved", `Kayıtlı ${saved.length}`],
                  ["history", `Geçmiş ${history.length}`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setListTab(id)}
                  aria-pressed={listTab === id}
                  className={`rounded-md px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide ${
                    listTab === id ? "bg-accent text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
              <label className="ml-auto cursor-pointer rounded-md border border-line px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft hover:border-accent hover:text-accent">
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
              <p className="py-8 text-center text-sm text-ink-mute">Henüz bir şey yok.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {(listTab === "saved" ? saved : history).map((s) => (
                  <li key={s.id} className="group flex items-stretch rounded-lg border border-line bg-raised">
                    <button
                      onClick={() => {
                        setCurrent(s);
                        setView("research");
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
                    >
                      {s.artwork ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.artwork} alt="" className="h-11 w-11 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="h-11 w-11 shrink-0 rounded bg-panel" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">{s.result.song.title}</span>
                        <span className="block truncate text-xs text-ink-mute">
                          {s.result.song.artist} · {s.part}
                          {isAdapted(s.result) ? ` · ${s.rigName ?? s.deviceLabel}` : " · araştırma"}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => removeFrom(listTab, s.id)}
                      className="px-3 text-ink-mute opacity-50 hover:text-bad group-hover:opacity-100"
                      aria-label={`${s.result.song.title} sil`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
