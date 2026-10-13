"use client";

import { useEffect, useRef, useState } from "react";
import type { SongHit } from "@/app/api/songs/route";

// Şarkı alanı: yazdıkça iTunes/Deezer'dan öneri getirir; seçilince şarkı, sanatçı ve kapak dolar.
// Öneri gelmezse (internet yok vb.) alanlar serbest metin olarak çalışmaya devam eder.
export function SongSearch({
  song,
  artist,
  artwork,
  onChange,
}: {
  song: string;
  artist: string;
  artwork: string;
  onChange: (patch: { song?: string; artist?: string; artwork?: string }) => void;
}) {
  const [hits, setHits] = useState<SongHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const skipNext = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = [song, artist].map((s) => s.trim()).filter(Boolean).join(" ");
    if (song.trim().length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/songs?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json() as Promise<{ songs?: SongHit[] }>)
        .then((d) => {
          setHits(d.songs ?? []);
          setActive(-1);
        })
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [song, artist]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function pick(h: SongHit) {
    skipNext.current = true;
    onChange({ song: h.title, artist: h.artist, artwork: h.artwork });
    setOpen(false);
    setHits([]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? hits.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(hits[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={box} className="relative grid gap-3 sm:grid-cols-[auto_1fr_1fr]">
      <div className="hidden h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line bg-paper sm:block" aria-hidden>
        {artwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
        )}
      </div>
      <input
        className="hud-input"
        placeholder="Şarkı (ör. Master of Puppets)"
        value={song}
        onChange={(e) => {
          onChange({ song: e.target.value, artwork: "" });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        required
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls="song-hits"
        aria-autocomplete="list"
        aria-label="Şarkı"
        autoComplete="off"
      />
      <input
        className="hud-input"
        placeholder="Sanatçı (ör. Metallica)"
        value={artist}
        onChange={(e) => onChange({ artist: e.target.value })}
        aria-label="Sanatçı"
        autoComplete="off"
      />
      {open && hits.length > 0 && (
        <ul
          id="song-hits"
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-line-strong bg-white p-1 shadow-lg"
        >
          {hits.map((h, i) => (
            <li key={`${h.title}-${h.artist}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(h)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left ${
                  i === active ? "bg-accent-soft" : "hover:bg-paper"
                }`}
              >
                <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-paper">
                  {h.artwork && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.artwork} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{h.title}</span>
                  <span className="block truncate text-xs text-ink-mute">
                    {h.artist}
                    {h.album && ` · ${h.album}`}
                    {h.year && ` · ${h.year}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
