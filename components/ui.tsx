"use client";

// Ortak arayüz parçaları: hap düğmeler, hap seçiciler, sayfa bandı, kapak resmi, puan noktaları
// ve uygulama simgesi. Renkler app/globals.css'teki tema değişkenlerinden gelir.

/** Kapak resmi olmayan şarkılar için koyu renk paleti (üstündeki yazı beyaz) */
export const CARD_COLORS = ["#0b5f6b", "#0f1012", "#4a4d53", "#074751", "#2a7f8c", "#2c2e32"] as const;

/** Aynı metin hep aynı rengi alsın */
export function colorFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CARD_COLORS[h % CARD_COLORS.length];
}

export function Pill({
  children,
  tone = "soft",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "dark" | "ghost" | "soft" }) {
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
      <div className="flex rounded-full bg-panel p-1">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              value === o.id ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sayfa başı: koyu renkli blok + küçük etiket + kalın başlık, altında açıklama şeridi */
export function PageBand({
  kicker,
  title,
  color = "var(--color-petrol)",
  children,
  action,
}: {
  kicker: string;
  title: string;
  color?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rise overflow-hidden rounded-[22px] border border-line">
      <div className="px-8 pb-9 pt-8 text-white" style={{ background: color }}>
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">{kicker}</div>
        <h1 className="headline mt-2 text-[44px] leading-[1.02]">{title}</h1>
      </div>
      {(children || action) && (
        <div className="flex flex-wrap items-center gap-4 bg-paper px-8 py-5">
          <div className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">{children}</div>
          {action}
        </div>
      )}
    </section>
  );
}

/** Kapak resmi; yoksa şarkı adının baş harfiyle koyu kare */
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
  /** Koyu bant üstünde: beyaz zemin, renkli harf */
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
      className="headline flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: inverted ? "#fff" : colorFor(title),
        color: inverted ? colorFor(title) : "#fff",
        fontSize: size * 0.45,
      }}
    >
      {title.trim().charAt(0).toLocaleUpperCase("tr") || "♪"}
    </span>
  );
}

/** Puan noktaları (Tripadvisor balonları gibi): ör. zorluk 3/5 */
export function Dots({ value, max = 5, color = "var(--color-petrol)" }: { value: number; max?: number; color?: string }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${value}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="h-[11px] w-[11px] rounded-full"
          style={{ background: i < value ? color : "transparent", border: `1.5px solid ${color}` }}
        />
      ))}
    </span>
  );
}

/** Uygulama simgesi: siyah kare üzerinde petrol mavisi ton düğmesi */
export function AppMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#0f1012" />
      <path d="M17.4 46.6 A 20 20 0 1 1 46.6 46.6" fill="none" stroke="#3a3d42" strokeWidth="6" strokeLinecap="round" />
      <path d="M17.4 46.6 A 20 20 0 0 1 44.1 15.8" fill="none" stroke="#2a9aab" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="9" fill="#ffffff" />
      <line x1="32" y1="32" x2="39" y2="22.5" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#0b5f6b" />
    </svg>
  );
}
