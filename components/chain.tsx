// Sinyal zinciri bileşenleri: kategori renkli bloklar (BOSS TONE STUDIO'daki CHAIN görünümü gibi),
// IN/OUT uçları ve bloklar arası ince hat. Hem orijinal stüdyo ekipmanı hem uyarlanmış zincir kullanır.

export type Category = "guitar" | "dyn" | "drive" | "amp" | "mod" | "delay" | "reverb" | "cab";

export const CATEGORY: Record<Category, { label: string; color: string }> = {
  guitar: { label: "Gitar", color: "var(--color-cat-guitar)" },
  dyn: { label: "Dinamik", color: "var(--color-cat-dyn)" },
  drive: { label: "Drive", color: "var(--color-cat-drive)" },
  amp: { label: "Amfi", color: "var(--color-cat-amp)" },
  mod: { label: "Modülasyon", color: "var(--color-cat-mod)" },
  delay: { label: "Delay", color: "var(--color-cat-delay)" },
  reverb: { label: "Reverb", color: "var(--color-cat-reverb)" },
  cab: { label: "Kabin", color: "var(--color-cat-cab)" },
};

/** Pedal/blok adından kategori tahmini */
export function categoryOf(text: string): Category {
  const t = text.toLowerCase();
  if (/reverb|verb|spring|plate|hall/.test(t)) return "reverb";
  if (/delay|echo|echoplex|memory man|dd-\d/.test(t)) return "delay";
  if (/chorus|flang|phase|phaser|vibe|trem|octav|wah|whammy|pitch|rotary|leslie|mod/.test(t)) return "mod";
  if (/comp|gate|suppress|eq|equaliz|volume|tuner|dyna/.test(t)) return "dyn";
  if (/cab|ir\b|mic|speaker|kabin|mikrofon/.test(t)) return "cab";
  if (/amp|amfi|preamp|head|marshall|mesa|fender|vox|plexi/.test(t)) return "amp";
  return "drive";
}

export function ChainCap({ label }: { label: string }) {
  return (
    <span className="flex h-9 shrink-0 items-center rounded-full bg-raised px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
      {label}
    </span>
  );
}

export function ChainLink() {
  return <span className="w-5 shrink-0 border-t-2 border-dotted border-line-strong" aria-hidden />;
}

export function ChainBlock({
  category,
  title,
  sub,
  selected,
  dim,
  dot,
  onClick,
}: {
  category: Category;
  title: string;
  sub?: string;
  selected?: boolean;
  dim?: boolean;
  /** Sağ üstte küçük durum noktası rengi (kesinlik) */
  dot?: string;
  onClick?: () => void;
}) {
  const c = CATEGORY[category];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex h-[76px] w-40 shrink-0 flex-col justify-center overflow-hidden rounded-2xl px-3.5 text-left transition hover:-translate-y-0.5 ${
        dim ? "opacity-40" : ""
      }`}
      style={{
        background: selected ? c.color : "var(--color-panel)",
        boxShadow: selected ? `0 10px 24px -12px ${c.color}` : `inset 0 3px 0 ${c.color}`,
      }}
    >
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: selected ? "rgba(255,255,255,0.75)" : c.color }}
      >
        {sub ?? c.label}
      </span>
      <span className={`mt-0.5 line-clamp-2 text-[13.5px] font-semibold leading-tight ${selected ? "text-white" : "text-ink"}`}>{title}</span>
      {dot && (
        <span
          className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
          style={{ background: dot, boxShadow: selected ? "0 0 0 2px rgba(255,255,255,0.6)" : undefined }}
          aria-hidden
        />
      )}
    </button>
  );
}

export function ChainRow({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 flex items-center overflow-x-auto px-1 pb-3 pt-1">{children}</div>;
}
