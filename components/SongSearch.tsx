"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ArtistHit, SongHit } from "@/app/api/songs/route";

// Tek arama kutusu: şarkı ya da grup adı yazılır.
// - Yazılana uyan gruplar/sanatçılar ve şarkılar listelenir (Deezer / iTunes, anahtarsız).
// - Bir gruba tıklanınca o grubun popüler şarkıları gelir; şarkıya tıklanınca seçilir.
// - Öneri gelmezse yazılan metin şarkı adı olarak kullanılır.
type Item = { kind: "artist"; artist: ArtistHit } | { kind: "song"; song: SongHit };

export function SongSearch({
  song,
  artist,
  artwork,
  onChange,
  big = false,
  action,
}: {
  song: string;
  artist: string;
  artwork: string;
  onChange: (patch: { song?: string; artist?: string; artwork?: string }) => void;
  big?: boolean;
  /** Kutunun sağındaki düğme (ör. "Tonu bul") */
  action?: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const [songs, setSongs] = useState<SongHit[]>([]);
  const [artists, setArtists] = useState<ArtistHit[]>([]);
  const [browsing, setBrowsing] = useState<ArtistHit | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const selected = Boolean(song.trim() && artist.trim());

  // Dışarıdan şarkı temizlenirse (ör. yeni arama) kutu da temizlensin
  useEffect(() => {
    if (!song) setText("");
  }, [song]);

  // Yazdıkça ara
  useEffect(() => {
    if (browsing) return;
    const q = text.trim();
    if (q.length < 2) {
      setSongs([]);
      setArtists([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/songs?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json() as Promise<{ songs?: SongHit[]; artists?: ArtistHit[] }>)
        .then((d) => {
          setSongs(d.songs ?? []);
          setArtists(d.artists ?? []);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, browsing]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const items: Item[] = useMemo(() => {
    if (!browsing)
      return [...artists.map((a) => ({ kind: "artist" as const, artist: a })), ...songs.map((s) => ({ kind: "song" as const, song: s }))];
    const f = text.trim().toLocaleLowerCase("tr");
    return songs.filter((s) => !f || s.title.toLocaleLowerCase("tr").includes(f)).map((s) => ({ kind: "song" as const, song: s }));
  }, [artists, songs, browsing, text]);

  function browse(a: ArtistHit) {
    setBrowsing(a);
    setText("");
    onChange({ song: "", artist: "", artwork: "" });
    setSongs([]);
    setActive(-1);
    setLoading(true);
    fetch(`/api/songs?artist=${encodeURIComponent(a.name)}&id=${a.id}`)
      .then((r) => r.json() as Promise<{ songs?: SongHit[] }>)
      .then((d) => setSongs(d.songs ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
    input.current?.focus();
  }

  function pick(h: SongHit) {
    onChange({ song: h.title, artist: h.artist, artwork: h.artwork });
    setText("");
    setBrowsing(null);
    setOpen(false);
    setSongs([]);
    setArtists([]);
  }

  function clear() {
    onChange({ song: "", artist: "", artwork: "" });
    setText("");
    setBrowsing(null);
    setTimeout(() => input.current?.focus(), 0);
  }

  function choose(it: Item) {
    if (it.kind === "artist") browse(it.artist);
    else pick(it.song);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !text && browsing) {
      setBrowsing(null);
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const h = big ? "h-[68px]" : "h-[54px]";
  const showList = open && (browsing || text.trim().length >= 2);

  return (
    <div ref={box} className="relative">
      <div
        className={`flex ${h} items-center gap-3 rounded-full border-2 border-ink bg-paper pl-5 pr-2 shadow-[0_6px_24px_-10px_rgba(15,16,18,0.35)] focus-within:border-petrol`}
      >
        <svg width={big ? 22 : 18} height={big ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="shrink-0 text-ink" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        {selected ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artwork} alt="" className={`${big ? "h-11 w-11" : "h-9 w-9"} shrink-0 rounded-lg object-cover`} />
            ) : null}
            <span className="min-w-0">
              <span className={`block truncate font-bold text-ink ${big ? "text-lg" : "text-[15px]"}`}>{song}</span>
              <span className="block truncate text-[13px] text-ink-mute">{artist}</span>
            </span>
            <button
              type="button"
              onClick={clear}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-panel hover:text-ink"
              aria-label="Seçimi temizle"
            >
              ✕
            </button>
            <span className="flex-1" />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {browsing && (
              <button
                type="button"
                onClick={() => setBrowsing(null)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-white"
                title="Gruba göre aramayı kapat"
              >
                {browsing.picture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={browsing.picture} alt="" className="h-6 w-6 rounded-full object-cover" />
                )}
                {browsing.name} ✕
              </button>
            )}
            <input
              ref={input}
              className={`min-w-0 flex-1 bg-transparent font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-mute ${big ? "text-[19px]" : "text-base"}`}
              placeholder={browsing ? "Bu grubun şarkılarında ara…" : "Şarkı ya da grup adı yaz…"}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (!browsing) onChange({ song: e.target.value, artist: "", artwork: "" });
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded={Boolean(showList)}
              aria-controls="song-hits"
              aria-autocomplete="list"
              aria-label="Şarkı ya da grup"
              autoComplete="off"
            />
          </div>
        )}
        {action}
      </div>

      {showList && (
        <div
          id="song-hits"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[420px] overflow-y-auto rounded-3xl border border-line bg-paper p-2 text-left shadow-[0_24px_60px_-20px_rgba(15,16,18,0.45)]"
        >
          {loading && items.length === 0 && <p className="px-4 py-3 text-sm text-ink-mute">Aranıyor…</p>}
          {!loading && items.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-mute">
              {browsing ? "Bu grubun şarkıları bulunamadı." : "Sonuç yok; yazdığın şarkı adı olarak araştırılabilir."}
            </p>
          )}
          {browsing && items.length > 0 && <div className="hud-label px-3 pb-1 pt-2">{browsing.name} · popüler şarkılar</div>}
          {!browsing && artists.length > 0 && <div className="hud-label px-3 pb-1 pt-2">Gruplar ve sanatçılar</div>}
          {items.map((it, i) => (
              <div key={it.kind === "artist" ? `a-${it.artist.id}` : `s-${it.song.title}-${it.song.artist}-${i}`}>
                {!browsing && it.kind === "song" && i === artists.length && <div className="hud-label px-3 pb-1 pt-3">Şarkılar</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(it)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${i === active ? "bg-panel" : "hover:bg-panel"}`}
                >
                  {it.kind === "artist" ? (
                    <>
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-raised">
                        {it.artist.picture && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.artist.picture} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-ink">{it.artist.name}</span>
                        <span className="block text-xs text-ink-mute">Grup / sanatçı</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-petrol px-3 py-1.5 text-xs font-bold text-white">Şarkılarını gör →</span>
                    </>
                  ) : (
                    <>
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-raised">
                        {it.song.artwork && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.song.artwork} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{it.song.title}</span>
                        <span className="block truncate text-xs text-ink-mute">
                          {it.song.artist}
                          {it.song.album && ` · ${it.song.album}`}
                          {it.song.year && ` · ${it.song.year}`}
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
