"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArtistPage } from "@/app/api/artist/route";
import type { ArtistHit, SongHit } from "@/app/api/songs/route";
import type { PopularEntry } from "@/lib/popular";
import { PARTS } from "@/lib/gear";
import { PopularRail } from "./Popular";
import { Artwork, colorFor, Segmented } from "./ui";

// Grup sayfası ve ana sayfadaki grup kütüphanesi rafı.

const PART_SHORT: Record<string, string> = { lead: "Solo", rhythm: "Ritim", intro: "Riff", clean: "Temiz", full: "Genel" };

/** Grup adını karşılaştırmak için (Türkçe karakterler, "The", süslemeler yok sayılır) */
export const normArtist = (t: string) =>
  t
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/я/g, "r")
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^the /, "")
    .trim();

const normTitle = (t: string) => normArtist(t.replace(/\(.*?\)|\[.*?\]/g, ""));

export function BandAvatar({ name, picture, size }: { name: string; picture?: string; size: number }) {
  if (picture)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={picture} alt="" className="shrink-0 rounded-full bg-raised object-cover" style={{ width: size, height: size }} />
    );
  return (
    <span
      aria-hidden
      className="headline flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.4 }}
    >
      {name.trim().charAt(0).toLocaleUpperCase("tr")}
    </span>
  );
}

