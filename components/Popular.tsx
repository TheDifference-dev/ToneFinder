"use client";

import { useMemo, useState } from "react";
import type { PopularEntry } from "@/lib/popular";
import { Artwork, colorFor, Dots } from "./ui";

// Songsterr'in en popüler 100 şarkısı: tanıtım bloğu, sanatçı kutuları, kart şeridi ve tam liste.
// Hazır (önceden araştırılmış) şarkılara tıklanınca orijinal ton anında açılır.

const PART_SHORT: Record<string, string> = { lead: "Solo", rhythm: "Ritim", intro: "Riff", clean: "Temiz", full: "Genel" };

function Cover({ e, size = "full", rounded = 16 }: { e: PopularEntry; size?: "full" | number; rounded?: number }) {
  if (!e.artwork) {
    return size === "full" ? (
      <span
        className="headline flex aspect-square w-full items-center justify-center text-[64px] text-white"
        style={{ borderRadius: rounded, background: colorFor(e.title) }}
        aria-hidden
      >
        {e.title.charAt(0)}
      </span>
    ) : (
      <Artwork title={e.title} size={size} rounded={rounded} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={e.artwork}
      alt=""
      loading="lazy"
      className={size === "full" ? "aspect-square w-full object-cover" : "shrink-0 object-cover"}
      style={size === "full" ? { borderRadius: rounded } : { width: size, height: size, borderRadius: rounded }}
    />
  );
}

/** Büyük petrol mavisi tanıtım bloğu (kapak kolajı + başlık) */
export function PopularPromo({ entries, onBrowse }: { entries: PopularEntry[]; onBrowse: () => void }) {
  const ready = entries.filter((e) => e.ready).length;
  const covers = entries.filter((e) => e.artwork).slice(0, 4);
  return (
    <section className="rise grid overflow-hidden rounded-[28px] bg-petrol p-5 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="grid grid-cols-2 gap-3 md:max-w-[440px]">
        {covers.map((e) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={e.slug} src={e.artwork} alt="" className="aspect-square w-full rounded-2xl object-cover" />
        ))}
      </div>
      <div className="flex flex-col justify-center gap-5 px-4 py-8 md:px-10">
        <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">Songsterr · en popüler 100</div>
        <h2 className="headline text-[44px] leading-[1.02] md:text-[52px]">Efsane riff&apos;lerin tonu tek tıkla hazır</h2>
        <p className="max-w-md text-[16px] leading-relaxed text-white/85">
          En çok çalınan 100 şarkının stüdyo kaydındaki gitar, amfi ve pedalları önceden araştırıldı.
          {ready > 0 && ready < entries.length && ` Şimdilik ${ready} şarkı hazır.`} Bir karta tıkla, orijinal ton anında açılsın.
        </p>
        <div>
          <button onClick={onBrowse} className="pill pill-dark">
            Listeye göz at
          </button>
        </div>
      </div>
    </section>
  );
}

/** Sanatçıya göre keşfet: en çok şarkısı olan gruplar */
export function ArtistTiles({ entries, onPick }: { entries: PopularEntry[]; onPick: (artist: string) => void }) {
  const tiles = useMemo(() => {
    const by = new Map<string, PopularEntry[]>();
    for (const e of entries) by.set(e.artist, [...(by.get(e.artist) ?? []), e]);
    return [...by.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[1][0].rank - b[1][0].rank)
      .slice(0, 8)
      .map(([artist, list]) => ({ artist, count: list.length, cover: list.find((e) => e.artwork) ?? list[0] }));
  }, [entries]);

  return (
    <section>
      <h2 className="headline text-[26px] text-ink">Gruba göre keşfet</h2>
      <p className="mb-4 text-sm text-ink-mute">Listede en çok şarkısı olan gruplar</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.artist} onClick={() => onPick(t.artist)} className="lift group relative overflow-hidden rounded-2xl text-left">
            <Cover e={t.cover} rounded={16} />
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-4">
              <span className="headline block text-[22px] leading-tight text-white">{t.artist}</span>
              <span className="text-[13px] font-semibold text-white/75">{t.count} şarkı</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Tek şarkı kartı */
export function PopularCard({ e, onOpen }: { e: PopularEntry; onOpen: (e: PopularEntry) => void }) {
  return (
    <button onClick={() => onOpen(e)} className="group text-left">
      <span className="lift relative block overflow-hidden rounded-2xl">
        <Cover e={e} rounded={16} />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ink px-2.5 py-1 text-[12px] font-extrabold text-white">#{e.rank}</span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink">{PART_SHORT[e.part] ?? e.part}</span>
        {!e.ready && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">Canlı araştırılır</span>
        )}
      </span>
      <span className="mt-2.5 block truncate text-[15px] font-bold text-ink group-hover:underline">{e.title}</span>
      <span className="block truncate text-[13px] text-ink-mute">{e.artist}</span>
      {e.ready && (
        <span className="mt-1.5 flex items-center gap-2 text-[12px] text-ink-soft">
          <Dots value={e.difficulty} /> <span>Zorluk</span>
        </span>
      )}
      {e.tags.length > 0 && <span className="mt-1 block truncate text-[12px] text-ink-mute">{e.tags.slice(0, 2).join(" · ")}</span>}
    </button>
  );
}

/** Yatay kart şeridi */
export function PopularRail({ title, subtitle, entries, onOpen }: { title: string; subtitle?: string; entries: PopularEntry[]; onOpen: (e: PopularEntry) => void }) {
  return (
    <section>
      <h2 className="headline text-[26px] text-ink">{title}</h2>
      {subtitle && <p className="mb-4 text-sm text-ink-mute">{subtitle}</p>}
      <div className="rail" style={{ gridAutoColumns: "minmax(190px, 1fr)" }}>
        {entries.map((e) => (
          <PopularCard key={e.slug} e={e} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/** Tüm liste: arama ve gruba göre süzme */
export function PopularGrid({
  entries,
  onOpen,
  artist,
  onArtist,
}: {
  entries: PopularEntry[];
  onOpen: (e: PopularEntry) => void;
  artist: string;
  onArtist: (a: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const f = q.trim().toLocaleLowerCase("tr");
    return entries.filter(
      (e) => (!artist || e.artist === artist) && (!f || `${e.title} ${e.artist}`.toLocaleLowerCase("tr").includes(f)),
    );
  }, [entries, q, artist]);

  return (
    <section id="popular-100" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 className="headline text-[26px] text-ink">Popüler 100</h2>
          <p className="text-sm text-ink-mute">Songsterr&apos;de en çok açılan şarkılar, sırasıyla</p>
        </div>
        {artist && (
          <button onClick={() => onArtist("")} className="pill pill-dark !py-2 text-[13px]">
            {artist} ✕
          </button>
        )}
        <input className="hud-input !w-64 !rounded-full" placeholder="Listede ara…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Popüler listede ara" />
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl bg-panel py-12 text-center text-sm text-ink-mute">Bu aramaya uyan şarkı yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((e) => (
            <PopularCard key={e.slug} e={e} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
