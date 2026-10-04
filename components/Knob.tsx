// 0–10 ölçekli değerleri amfi düğmesi gibi gösterir; sayısal olmayan
// değerler (ör. "380 ms", "On") için yalnızca etiket kutusu çizer.

const START = -135;
const SWEEP = 270;

export function parseKnobValue(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)(?:\s*\/\s*10)?$/);
  if (!match) return null;
  const n = Number(match[1].replace(",", "."));
  return n >= 0 && n <= 10 ? n : null;
}

export function Knob({ name, value, note }: { name: string; value: string; note?: string }) {
  const numeric = parseKnobValue(value);

  return (
    <div className="flex w-20 flex-col items-center gap-1 text-center" title={note || undefined}>
      {numeric !== null ? (
        <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden>
          <circle cx="32" cy="32" r="26" className="fill-neutral-800 stroke-neutral-600" strokeWidth="2" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = ((START + (SWEEP * i) / 10 - 90) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={32 + Math.cos(a) * 28}
                y1={32 + Math.sin(a) * 28}
                x2={32 + Math.cos(a) * 31}
                y2={32 + Math.sin(a) * 31}
                className="stroke-neutral-500"
                strokeWidth="1.5"
              />
            );
          })}
          <g transform={`rotate(${START + (SWEEP * numeric) / 10} 32 32)`}>
            <line x1="32" y1="32" x2="32" y2="10" className="stroke-amber-400" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="32" cy="32" r="4" className="fill-neutral-600" />
        </svg>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-1 text-[11px] font-semibold leading-tight text-amber-300">
          {value}
        </div>
      )}
      <div className="text-xs font-medium text-neutral-200">{name}</div>
      {numeric !== null && <div className="text-xs tabular-nums text-amber-300">{value}</div>}
    </div>
  );
}
