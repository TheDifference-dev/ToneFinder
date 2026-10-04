// 0–10 ölçekli değerleri amfi düğmesi gibi gösterir; sayısal olmayan
// değerler (ör. "380 ms", "On", "Dyn 57") için dijital gösterge kutusu çizer.

const START = -135;
const SWEEP = 270;

export function parseKnobValue(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)(?:\s*\/\s*10)?$/);
  if (!match) return null;
  const n = Number(match[1].replace(",", "."));
  return n >= 0 && n <= 10 ? n : null;
}

function arc(fraction: number) {
  const r = 27;
  const toXY = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [32 + Math.cos(a) * r, 32 + Math.sin(a) * r];
  };
  const [x1, y1] = toXY(START);
  const [x2, y2] = toXY(START + SWEEP * fraction);
  const large = SWEEP * fraction > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function Knob({ name, value, note }: { name: string; value: string; note?: string }) {
  const numeric = parseKnobValue(value);

  return (
    <div className="flex w-[76px] flex-col items-center gap-1 text-center" title={note || undefined}>
      {numeric !== null ? (
        <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden>
          <path d={arc(1)} fill="none" stroke="var(--color-line)" strokeWidth="3" strokeLinecap="round" />
          {numeric > 0 && (
            <path d={arc(numeric / 10)} fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
          )}
          <circle cx="32" cy="32" r="19" fill="#ffffff" stroke="var(--color-line-strong)" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="15" fill="var(--color-ink)" />
          <g transform={`rotate(${START + (SWEEP * numeric) / 10} 32 32)`}>
            <line x1="32" y1="31" x2="32" y2="19" stroke="var(--color-signal)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-line-strong bg-ink px-1 font-mono text-[10px] font-semibold leading-tight text-white">
          {value}
        </div>
      )}
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{name}</div>
      {numeric !== null && <div className="font-mono text-xs font-semibold text-accent">{value}</div>}
    </div>
  );
}
