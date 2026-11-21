"use client";

import { useEffect, useState } from "react";
import { OriginalCard } from "@/components/OriginalCard";
import { RigPanel } from "@/components/RigPanel";
import { SettingsPanel, type KeyStatus } from "@/components/SettingsPanel";
import { SongSearch } from "@/components/SongSearch";
import { ToneCard } from "@/components/ToneCard";
import { ArtistTiles, PopularGrid, PopularPromo, PopularRail } from "@/components/Popular";
import { BandPage, LibraryShelf, normArtist, ResolvePanel, type ShelfArtist } from "@/components/Band";
import type { ArtistHit, SongHit } from "@/app/api/songs/route";
import { AppMark, Artwork, PageBand, Pill, Segmented } from "@/components/ui";
import type { PopularEntry } from "@/lib/popular";
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

type View = "research" | "rig" | "library" | "band";

interface Resolve {
  query: string;
  loading: boolean;
  artists: ArtistHit[];
  songs: SongHit[];
  web: { loading: boolean; error?: string; done: boolean } | null;
}

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
  const [popular, setPopular] = useState<PopularEntry[]>([]);
  const [popularArtist, setPopularArtist] = useState("");
  const [band, setBand] = useState<ArtistHit | null>(null);
  const [shelf, setShelf] = useState<ShelfArtist[]>([]);
  const [resolve, setResolve] = useState<Resolve | null>(null);

  const activeRig = rigStore?.rigs.find((r) => r.id === rigStore.activeId) ?? null;
  const rig = activeRig?.rig ?? null;
  const canResearch = Boolean(keyStatus?.configured || keyStatus?.cli);
  // Uyarlama da Claude Code ile yapılabilir (API anahtarı şart değil)
  const canAdapt = canResearch;
  const hasGear = Boolean(rig && (rig.amp.trim() || rig.processor.trim()));

  useEffect(() => {
    setRigStore(loadRigs());
    setSaved(loadSaved());
    setHistory(loadHistory());
    fetch("/api/popular")
      .then((r) => r.json() as Promise<{ songs?: PopularEntry[] }>)
      .then((d) => setPopular(d.songs ?? []))
      .catch(() => {});
    fetch("/api/library")
      .then((r) => r.json() as Promise<{ artists?: ShelfArtist[] }>)
      .then((d) => setShelf(d.artists ?? []))
      .catch(() => {});
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

  /** 2. adım: orijinal tonu aktif rig'e uyarla (Claude Code ya da API) */
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
  const showHome = view === "research" && !current && !busy;
  const openPopular = (e: PopularEntry) => {
    setView("research");
    setResolve(null);
    setSong(e.title);
    setArtist(e.artist);
    setPart(e.part);
    setPartDetail("");
    setInstrument("guitar");
    setToneType("auto");
    setArtwork(e.artwork);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void research({ song: e.title, artist: e.artist, part: e.part, partDetail: "", instrument: "guitar", toneType: "auto" }, { artwork: e.artwork });
  };
  const browsePopular = (artistName = "") => {
    setPopularArtist(artistName);
    setTimeout(() => document.getElementById("popular-100")?.scrollIntoView({ behavior: "smooth" }), 30);
  };
  const openTone = (s: SavedTone) => {
    setCurrent(s);
    setView("research");
    window.scrollTo({ top: 0 });
  };
  /** Grup sayfasını aç (aramadan, kütüphaneden ya da "Bunu mu aradın?" panelinden) */
  const openBand = (a: ArtistHit) => {
    setBand(a);
    setResolve(null);
    setSong("");
    setArtist("");
    setArtwork("");
    setView("band");
    window.scrollTo({ top: 0 });
  };
  /** Grup sayfasından ya da panelden bir şarkı seçildi: seçili bölümün tonunu araştır */
  const pickSong = (s: SongHit) => {
    const hit = popular.find((e) => e.ready && normArtist(e.title) === normArtist(s.title) && normArtist(e.artist) === normArtist(s.artist));
    if (hit) return openPopular(hit);
    setView("research");
    setResolve(null);
    setSong(s.title);
    setArtist(s.artist);
    setArtwork(s.artwork);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (canResearch) void research({ song: s.title, artist: s.artist, part, partDetail, instrument, toneType }, { artwork: s.artwork });
  };
  /** Yalnız metin yazılıp "Tonu bul"a basıldı: önce grup mu şarkı mı olduğunu bul, metni körlemesine araştırma */
  const resolveQuery = async (q: string) => {
    setError(null);
    setResolve({ query: q, loading: true, artists: [], songs: [], web: null });
    try {
      const d = (await (await fetch(`/api/songs?q=${encodeURIComponent(q)}`)).json()) as { songs?: SongHit[]; artists?: ArtistHit[] };
      const artists = d.artists ?? [];
      const exact = artists.find((a) => normArtist(a.name) === normArtist(q));
      // Yazılan tam olarak bir grubun adıysa doğrudan grup sayfasına git
      if (exact) return openBand(exact);
      setResolve({ query: q, loading: false, artists, songs: d.songs ?? [], web: null });
    } catch {
      setResolve({ query: q, loading: false, artists: [], songs: [], web: null });
    }
  };
  const webSearch = async () => {
    if (!resolve) return;
    const q = resolve.query;
    setResolve({ ...resolve, web: { loading: true, done: false } });
    try {
      const res = await fetch("/api/identify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q }) });
      const d = (await res.json()) as { artists?: string[]; songs?: { title: string; artist: string }[]; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Web'de aranamadı.");
      // Bulunan adları müzik servislerinde eşleştir (resim ve kapak için)
      const artists: ArtistHit[] = [];
      for (const name of (d.artists ?? []).slice(0, 3)) {
        const r = (await (await fetch(`/api/songs?q=${encodeURIComponent(name)}`)).json()) as { artists?: ArtistHit[] };
        artists.push(r.artists?.find((a) => normArtist(a.name) === normArtist(name)) ?? { id: 0, name, picture: "", fans: 0 });
      }
      const songs: SongHit[] = (d.songs ?? []).slice(0, 6).map((x) => ({ title: x.title, artist: x.artist, album: "", year: "", artwork: "" }));
      setResolve((cur) => cur && cur.query === q ? { ...cur, artists, songs, web: { loading: false, done: true } } : cur);
    } catch (err) {
      setResolve((cur) => cur && cur.query === q ? { ...cur, web: { loading: false, done: false, error: err instanceof Error ? err.message : "Web'de aranamadı." } } : cur);
    }
  };
  const goHome = () => {
    setView("research");
    setResolve(null);
    setCurrent(null);
    setSong("");
    setArtist("");
    setArtwork("");
    window.scrollTo({ top: 0 });
  };
  const popularHit = popular.find(
    (e) => e.ready && e.title.toLocaleLowerCase("en") === song.trim().toLocaleLowerCase("en") && e.artist.toLocaleLowerCase("en") === artist.trim().toLocaleLowerCase("en"),
  );
  const canSubmit = Boolean(song.trim()) && busy === null && (!artist.trim() || canResearch || Boolean(popularHit && popularHit.part === part && !partDetail.trim() && instrument === "guitar" && toneType === "auto"));

  const submit = () => {
    if (!canSubmit) return;
    // Seçilmemiş serbest metin (ör. "Duman"): grup ya da şarkı olarak çöz
    if (!artist.trim()) return void resolveQuery(song.trim());
    setResolve(null);
    void research({ song, artist, part, partDetail, instrument, toneType }, { artwork });
  };

  const searchForm = (big: boolean) => (
    <form
      className={big ? "mx-auto max-w-4xl" : "hud-panel rise p-4"}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {big && (
        <div className="mb-4 flex flex-wrap justify-center gap-1" role="group" aria-label="Bölüm">
          {PARTS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setPart(p.id)}
              aria-pressed={part === p.id}
              className={`rounded-full border-b-[3px] px-4 pb-2 pt-1.5 text-[15px] font-bold transition ${
                part === p.id ? "border-ink text-ink" : "border-transparent text-ink-mute hover:text-ink"
              }`}
            >
              {PART_SHORT[p.id] ?? p.label}
            </button>
          ))}
        </div>
      )}
      <SongSearch
        big={big}
        song={song}
        artist={artist}
        artwork={artwork}
        onArtist={openBand}
        onChange={(p) => {
          if (p.song !== undefined) setSong(p.song);
          if (p.artist !== undefined) setArtist(p.artist);
          if (p.artwork !== undefined) setArtwork(p.artwork);
          // Popüler listedeki bir şarkı seçildiyse hazır kaydın bölümüne geç (ton anında açılsın)
          if (p.song && p.artist) {
            const hit = popular.find(
              (e) => e.ready && e.title.toLocaleLowerCase("en") === p.song!.toLocaleLowerCase("en") && e.artist.toLocaleLowerCase("en") === p.artist!.toLocaleLowerCase("en"),
            );
            if (hit) {
              setPart(hit.part);
              setPartDetail("");
              setInstrument("guitar");
              setToneType("auto");
            }
          }
        }}
        action={
          <Pill tone="primary" type="submit" disabled={!canSubmit} className={big ? "!px-7 !py-4 text-base" : "!px-5"}>
            {busy === "research" ? "Araştırılıyor…" : "Tonu bul"}
          </Pill>
        }
      />
      <div className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 ${big ? "justify-center" : ""}`}>
        {!big && (
          <Segmented label="Bölüm" options={PARTS.map((p) => ({ id: p.id, label: PART_SHORT[p.id] ?? p.label }))} value={part} onChange={setPart} />
        )}
        <Segmented label="Ton" options={TONE_TYPES.map((t) => ({ id: t.id, label: TONE_SHORT[t.id] }))} value={toneType} onChange={setToneType} />
        <Segmented label="" options={INSTRUMENTS} value={instrument} onChange={setInstrument} />
        <input
          className="hud-input !w-72 !rounded-full !py-2"
          placeholder="Hangi bölüm? (isteğe bağlı, ör. 2. solo)"
          value={partDetail}
          onChange={(e) => setPartDetail(e.target.value)}
          aria-label="Bölüm detayı"
        />
      </div>
      {keyStatus && !canResearch && (
        <p className={`mt-3 text-sm text-warn ${big ? "text-center" : ""}`}>
          Yeni şarkı araştırmak için bu bilgisayarda Claude Code gerekli; hazır tonu olan popüler şarkılar yine de açılır.{" "}
          <button type="button" className="underline" onClick={() => setSettingsOpen(true)}>
            Nasıl?
          </button>
        </p>
      )}
      {resolve && (
        <div className="mt-5">
          <ResolvePanel
            query={resolve.query}
            loading={resolve.loading}
            artists={resolve.artists}
            songs={resolve.songs}
            web={resolve.web}
            canWeb={canResearch}
            onArtist={openBand}
            onSong={pickSong}
            onWeb={() => void webSearch()}
            onRaw={() => {
              setResolve(null);
              void research({ song, artist: "", part, partDetail, instrument, toneType }, { artwork });
            }}
            onClose={() => setResolve(null)}
          />
        </div>
      )}
    </form>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Üst çubuk */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-3 px-6">
          <button onClick={goHome} className="flex items-center gap-2.5" aria-label="Ana sayfa">
            <AppMark size={34} />
            <span className="headline hidden text-[23px] text-ink sm:inline">ToneFinder</span>
          </button>
          <nav className="ml-auto flex items-center gap-1" aria-label="Bölümler">
            {(
              [
                ["research", "Keşfet"],
                ["rig", "Ekipmanım"],
                ["library", "Tonlarım"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => (id === "research" ? goHome() : setView(id))}
                aria-current={view === id || (id === "research" && view === "band") ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] font-bold transition ${
                  view === id || (id === "research" && view === "band") ? "bg-panel text-ink" : "text-ink-soft hover:bg-panel hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <span className="ml-3 hidden items-center gap-2 text-[13px] font-semibold text-ink-soft md:flex" title="Araştırma motoru">
            <span className={`h-2.5 w-2.5 rounded-full ${busy ? "animate-pulse bg-petrol" : engine ? "bg-ok" : "bg-bad"}`} />
            {busy ? "Çalışıyor" : (engine ?? "Kurulum gerekli")}
          </span>
          <Pill tone="dark" onClick={() => setSettingsOpen(true)} className="ml-2">
            Ayarlar
          </Pill>
        </div>
      </header>

      {settingsOpen && keyStatus && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm" onClick={() => setSettingsOpen(false)}>
          <div className="rise w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <SettingsPanel status={keyStatus} onSaved={setKeyStatus} onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1200px] space-y-14 px-6 pt-10">
        {error && (
          <div className="rounded-2xl border border-bad/40 bg-bad/10 px-5 py-3.5 text-sm text-ink" role="alert">
            {error}
          </div>
        )}

        {view === "band" && band && (
          <>
            <BandPage band={band} popular={popular} part={part} onPart={setPart} onSong={pickSong} onPopular={openPopular} onBack={goHome} />
          </>
        )}

        {view === "research" && (
          <>
            {showHome ? (
              <section className="pt-6 text-center">
                <h1 className="headline rise text-[56px] leading-none text-ink sm:text-[72px]">Hangi şarkının tonu?</h1>
                <p className="rise mx-auto mb-8 mt-4 max-w-xl text-[17px] text-ink-soft" style={{ animationDelay: "60ms" }}>
                  Şarkı ya da grup adını yaz; stüdyo kaydındaki ekipmanı bulup senin rig&apos;ine çevirelim.
                </p>
                {searchForm(true)}
              </section>
            ) : (
              <div className="space-y-6">{searchForm(false)}</div>
            )}

            {showHome && popular.length > 0 && (
              <>
                <PopularPromo entries={popular} onBrowse={() => browsePopular("")} />
                <PopularRail title="En çok çalınanlar" subtitle="Songsterr listesinin ilk 12 şarkısı" entries={popular.slice(0, 12)} onOpen={openPopular} />
                {shelf.length > 0 && <LibraryShelf artists={shelf} onOpen={(a) => openBand({ id: a.id, name: a.name, picture: a.picture, fans: a.fans, inLibrary: true })} />}
                <ArtistTiles entries={popular} onPick={(a) => openBand({ id: 0, name: a, picture: "", fans: 0 })} />
                {history.length > 0 && (
                  <section>
                    <div className="mb-4 flex items-end justify-between">
                      <h2 className="headline text-[26px] text-ink">Son araştırmaların</h2>
                      <button
                        onClick={() => {
                          setListTab("history");
                          setView("library");
                        }}
                        className="text-sm font-bold text-ink underline-offset-4 hover:underline"
                      >
                        Tümünü gör
                      </button>
                    </div>
                    <ToneRows items={history.slice(0, 5)} onOpen={openTone} />
                  </section>
                )}
                <PopularGrid entries={popular} onOpen={openPopular} artist={popularArtist} onArtist={setPopularArtist} />
              </>
            )}

            {busy && (
              <div className="hud-panel hud-scan -mt-8 flex items-center gap-3 px-5 py-4" aria-live="polite">
                <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-petrol" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{progress.at(-1) ?? "Başlıyor…"}</span>
                <span className="text-xs font-semibold text-ink-mute">{busy === "research" ? "~1–2 dk" : "~1–3 dk"}</span>
              </div>
            )}

            {current && busy !== "research" && (
              <div className="-mt-8 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="hud-label mr-auto">
                    {current.part}
                    {current.meta?.bundled ? " · hazır popüler kayıt" : current.meta?.cached ? " · kayıttan" : ""}
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
                  <span className="headline flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-white">2</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="headline text-[22px] text-ink">Ekipmanına çevir</h3>
                    <p className="truncate text-sm text-ink-mute">
                      {activeRig?.name}: {rig ? rigLabel(rig) : "—"}
                      {rig?.guitar && ` · ${rig.guitar}`}
                    </p>
                  </div>
                  <Pill type="button" onClick={() => setView("rig")}>
                    Ekipman
                  </Pill>
                  <Pill
                    tone="primary"
                    type="button"
                    disabled={busy !== null || !canAdapt || !hasGear || !current.query}
                    onClick={() => adapt()}
                    title={!canAdapt ? "Bu adım için Claude Code ya da API anahtarı gerekli" : undefined}
                  >
                    {busy === "adapt" ? "Çevriliyor…" : adapted ? "Yeniden çevir" : "Çevir"}
                  </Pill>
                  {!canAdapt && (
                    <p className="w-full text-xs text-ink-mute">
                      Bu adım için bu bilgisayarda Claude Code ya da bir API anahtarı gerekli.{" "}
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
                      <Pill type="submit" tone="dark" disabled={busy !== null || !canAdapt || !feedback.trim()} className="shrink-0">
                        Yeniden uyarla
                      </Pill>
                    </form>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {view === "rig" && rig && rigStore && (
          <div className="space-y-6">
            <PageBand kicker="Ekipman" title="Ekipmanım" color="var(--color-ink)">
              Amfin, prosesörün, gitarın ve pedalların. Tonlar bu bilgilere göre düğme düğme ayarlanır; &quot;Ev&quot;, &quot;Prova&quot; gibi birden çok set tutabilirsin.
            </PageBand>
            <RigPanel rig={rig} rigs={rigStore.rigs} activeId={rigStore.activeId} {...rigActions} canIdentify={canAdapt} />
          </div>
        )}

        {view === "library" && (
          <div className="space-y-6">
            <PageBand
              kicker="Kütüphane"
              title="Tonlarım"
              color="var(--color-petrol)"
              action={
                <label className="pill pill-soft cursor-pointer">
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
            <div className="flex w-fit items-center gap-1 rounded-full bg-panel p-1">
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
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${listTab === id ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
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
          </div>
        )}
      </main>
    </div>
  );
}

/** Parça listesi gibi kapaklı satırlar */
function ToneRows({ items, onOpen, onRemove }: { items: SavedTone[]; onOpen: (s: SavedTone) => void; onRemove?: (id: string) => void }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
      {items.map((s) => {
        const date = new Date(s.savedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
        return (
          <li key={s.id} className="group flex items-center gap-4 px-4 py-3 transition hover:bg-panel">
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
                  isAdapted(s.result) ? "bg-petrol text-white" : "bg-panel text-ink-soft"
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
