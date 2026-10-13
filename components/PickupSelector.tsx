// Gitarın manyetik seçicisini çizer ve önerilen konumu işaretler.
// 5'li bıçak (SSS / HSS / HSH) ya da 3'lü toggle (HH, SS, P-90...). Bas ve tek manyetikli
// dizilimlerde seçici olmadığı için hiçbir şey çizilmez.

type Selector = "neck" | "neck_middle" | "middle" | "middle_bridge" | "bridge" | "neck_bridge" | "none";

const FIVE_WAY: { id: Selector; label: string }[] = [
  { id: "bridge", label: "Köprü" },
  { id: "middle_bridge", label: "Köprü + orta" },
  { id: "middle", label: "Orta" },
  { id: "neck_middle", label: "Orta + sap" },
  { id: "neck", label: "Sap" },
];

const THREE_WAY: { id: Selector; label: string }[] = [
  { id: "neck", label: "Sap (Rhythm)" },
  { id: "neck_bridge", label: "İkisi" },
  { id: "bridge", label: "Köprü (Treble)" },
];

const NO_SELECTOR = ["P", "PJ", "JJ", "MM", "bass-active", "bass-HH"];

export function PickupSelector({ layout, selected }: { layout?: string; selected?: Selector }) {
  if (!layout || !selected || selected === "none" || NO_SELECTOR.includes(layout)) return null;
  const fiveWay = ["SSS", "HSS", "HSH"].includes(layout);
  const positions = fiveWay ? FIVE_WAY : THREE_WAY;
  // 3'lü seçicide ara konumlar en yakın konuma eşlenir
  const target: Selector = fiveWay
    ? selected === "neck_bridge"
      ? "middle"
      : selected
    : selected === "middle" || selected === "neck_middle" || selected === "middle_bridge"
      ? "neck_bridge"
      : selected;
  const index = positions.findIndex((p) => p.id === target);
  if (index < 0) return null;

  const w = 220;
  const step = (w - 40) / (positions.length - 1);
  const x = (i: number) => 20 + i * step;

  return (
    <figure className="rounded-lg border border-line bg-paper p-3">
      <figcaption className="hud-label mb-2">{fiveWay ? "5'li seçici" : "3'lü seçici"}</figcaption>
      <svg viewBox={`0 0 ${w} 74`} className="h-auto w-full max-w-[260px]" role="img" aria-label={`Seçici: ${positions[index].label}`}>
        <rect x="12" y="18" width={w - 24} height="12" rx="6" fill="#fff" stroke="var(--color-line-strong)" />
        {positions.map((p, i) => (
          <circle key={p.id} cx={x(i)} cy="24" r="3" fill={i === index ? "var(--color-accent)" : "var(--color-line-strong)"} />
        ))}
        <rect x={x(index) - 7} y="6" width="14" height="36" rx="4" fill="var(--color-ink)" />
        <rect x={x(index) - 2} y="10" width="4" height="10" rx="2" fill="var(--color-signal)" />
        {positions.map((p, i) => (
          <text
            key={p.id}
            x={x(i)}
            y="62"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight={i === index ? 700 : 400}
            fill={i === index ? "var(--color-accent)" : "var(--color-ink-mute)"}
          >
            {p.label.split(" (")[0]}
          </text>
        ))}
      </svg>
    </figure>
  );
}
