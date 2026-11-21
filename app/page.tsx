"use client";

import { useEffect, useState } from "react";
import { OriginalCard } from "@/components/OriginalCard";
import { RigPanel } from "@/components/RigPanel";
import { SettingsPanel, type KeyStatus } from "@/components/SettingsPanel";
import { SongSearch } from "@/components/SongSearch";
import { ToneCard } from "@/components/ToneCard";
import { AppMark, Artwork, CARD_COLORS, PageBand, Pill, Segmented } from "@/components/ui";
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
  const showHero = view === "research" && !current && !busy;
  const pickQuick = (q: (typeof QUICK_PICKS)[number]) => {
    setSong(q.song);
    setArtist(q.artist);
    setPart(q.part);
    setPartDetail(q.detail ?? "");
    setArtwork("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openTone = (s: SavedTone) => {
    setCurrent(s);
    setView("research");
    window.scrollTo({ top: 0 });
  };

  const searchForm = (
    <form
      className="hud-panel rise space-y-4 p-5"
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
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
        <Pill tone="light" type="submit" disabled={busy !== null || !song.trim() || !canResearch} className="shrink-0 px-8">
          {busy === "research" ? "Araştırılıyor…" : "Tonu araştır"}
        </Pill>
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
  );

  return (
    <div className="min-h-screen pb-16">
      {/* Yüzen menü çubuğu */}
      <header className="fixed inset-x-0 top-3 z-30 px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full border border-white/5 bg-[#1e1f22]/95 pl-3 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          <button onClick={() => { setView("research"); setCurrent(null); }} className="flex items-center gap-2.5 rounded-full pr-3" aria-label="Ana sayfa">
            <AppMark size={30} />
            <span className="serif hidden text-[19px] font-semibold text-ink sm:inline">ToneFinder</span>
          </button>
          <nav className="ml-2 flex items-center gap-1" aria-label="Bölümler">
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
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  view === id ? "bg-raised text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-raised px-3 py-2 text-xs font-semibold text-ink-soft sm:flex">
              <span className={`h-2 w-2 rounded-full ${busy ? "animate-pulse bg-accent" : engine ? "bg-ok" : "bg-bad"}`} />
              {busy ? "Çalışıyor" : (engine ?? "Kurulum gerekli")}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-raised hover:text-ink"
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
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm" onClick={() => setSettingsOpen(false)}>
          <div className="rise w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <SettingsPanel status={keyStatus} onSaved={setKeyStatus} onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      )}

      {/* Krem karşılama bandı (yalnız boş araştırma ekranında) */}
      {showHero && (
        <section className="bg-cream px-6 pb-20 pt-36 text-center">
          <h1 className="serif rise mx-auto max-w-3xl text-[56px] font-semibold leading-[1.04] text-cream-ink sm:text-[68px]">
            Sevdiğin şarkının tonu, kendi ekipmanında
          </h1>
          <p className="rise mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-cream-mute" style={{ animationDelay: "60ms" }}>
            Stüdyo kaydındaki gitar, amfi ve pedalları kaynaklarıyla bulur; sonra düğme düğme senin rig&apos;ine çevirir.
          </p>
          <div className="rise mt-8 flex justify-center gap-3" style={{ animationDelay: "120ms" }}>
            <Pill tone="dark" onClick={() => document.querySelector<HTMLInputElement>("[aria-label='Şarkı']")?.focus()}>
              Şarkı ara
            </Pill>
            <Pill tone="ghost" className="!bg-black/5 !text-cream-ink hover:!bg-black/10" onClick={() => setView("rig")}>
              Ekipmanımı kur
            </Pill>
          </div>
        </section>
      )}

      <main className={`mx-auto max-w-6xl space-y-6 px-6 ${showHero ? "pt-10" : "pt-24"}`}>
        {error && (
          <div className="rounded-2xl border border-bad/40 bg-bad/10 px-5 py-3.5 text-sm text-ink" role="alert">
            {error}
          </div>
        )}

        {view === "research" && (
          <>
            {searchForm}

            {showHero && (
              <>
                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <h2 className="text-lg font-semibold text-ink">Popüler tonlar</h2>
                    <span className="text-xs text-ink-mute">Birine tıkla, form dolsun</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {QUICK_PICKS.map((q, i) => (
                      <button key={q.song} onClick={() => pickQuick(q)} className="lift group overflow-hidden rounded-2xl bg-panel text-left">
                        <span className="relative flex aspect-square flex-col justify-between p-4" style={{ background: CARD_COLORS[i % CARD_COLORS.length] }}>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-cream-ink/60">{PART_SHORT[q.part]}</span>
                          <span className="serif text-[22px] font-semibold leading-[1.05] text-cream-ink">{q.song}</span>
                          <svg className="absolute right-3 top-3 opacity-25 transition group-hover:opacity-40" width="34" height="34" viewBox="0 0 40 40" aria-hidden>
                            <path d="M20 3c9 0 16 4 16 11 0 9-8 19-16 23C12 33 4 23 4 14 4 7 11 3 20 3z" fill="#141414" />
                          </svg>
                        </span>
                        <span className="block truncate px-4 py-3 text-[13px] font-semibold text-ink">{q.artist}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {history.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-end justify-between">
                      <h2 className="text-lg font-semibold text-ink">Son araştırmaların</h2>
                      <button onClick={() => { setListTab("history"); setView("library"); }} className="text-xs font-semibold text-ink-soft hover:text-ink">
                        Tümünü gör
                      </button>
                    </div>
                    <ToneRows items={history.slice(0, 5)} onOpen={openTone} />
                  </section>
                )}
              </>
            )}

            {busy && (
              <div className="hud-panel hud-scan flex items-center gap-3 px-5 py-4" aria-live="polite">
                <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-accent" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{progress.at(-1) ?? "Başlıyor…"}</span>
                <span className="text-xs font-semibold text-ink-mute">{busy === "research" ? "~1–2 dk" : "~1–3 dk"}</span>
              </div>
            )}

            {current && busy !== "research" && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="hud-label mr-auto">
                    {current.part}
                    {current.meta?.cached && " · kayıttan"}
                  </span>
                  <Pill type="button" onClick={() => toggleSave(current)}>
                    {isSaved ? "★ Kayıtlı" : "☆ Kaydet"}
                  </Pill>
                  <Pill type="button" onClick={() => download(`${fileSlug(current.result.song.title)}.tonefinder.json`, toneFile(current))}>
                    Dışa aktar
                  </Pill>
                  {current.query && (
                    <Pill
                      type="button"
                      disabled={busy !== null || !canResearch}
                      onClick={() => current.query && research(current.query, { fresh: true, artwork: current.artwork })}
                    >
                      Yeniden araştır
                    </Pill>
                  )}
                </div>

                <OriginalCard key={`o-${current.id}`} tone={current.result} artwork={current.artwork} />

                <section className="hud-panel flex flex-wrap items-center gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-c-purple text-sm font-bold text-cream-ink">2</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="serif text-xl font-semibold text-ink">Ekipmanına çevir</h3>
                    <p className="truncate text-sm text-ink-mute">
                      {activeRig?.name}: {rig ? rigLabel(rig) : "—"}
                      {rig?.guitar && ` · ${rig.guitar}`}
                    </p>
                  </div>
                  <Pill type="button" onClick={() => setView("rig")}>
                    Ekipman
                  </Pill>
                  <Pill
                    tone="light"
                    type="button"
                    disabled={busy !== null || !canAdapt || !hasGear || !current.query}
                    onClick={() => adapt()}
                    title={!canAdapt ? "Bu adım için API anahtarı gerekli" : undefined}
                  >
                    {busy === "adapt" ? "Çevriliyor…" : adapted ? "Yeniden çevir" : "Çevir"}
                  </Pill>
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
                      <Pill type="button" onClick={() => copyTone(adapted)}>
                        {copied ? "✓ Kopyalandı" : "Ayarları kopyala"}
                      </Pill>
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
                      <Pill type="submit" disabled={busy !== null || !canAdapt || !feedback.trim()} className="shrink-0">
                        Yeniden uyarla
                      </Pill>
                    </form>
                  </>
                )}
              </>
            )}
          </>
        )}

        {view === "rig" && rig && rigStore && (
          <>
            <PageBand kicker="Ekipman" title="Ekipmanım" color="var(--color-c-purple)">
              Amfin, prosesörün, gitarın ve pedalların. Tonlar bu bilgilere göre düğme düğme ayarlanır; &quot;Ev&quot;, &quot;Prova&quot; gibi birden çok set tutabilirsin.
            </PageBand>
            <RigPanel rig={rig} rigs={rigStore.rigs} activeId={rigStore.activeId} {...rigActions} canIdentify={canAdapt} />
          </>
        )}

        {view === "library" && (
          <>
            <PageBand
              kicker="Kütüphane"
              title="Tonlarım"
              color="var(--color-c-lime)"
              action={
                <label className="pill pill-ghost cursor-pointer">
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
              }
            >
              Kaydettiğin tonlar ve son 20 sonuç. Bir satıra tıklayınca ton açılır.
            </PageBand>
            <div className="flex items-center gap-1 rounded-full bg-panel p-1 w-fit">
              {(
                [
                  ["saved", `Kayıtlı · ${saved.length}`],
                  ["history", `Geçmiş · ${history.length}`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setListTab(id)}
                  aria-pressed={listTab === id}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    listTab === id ? "bg-ink text-cream-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {(listTab === "saved" ? saved : history).length === 0 ? (
              <p className="rounded-2xl bg-panel py-14 text-center text-sm text-ink-mute">Henüz bir şey yok. Bir şarkı araştırınca burada görünür.</p>
            ) : (
              <ToneRows items={listTab === "saved" ? saved : history} onOpen={openTone} onRemove={(id) => removeFrom(listTab, id)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/** Parça listesi gibi kapaklı satırlar */
function ToneRows({ items, onOpen, onRemove }: { items: SavedTone[]; onOpen: (s: SavedTone) => void; onRemove?: (id: string) => void }) {
  return (
    <ul className="divide-y divide-line/70 overflow-hidden rounded-2xl bg-panel">
      {items.map((s) => {
        const date = new Date(s.savedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
        return (
          <li key={s.id} className="group flex items-center gap-4 px-4 py-3 transition hover:bg-raised/60">
            <button onClick={() => onOpen(s)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
              <Artwork src={s.artwork} title={s.result.song.title} size={46} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">{s.result.song.title}</span>
                <span className="block truncate text-[13px] text-ink-mute">{s.result.song.artist}</span>
              </span>
              <span className="hidden w-40 truncate text-[13px] text-ink-soft md:block">{s.part}</span>
              <span className="hidden w-48 truncate text-[13px] text-ink-soft lg:block">
                {isAdapted(s.result) ? (s.rigName ?? s.deviceLabel) : "Orijinal ton"}
              </span>
              <span
                className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${
                  isAdapted(s.result) ? "bg-c-lime text-cream-ink" : "bg-raised text-ink-soft"
                }`}
              >
                {isAdapted(s.result) ? "Uyarlandı" : "Araştırma"}
              </span>
              <span className="w-14 text-right text-xs tabular-nums text-ink-mute">{date}</span>
            </button>
            {onRemove && (
              <button
                onClick={() => onRemove(s.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mute opacity-0 transition hover:bg-raised hover:text-bad group-hover:opacity-100 focus:opacity-100"
                aria-label={`${s.result.song.title} sil`}
              >
                ✕
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
