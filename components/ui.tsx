"use client";

// Ortak arayüz parçaları: hap düğmeler, hap seçiciler, renkli sayfa bandı, kapaklı liste satırı
// ve uygulama simgesi. Renkler app/globals.css'teki tema değişkenlerinden gelir.

export const CARD_COLORS = [
  "var(--color-c-lime)",
  "var(--color-c-pink)",
  "var(--color-c-orange)",
  "var(--color-c-purple)",
  "var(--color-c-yellow)",
  "var(--color-c-blue)",
  "var(--color-c-red)",
  "var(--color-c-mint)",
] as const;

/** Aynı metin hep aynı rengi alsın (şarkı başlığı → kart rengi) */
export function colorFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CARD_COLORS[h % CARD_COLORS.length];
}

export function Pill({
  children,
  tone = "ghost",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "light" | "dark" | "ghost" }) {
  return (
    <button {...props} className={`pill pill-${tone} ${className ?? ""}`}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
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
    <div className="flex items-center gap-2.5" role="group" aria-label={label || undefined}>
      {label && <span className="hud-label">{label}</span>}
      <div className="flex rounded-full bg-raised p-1">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              value === o.id ? "bg-ink text-cream-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sayfa başı: üstte düz renkli alan + küçük etiket + serif başlık, altta koyu açıklama şeridi */
export function PageBand({
  kicker,
  title,
  color,
  children,
  action,
}: {
  kicker: string;
  title: string;
  color: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rise overflow-hidden rounded-[22px] bg-panel">
      <div className="px-7 pb-8 pt-7" style={{ background: color }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-cream-ink/70">{kicker}</div>
        <h1 className="serif mt-2 text-[40px] font-semibold leading-[1.05] text-cream-ink">{title}</h1>
      </div>
      {(children || action) && (
        <div className="flex flex-wrap items-center gap-4 px-7 py-5">
          <div className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">{children}</div>
          {action}
        </div>
      )}
    </section>
  );
}

/** Kapak resmi; yoksa şarkı adının baş harfiyle renkli kare */
export function Artwork({
  src,
  title,
  size = 44,
  rounded = 8,
  inverted,
}: {
  src?: string;
  title: string;
  size?: number;
  rounded?: number;
  /** Renkli bant üstünde: koyu zemin, renkli harf */
  inverted?: boolean;
}) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={size} height={size} className="shrink-0 object-cover" style={{ width: size, height: size, borderRadius: rounded }} />
    );
  return (
    <span
      aria-hidden
      className="serif flex shrink-0 items-center justify-center font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: inverted ? "var(--color-cream-ink)" : colorFor(title),
        color: inverted ? colorFor(title) : "var(--color-cream-ink)",
        fontSize: size * 0.45,
      }}
    >
      {title.trim().charAt(0).toLocaleUpperCase("tr") || "♪"}
    </span>
  );
}

/** Uygulama simgesi: koyu kare üzerinde yeşil ton düğmesi */
export function AppMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#121314" />
      <path d="M17.4 46.6 A 20 20 0 1 1 46.6 46.6" fill="none" stroke="#3a3c41" strokeWidth="6" strokeLinecap="round" />
      <path d="M17.4 46.6 A 20 20 0 0 1 44.1 15.8" fill="none" stroke="#d4f28a" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="9" fill="#f5f3ee" />
      <line x1="32" y1="32" x2="39" y2="22.5" stroke="#f5f3ee" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#ff92c8" />
    </svg>
  );
}