const fansText = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString("tr", { maximumFractionDigits: 1 })} milyon dinleyici` : n >= 1000 ? `${Math.round(n / 1000).toLocaleString("tr")} bin dinleyici` : n > 0 ? `${n} dinleyici` : "";

export function BandPage({
  band,
  popular,
  part,
  onPart,
  onSong,
  onSheetPart,
  onPopular,
  onBack,
}: {
  band: ArtistHit;
  popular: PopularEntry[];
  part: string;
  onPart: (p: string) => void;
  onSong: (s: SongHit) => void;
  /** Kütüphanede bölümleri hazır şarkının bir bölümünü aç */
  onSheetPart: (s: SongHit, p: { part: string; label: string }) => void;
  onPopular: (e: PopularEntry) => void;
  onBack: () => void;
}) {
  const [page, setPage] = useState<ArtistPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let alive = true;
    setPage(null);
    setError(null);
    fetch(`/api/artist?name=${encodeURIComponent(band.name)}&id=${band.id || 0}`)
      .then(async (r) => {
        const d = (await r.json()) as ArtistPage & { error?: string };
        if (!alive) return;
        if (!r.ok || d.error) setError(d.error ?? "Grup bilgisi alınamadı.");
        else setPage(d);
      })
      .catch(() => alive && setError("Grup bilgisi alınamadı."));
    return () => {
      alive = false;
    };
  }, [band.name, band.id]);

  const artist = page?.artist ?? band;
  // Bu grubun popüler listedeki (hazır tonu olan) şarkıları
  const ready = useMemo(() => {
    const n = normArtist(artist.name);
    return popular.filter((e) => e.ready && normArtist(e.artist) === n);
  }, [popular, artist.name]);
  const readyBy = useMemo(() => new Map(ready.map((e) => [normTitle(e.title), e])), [ready]);
  const songs = useMemo(() => {
    const f = filter.trim().toLocaleLowerCase("tr");
    return (page?.songs ?? []).filter((s) => !f || s.title.toLocaleLowerCase("tr").includes(f));
  }, [page, filter]);

  return (
    <div className="space-y-10">
      <section className="rise overflow-hidden rounded-[28px] bg-ink text-white">
        <div className="flex flex-wrap items-center gap-7 px-8 py-9">
          <BandAvatar name={artist.name} picture={artist.picture} size={168} />
          <div className="min-w-0 flex-1">
            <button onClick={onBack} className="mb-3 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-white/80 hover:bg-white/20">
              ← Geri
            </button>
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">Grup / sanatçı</div>
            <h1 className="headline mt-1 break-words text-[52px] leading-[1.02]">{artist.name}</h1>
            <p className="mt-2 text-[15px] text-white/70">
              {[fansText(artist.fans), page ? `${page.songs.length} popüler şarkı` : "", page && Object.keys(page.ready ?? {}).length ? `${Object.keys(page.ready).length} şarkının tüm bölümleri hazır` : ready.length ? `${ready.length} hazır ton` : ""].filter(Boolean).join(" · ")}
              {page?.artist.inLibrary && <span className="ml-3 rounded-full bg-petrol px-2.5 py-0.5 text-[12px] font-bold text-white">Kütüphanede</span>}
            </p>
          </div>
        </div>
      </section>

      {ready.length > 0 && (
        <PopularRail title="Hazır tonlar" subtitle="Stüdyo tonu önceden araştırıldı; tıklayınca anında açılır" entries={ready} onOpen={onPopular} />
      )}

      <section>
        <div className="mb-5 flex flex-wrap items-end gap-4">
          <div className="mr-auto">
            <h2 className="headline text-[26px] text-ink">Şarkıları</h2>
            <p className="text-sm text-ink-mute">Bir şarkıya tıkla, seçtiğin bölümün tonu araştırılsın</p>
          </div>
          <Segmented label="Bölüm" options={PARTS.map((p) => ({ id: p.id, label: PART_SHORT[p.id] ?? p.label }))} value={part} onChange={onPart} />
          <input className="hud-input !w-56 !rounded-full !py-2" placeholder="Şarkılarda ara…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Grubun şarkılarında ara" />
        </div>

        {error && <p className="rounded-2xl bg-panel py-10 text-center text-sm text-ink-mute">{error}</p>}
        {!page && !error && (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="hud-scan h-[72px] rounded-2xl bg-panel" />
            ))}
          </div>
        )}
        {page && songs.length === 0 && <p className="rounded-2xl bg-panel py-10 text-center text-sm text-ink-mute">Şarkı bulunamadı.</p>}
        {page && songs.length > 0 && (
          <ol className="grid gap-x-6 gap-y-1 md:grid-cols-2">
            {songs.map((s, i) => {
              const hit = readyBy.get(normTitle(s.title));
              const sheet = page.ready?.[normTitle(s.title)] ?? [];
              const first = sheet.find((p) => p.part === part) ?? sheet[0];
              return (
                <li key={`${s.title}-${i}`}>
                  <button
                    onClick={() => (first ? onSheetPart(s, first) : hit ? onPopular(hit) : onSong(s))}
                    className="group flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left hover:bg-panel"
                  >
                    <span className="w-6 shrink-0 text-right text-[15px] font-bold text-ink-mute">{i + 1}</span>
                    <Artwork src={s.artwork} title={s.title} size={52} rounded={10} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-ink group-hover:underline">{s.title}</span>
                      <span className="block truncate text-[13px] text-ink-mute">{s.album || artist.name}</span>
                    </span>
                    {sheet.length > 0 ? (
                      <span className="shrink-0 rounded-full bg-petrol px-3 py-1.5 text-xs font-bold text-white" title={sheet.map((p) => p.label).join(" · ")}>
                        Hazır · {sheet.length} bölüm
                      </span>
                    ) : hit ? (
                      <span className="shrink-0 rounded-full bg-petrol px-3 py-1.5 text-xs font-bold text-white">Hazır ton · {PART_SHORT[hit.part]}</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-panel px-3 py-1.5 text-xs font-bold text-ink-soft group-hover:bg-ink group-hover:text-white">
                        Tonu bul →
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

export interface ShelfArtist {
  id: number;
  name: string;
  picture: string;
  fans: number;
  region: "world" | "tr";
  count: number;
}

/** Ana sayfa: grup kütüphanesi (dünya / Türkçe rock), yuvarlak grup resimleri */
export function LibraryShelf({ artists, onOpen }: { artists: ShelfArtist[]; onOpen: (a: ShelfArtist) => void }) {
  const [region, setRegion] = useState<"world" | "tr">("world");
  const [all, setAll] = useState(false);
  const list = artists.filter((a) => a.region === region);
  const shown = all ? list : list.slice(0, 12);
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <h2 className="headline text-[26px] text-ink">Grup kütüphanesi</h2>
          <p className="text-sm text-ink-mute">{artists.length} ünlü grup, her birinin en popüler 20 şarkısı. Gruba tıkla, şarkıları açılsın.</p>
        </div>
        <Segmented
          label=""
          options={[
            { id: "world", label: `Dünya (${artists.filter((a) => a.region === "world").length})` },
            { id: "tr", label: `Türkçe rock (${artists.filter((a) => a.region === "tr").length})` },
          ]}
          value={region}
          onChange={(v) => {
            setRegion(v);
            setAll(false);
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
        {shown.map((a) => (
          <button key={a.id || a.name} onClick={() => onOpen(a)} className="group flex flex-col items-center text-center">
            <span className="lift block rounded-full">
              <BandAvatar name={a.name} picture={a.picture} size={128} />
            </span>
            <span className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-tight text-ink group-hover:underline">{a.name}</span>
            <span className="text-[12px] text-ink-mute">{a.count} şarkı</span>
          </button>
        ))}
      </div>
      {list.length > 12 && (
        <div className="mt-6 text-center">
          <button onClick={() => setAll((v) => !v)} className="pill pill-soft">
            {all ? "Daha az göster" : `Tümünü gör (${list.length})`}
          </button>
        </div>
      )}
    </section>
  );
}

/** Serbest metin araması: "Bunu mu aradın?" paneli (grup adı yazıldıysa şarkı gibi araştırılmaz) */
export function ResolvePanel({
  query,
  loading,
  artists,
  songs,
  web,
  canWeb,
  onArtist,
  onSong,
  onWeb,
  onRaw,
  onClose,
}: {
  query: string;
  loading: boolean;
  artists: ArtistHit[];
  songs: SongHit[];
  web: { loading: boolean; error?: string; done: boolean } | null;
  canWeb: boolean;
  onArtist: (a: ArtistHit) => void;
  onSong: (s: SongHit) => void;
  onWeb: () => void;
  onRaw: () => void;
  onClose: () => void;
}) {
  const empty = !loading && artists.length === 0 && songs.length === 0;
  return (
    <section className="hud-panel rise p-6 text-left">
      <div className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="headline text-[26px] text-ink">“{query}” için sonuçlar</h2>
          <p className="text-sm text-ink-mute">Grup mu, şarkı mı? Birini seç; grup seçersen şarkılarının listesi açılır.</p>
        </div>
        <button onClick={onClose} className="rounded-full px-3 py-1.5 text-ink-mute hover:bg-panel hover:text-ink" aria-label="Kapat">
          ✕
        </button>
      </div>

      {loading && <p className="py-6 text-sm text-ink-mute">Aranıyor…</p>}

      {artists.length > 0 && (
        <>
          <div className="hud-label mb-2">Gruplar ve sanatçılar</div>
          <div className="mb-6 flex flex-wrap gap-3">
            {artists.map((a) => (
              <button key={`${a.id}-${a.name}`} onClick={() => onArtist(a)} className="lift flex items-center gap-3 rounded-full bg-panel py-2 pl-2 pr-5 hover:bg-raised">
                <BandAvatar name={a.name} picture={a.picture} size={56} />
                <span className="text-left">
                  <span className="block text-[16px] font-bold text-ink">{a.name}</span>
                  <span className="block text-xs font-semibold text-petrol">Şarkılarını gör →</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {songs.length > 0 && (
        <>
          <div className="hud-label mb-1">Şarkılar</div>
          <div className="grid gap-x-6 md:grid-cols-2">
            {songs.map((s, i) => (
              <button key={`${s.title}-${s.artist}-${i}`} onClick={() => onSong(s)} className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-panel">
                <Artwork src={s.artwork} title={s.title} size={46} rounded={8} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-ink">{s.title}</span>
                  <span className="block truncate text-xs text-ink-mute">
                    {s.artist}
                    {s.album && ` · ${s.album}`}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {empty && (
        <div className="rounded-2xl bg-panel p-5 text-sm text-ink-soft">
          {web?.done ? "Web'de de eşleşen bir grup ya da şarkı bulunamadı." : "Grup kütüphanesinde ve müzik servislerinde (Deezer, iTunes) eşleşme yok."}
          {web?.error && <p className="mt-2 text-bad">{web.error}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            {canWeb && !web?.done && (
              <button onClick={onWeb} disabled={web?.loading} className="pill pill-primary">
                {web?.loading ? "Claude Code web'de arıyor…" : "Claude Code ile web'de ara"}
              </button>
            )}
            <button onClick={onRaw} className="pill pill-ghost">
              Yine de “{query}” adlı şarkıyı araştır
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const PART_NAMES: Record<string, string> = { lead: "Solo", rhythm: "Ritim", intro: "Riff", clean: "Temiz", full: "Genel" };

/** Sonuç ekranı: şarkının kütüphanede hazır olan bütün gitar bölümleri (tıklayınca o bölüm açılır) */
export function SongParts({
  song,
  artist,
  part,
  partDetail,
  onPick,
}: {
  song: string;
  artist: string;
  part: string;
  partDetail: string;
  onPick: (p: { part: string; label: string }) => void;
}) {
  const [parts, setParts] = useState<{ part: string; label: string }[]>([]);
  useEffect(() => {
    let alive = true;
    if (!song || !artist) return setParts([]);
    fetch(`/api/library/song?title=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`)
      .then((r) => r.json() as Promise<{ parts?: { part: string; label: string }[] }>)
      .then((d) => alive && setParts(d.parts ?? []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [song, artist]);
  if (parts.length < 2) return null;
  const activeIdx = Math.max(
    0,
    parts.findIndex((p) => (partDetail ? normArtist(p.label) === normArtist(partDetail) : p.part === part)),
  );
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-2xl bg-panel px-4 py-3">
      <span className="hud-label mr-2">Bu şarkıdaki gitar bölümleri</span>
      {parts.map((p, i) => (
        <button
          key={`${p.part}-${p.label}`}
          onClick={() => onPick(p)}
          aria-pressed={i === activeIdx}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${i === activeIdx ? "bg-ink text-white" : "bg-paper text-ink-soft hover:text-ink"}`}
        >
          {p.label} <span className="opacity-60">· {PART_NAMES[p.part] ?? p.part}</span>
        </button>
      ))}
    </section>
  );
}

