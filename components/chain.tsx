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
    <span className="flex h-16 shrink-0 items-center rounded-md border border-line bg-panel px-2 font-display text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
      {label}
    </span>
  );
}

export function ChainLink() {
  return <span className="h-px w-4 shrink-0 bg-line-strong" aria-hidden />;
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
      className={`relative flex h-16 w-36 shrink-0 flex-col justify-center rounded-md border-2 px-2.5 text-left transition ${
        dim ? "opacity-40" : ""
      }`}
      style={{
        borderColor: c.color,
        background: selected ? `color-mix(in srgb, ${c.color} 16%, var(--color-raised))` : "var(--color-raised)",
        boxShadow: selected ? `0 0 14px -4px ${c.color}` : undefined,
      }}
    >
      <span className="font-display text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.color }}>
        {sub ?? c.label}
      </span>
      <span className="line-clamp-2 text-[13px] font-medium leading-tight text-ink">{title}</span>
      {dot && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />}
    </button>
  );
}

export function ChainRow({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 flex items-center overflow-x-auto px-1 pb-2">{children}</div>;
}
