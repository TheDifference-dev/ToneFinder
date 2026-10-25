// 0–10 ölçekli değerleri halka gösterge olarak çizer (değer ortada, etiket altta);
// sayısal olmayan değerler (ör. "380 ms", "On", "Dyn 57") için düz bir gösterge kutusu.

const START = -135;
const SWEEP = 270;

export function parseKnobValue(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)(?:\s*\/\s*10)?$/);
  if (!match) return null;
  const n = Number(match[1].replace(",", "."));
  return n >= 0 && n <= 10 ? n : null;
}

function arc(fraction: number) {
  const r = 26;
  const toXY = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [32 + Math.cos(a) * r, 32 + Math.sin(a) * r];
  };
  const [x1, y1] = toXY(START);
  const [x2, y2] = toXY(START + SWEEP * fraction);
  const large = SWEEP * fraction > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const BASIS_LABEL = {
  cited: { label: "kaynaklı", cls: "text-ok" },
  inferred: { label: "çıkarım", cls: "text-ink-mute" },
  check: { label: "kontrol et", cls: "text-warn" },
} as const;

export function Knob({
  name,
  value,
  basis,
}: {
  name: string;
  value: string;
  /** Ayarın dayanağı; eski kayıtlarda ve orijinal ekipmanda yok */
  basis?: keyof typeof BASIS_LABEL;
}) {
  const numeric = parseKnobValue(value);
  const b = basis ? BASIS_LABEL[basis] : undefined;

  return (
    <div className="flex w-[84px] flex-col items-center gap-1 text-center">
      {numeric !== null ? (
        <svg viewBox="0 0 64 64" className="h-16 w-16" role="img" aria-label={`${name} ${value}`}>
          <path d={arc(1)} fill="none" stroke="var(--color-line)" strokeWidth="4" strokeLinecap="round" />
          {numeric > 0 && <path d={arc(numeric / 10)} fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />}
          <text
            x="32"
            y="38"
            textAnchor="middle"
            fontSize="17"
            fontWeight="600"
            fill="var(--color-ink)"
            style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </text>
        </svg>
      ) : (
        <div className="flex h-16 w-full items-center justify-center rounded-md border border-line bg-raised px-1.5 font-display text-sm font-semibold leading-tight text-ink">
          {value}
        </div>
      )}
      <div className="font-display text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{name}</div>
      {b && <div className={`font-display text-[10px] uppercase tracking-wider ${b.cls}`}>{b.label}</div>}
    </div>
  );
}