interface JobStatusView {
  enabled: boolean;
  running: boolean;
  total: number;
  ready: number;
  current: string[];
  waitingUntil: number | null;
  lastError: string | null;
  doneThisRun: number;
  failed: number;
}

/**
 * Kütüphane araştırması: kütüphanedeki bütün şarkıların bütün gitar bölümleri Claude Code ile bir kez
 * araştırılıp bu bilgisayara kaydedilir; sonra limit dolsa da hepsi anında açılır.
 */
export function LibraryJobCard({ canResearch }: { canResearch: boolean }) {
  const [st, setSt] = useState<JobStatusView | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/library/job")
        .then((r) => r.json() as Promise<JobStatusView>)
        .then((d) => alive && setSt(d))
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const act = async (action: "start" | "stop") => {
    setBusy(true);
    try {
      const r = await fetch("/api/library/job", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      setSt((await r.json()) as JobStatusView);
    } finally {
      setBusy(false);
    }
  };

  if (!st) return null;
  const pct = st.total ? Math.round((st.ready / st.total) * 100) : 0;
  const waiting = st.waitingUntil && st.waitingUntil > Date.now();
  return (
    <section className="rounded-[22px] border border-line bg-paper p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="headline text-[22px] text-ink">Kütüphane araştırması</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-mute">
            Kütüphanedeki her şarkının bütün gitar bölümleri (riff, ritim, temiz/caz, solo) Claude Code ile bir kez araştırılıp bu
            bilgisayara kaydedilir. Sonra Claude limitin dolsa da hepsi anında açılır. Uygulama açık kaldıkça çalışır; limit dolunca bekler ve
            kendiliğinden devam eder.
          </p>
        </div>
        {st.enabled ? (
          <button disabled={busy} onClick={() => void act("stop")} className="pill pill-dark">
            Durdur
          </button>
        ) : (
          <button disabled={busy || !canResearch || st.ready >= st.total} onClick={() => void act("start")} className="pill pill-primary">
            {st.ready > 0 ? "Devam et" : "Başlat"}
          </button>
        )}
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-panel">
        <div className="h-full rounded-full bg-petrol transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-soft">
        <span>
          <b className="text-ink">{st.ready}</b> / {st.total} şarkı hazır (%{pct})
        </span>
        {st.doneThisRun > 0 && <span>bu oturumda {st.doneThisRun} şarkı</span>}
        {st.failed > 0 && <span>{st.failed} şarkı sonra tekrar denenecek</span>}
        {!canResearch && <span className="text-warn">Başlatmak için bu bilgisayarda Claude Code gerekli.</span>}
      </div>
      {st.enabled && (
        <p className="mt-2 text-[13px] text-ink-mute">
          {waiting
            ? `Claude kullanım limiti doldu; ${new Date(st.waitingUntil!).toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit" })} civarı yeniden denenecek.`
            : st.current.length
              ? `Araştırılıyor: ${st.current.join(" · ")}`
              : st.running
                ? "Sıradaki şarkıya geçiliyor…"
                : "Başlatılıyor…"}
        </p>
      )}
    </section>
  );
}
