"use client";

import { useEffect, useState } from "react";
import { AMP_NAMES, ampEffectsOf, ampModeNames, matchAmp } from "@/lib/amps";
import { AMP_EFFECTS, AMP_MODES, matchDevice, PICKUP_CONFIGS, PROCESSOR_SUGGESTIONS, type AmpMode, type UserRig } from "@/lib/gear";
import { GUITAR_NAMES, guessPickups, matchGuitar } from "@/lib/guitars";
import { matchPedal, PEDAL_NAMES, PEDAL_TYPES } from "@/lib/pedals";
import { matchPickup, PICKUP_MODEL_NAMES, PICKUP_OUTPUT_LABELS, PICKUP_POSITIONS, type PickupPosition } from "@/lib/pickups";
import type { GearProfile } from "@/lib/schema";
import type { NamedRig } from "@/lib/storage";

type GearKind = GearProfile["kind"];

function Hint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={`mt-1.5 block text-xs ${ok ? "text-ok" : "text-ink-mute"}`}>{children}</span>;
}

// ---------- "Web'de tanıt": katalogda olmayan ekipman ----------

type Profiles = Record<string, GearProfile | null | "loading" | { error: string }>;

function useGearProfiles(names: string[]) {
  const [profiles, setProfiles] = useState<Profiles>({});
  const key = names.join("\n");

  useEffect(() => {
    const missing = names.filter((n) => !(n in profiles));
    if (missing.length === 0) return;
    const params = new URLSearchParams();
    missing.forEach((n) => params.append("name", n));
    fetch(`/api/gear?${params}`)
      .then((r) => r.json() as Promise<{ profiles?: Record<string, GearProfile | null> }>)
      .then((d) => setProfiles((prev) => ({ ...prev, ...Object.fromEntries(missing.map((n) => [n, d.profiles?.[n] ?? null])) })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function identify(name: string, kind: GearKind) {
    setProfiles((prev) => ({ ...prev, [name]: "loading" }));
    try {
      const res = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind }),
      });
      const data = (await res.json()) as { profile?: GearProfile; error?: string };
      setProfiles((prev) => ({ ...prev, [name]: data.profile ?? { error: data.error ?? "Araştırılamadı." } }));
    } catch {
      setProfiles((prev) => ({ ...prev, [name]: { error: "Bağlantı kurulamadı." } }));
    }
  }

  return { profiles, identify };
}

function WebIdentify({
  name,
  kind,
  state,
  onIdentify,
  canIdentify,
}: {
  name: string;
  kind: GearKind;
  state: Profiles[string] | undefined;
  onIdentify: (name: string, kind: GearKind) => void;
  canIdentify: boolean;
}) {
  if (state === "loading") return <Hint ok={false}>Web'de araştırılıyor… (30–60 sn)</Hint>;
  if (state && typeof state === "object" && "error" in state) return <Hint ok={false}>✕ {state.error}</Hint>;
  if (state && typeof state === "object") {
    return state.exists ? (
      <Hint ok>
        ✓ Web'den tanıtıldı: {state.brand} {state.model}
        {state.controls.length > 0 && ` — ${state.controls.slice(0, 8).join(", ")}`}
      </Hint>
    ) : (
      <span className="mt-1.5 block rounded-md border border-warn/40 bg-warn/10 px-2 py-1 text-xs text-warn">
        Böyle bir model bulunamadı: {state.summary} Adı kontrol et.
      </span>
    );
  }
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
      Katalogda yok.
      <button
        type="button"
        disabled={!canIdentify}
        onClick={() => onIdentify(name, kind)}
        className="rounded border border-line px-1.5 py-0.5 font-semibold text-accent hover:border-accent disabled:opacity-40"
        title={canIdentify ? "Ekipmanı web'de araştırıp kanallarını, düğmelerini ve efektlerini kaydeder" : "API anahtarı gerekli"}
      >
        Web'de tanıt
      </button>
    </span>
  );
}

// ---------- Rig seçici ----------

function RigBar({
  rigs,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  rigs: NamedRig[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const active = rigs.find((r) => r.id === activeId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (editing) {
    return (
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onRename(name.trim().slice(0, 40));
          setEditing(false);
        }}
      >
        <input className="hud-input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Rig adı" autoFocus />
        <button type="submit" className="shrink-0 rounded-md bg-ink px-3 text-sm font-semibold text-white">
          Tamam
        </button>
      </form>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select className="hud-input min-w-0 flex-1" value={activeId} onChange={(e) => onSelect(e.target.value)} aria-label="Rig seç">
        {rigs.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          setName(active?.name ?? "");
          setEditing(true);
        }}
        className="rounded-md border border-line px-2 py-2 text-xs text-ink-soft hover:border-accent hover:text-accent"
        title="Yeniden adlandır"
      >
        Ad
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-md border border-line px-2 py-2 text-xs text-ink-soft hover:border-accent hover:text-accent"
        title="Yeni rig (şu anki ekipmanın kopyası)"
      >
        + Yeni
      </button>
      {rigs.length > 1 && (
        <button
          type="button"
          onClick={() => {
            if (confirm(`"${active?.name}" rig'i silinsin mi?`)) onDelete();
          }}
          className="rounded-md border border-line px-2 py-2 text-xs text-ink-mute hover:border-bad hover:text-bad"
          title="Bu rig'i sil"
        >
          Sil
        </button>
      )}
    </div>
  );
}

// ---------- Pedallar ----------

function PedalList({
  value,
  onChange,
  identify,
}: {
  value: string;
  onChange: (v: string) => void;
  identify: (row: string) => React.ReactNode;
}) {
  // Satırlar bileşende tutulur: boş liste ile tek boş satır aynı metne ("") karşılık geldiği için
  // yalnız metinden türetilirse "+ Pedal ekle" boş satır açamaz. Rig değişince metinden yeniden kurulur.
  const [rows, setRows] = useState<string[]>(() => (value === "" ? [] : value.split("\n")));
  useEffect(() => {
    if (value !== rows.join("\n")) setRows(value === "" ? [] : value.split("\n"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const set = (next: string[]) => {
    setRows(next);
    onChange(next.join("\n"));
  };
  return (
    <div>
      <span className="hud-label mb-1.5 block">Pedallarım</span>
      <ul className="space-y-2">
        {rows.map((row, i) => {
          const p = row.trim() ? matchPedal(row) : undefined;
          return (
            <li key={i}>
              <div className="flex gap-1.5">
                <input
                  className="hud-input"
                  list="pedal-suggestions"
                  placeholder="ör. Ibanez TS9, Boss DD-8"
                  value={row}
                  onChange={(e) => set(rows.map((r, j) => (j === i ? e.target.value : r)))}
                  aria-label={`Pedal ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => set(rows.filter((_, j) => j !== i))}
                  className="shrink-0 rounded-md border border-line px-2.5 text-sm text-ink-mute hover:border-bad hover:text-bad"
                  aria-label={`Pedal ${i + 1} sil`}
                >
                  ✕
                </button>
              </div>
              {p ? (
                <Hint ok>
                  ✓ {PEDAL_TYPES[p.type]} · {p.controls.join(", ")}
                </Hint>
              ) : (
                row.trim().length > 2 && identify(row.trim())
              )}
            </li>
          );
        })}
      </ul>
      <datalist id="pedal-suggestions">
        {PEDAL_NAMES.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={() => set([...rows, ""])}
        className="mt-2 rounded-md border border-dashed border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-accent hover:text-accent"
      >
        + Pedal ekle
      </button>
    </div>
  );
}

// ---------- Manyetik modelleri ----------

/** Dizilime göre hangi pozisyonlarda manyetik var */
function positionsFor(layout: string): PickupPosition[] {
  if (["SSS", "HSS", "HSH"].includes(layout)) return ["neck", "middle", "bridge"];
  if (["P", "MM", "bass-active"].includes(layout)) return ["bridge"];
  return ["neck", "bridge"];
}

function PickupModels({ rig, onChange }: { rig: UserRig; onChange: (patch: Partial<UserRig>) => void }) {
  const custom = Object.values(rig.pickupModels).some((v) => v.trim());
  return (
    <details className="rounded-md border border-line bg-paper px-3 py-2" open={custom}>
      <summary className="cursor-pointer text-xs font-semibold text-ink-soft">Manyetikler stok değil mi? (isteğe bağlı)</summary>
      <div className="mt-2 space-y-2">
        {positionsFor(rig.pickups).map((pos) => {
          const label = PICKUP_POSITIONS.find((p) => p.id === pos)!.label;
          const value = rig.pickupModels[pos];
          const known = value.trim() ? matchPickup(value) : undefined;
          return (
            <label key={pos} className="block">
              <span className="hud-label mb-1 block">{label}</span>
              <input
                className="hud-input"
                list="pickup-suggestions"
                placeholder="Stok"
                value={value}
                onChange={(e) => onChange({ pickupModels: { ...rig.pickupModels, [pos]: e.target.value } })}
              />
              {known && (
                <Hint ok>
                  ✓ {known.kind}, {PICKUP_OUTPUT_LABELS[known.output]}
                </Hint>
              )}
            </label>
          );
        })}
        <datalist id="pickup-suggestions">
          {PICKUP_MODEL_NAMES.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
    </details>
  );
}

// ---------- Panel ----------

export function RigPanel({
  rig,
  onChange,
  rigs,
  activeId,
  onRigSelect,
  onRigCreate,
  onRigRename,
  onRigDelete,
  canIdentify,
}: {
  rig: UserRig;
  onChange: (patch: Partial<UserRig>) => void;
  rigs: NamedRig[];
  activeId: string;
  onRigSelect: (id: string) => void;
  onRigCreate: () => void;
  onRigRename: (name: string) => void;
  onRigDelete: () => void;
  /** API anahtarı varsa "Web'de tanıt" kullanılabilir */
  canIdentify: boolean;
}) {
  const amp = matchAmp(rig.amp);
  const ampDevice = rig.amp.trim() ? matchDevice(rig.amp) : undefined;
  const processorDevice = rig.processor.trim() ? matchDevice(rig.processor) : undefined;
  const guitar = rig.guitar.trim() ? matchGuitar(rig.guitar) : undefined;
  const available = amp ? ampEffectsOf(amp) : null;
  const isNone = (t: string) => !t.trim() || /^(yok|none|-)$/i.test(t.trim());

  const unknownNames = [
    !isNone(rig.amp) && !amp && !ampDevice ? rig.amp.trim() : "",
    !isNone(rig.processor) && !processorDevice ? rig.processor.trim() : "",
    rig.guitar.trim() && !guitar ? rig.guitar.trim() : "",
    ...rig.pedals.split("\n").map((p) => p.trim()).filter((p) => p.length > 2 && !matchPedal(p)),
  ].filter((n) => n.length > 2);
  const { profiles, identify } = useGearProfiles(unknownNames);
  const webIdentify = (name: string, kind: GearKind) => (
    <WebIdentify name={name} kind={kind} state={profiles[name]} onIdentify={identify} canIdentify={canIdentify} />
  );

  function setAmp(text: string) {
    const next = matchAmp(text);
    // katalogdan farklı bir amfi seçilince, cihazda olan efektler kendiliğinden işaretlenir
    if (next && next.id !== amp?.id) onChange({ amp: text, ampEffects: ampEffectsOf(next) });
    else onChange({ amp: text });
  }

  return (
    <section className="hud-panel p-5" aria-labelledby="rig-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="hud-label text-accent">RIG</span>
        <h2 id="rig-title" className="text-sm font-bold uppercase tracking-wider">
          Ekipmanım
        </h2>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-4">
        <RigBar
          rigs={rigs}
          activeId={activeId}
          onSelect={onRigSelect}
          onCreate={onRigCreate}
          onRename={onRigRename}
          onDelete={onRigDelete}
        />

        <label className="block">
          <span className="hud-label mb-1.5 block">Amfi</span>
          <input
            className="hud-input"
            list="amp-suggestions"
            placeholder="ör. Boss Dual Cube LX, Marshall DSL40CR — amfi yoksa boş bırak"
            value={rig.amp}
            onChange={(e) => setAmp(e.target.value)}
          />
          <datalist id="amp-suggestions">
            {AMP_NAMES.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          {amp ? (
            <>
              <Hint ok>
                ✓ Katalogda: {amp.brand} {amp.model}
                {amp.verified && " · üretici kılavuzundan"}
              </Hint>
              <span className="mt-1 flex flex-wrap gap-1">
                {ampModeNames(amp)
                  .slice(0, 10)
                  .map((m) => (
                    <span key={m} className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                      {m}
                    </span>
                  ))}
              </span>
            </>
          ) : ampDevice ? (
            <Hint ok={Boolean(ampDevice.verified)}>
              {ampDevice.verified ? "✓ Doğrulanmış model listesi kullanılacak" : "Model listesi araştırma sırasında bulunur"}
            </Hint>
          ) : (
            !isNone(rig.amp) && rig.amp.trim().length > 2 && webIdentify(rig.amp.trim(), "amp")
          )}
        </label>

        {rig.amp.trim() && (
          <label className="block">
            <span className="hud-label mb-1.5 block">Amfiyi nasıl kullanıyorsun?</span>
            <select className="hud-input" value={rig.ampMode} onChange={(e) => onChange({ ampMode: e.target.value as AmpMode })}>
              {AMP_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            {rig.ampMode === "monitor" && amp?.monitor && (
              <span className="mt-1.5 block rounded-md bg-accent-soft px-2.5 py-1.5 text-xs text-ink">{amp.monitor}</span>
            )}
          </label>
        )}

        {rig.amp.trim() && rig.ampMode !== "monitor" && (
          <fieldset>
            <legend className="hud-label mb-1.5 block">
              Amfinin kendi efektleri {available ? "(katalogdan; soluk olanlar bu amfide yok)" : "(varsa)"}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {AMP_EFFECTS.map((fx) => {
                const on = rig.ampEffects.includes(fx);
                const missing = available !== null && !available.includes(fx);
                return (
                  <button
                    type="button"
                    key={fx}
                    aria-pressed={on}
                    onClick={() => onChange({ ampEffects: on ? rig.ampEffects.filter((e) => e !== fx) : [...rig.ampEffects, fx] })}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on
                        ? "border-ink bg-ink text-white"
                        : missing
                          ? "border-dashed border-line bg-white text-ink-mute/60"
                          : "border-line bg-white text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    {fx}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <label className="block">
          <span className="hud-label mb-1.5 block">Gitar prosesörü / multi-efekt / yazılım (varsa)</span>
          <input
            className="hud-input"
            list="processor-suggestions"
            placeholder="ör. HeadRush Core, AmpliTube 5 — yoksa boş bırak"
            value={rig.processor}
            onChange={(e) => onChange({ processor: e.target.value })}
          />
          <datalist id="processor-suggestions">
            {PROCESSOR_SUGGESTIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {processorDevice ? (
            <Hint ok={Boolean(processorDevice.verified)}>
              {processorDevice.verified ? "✓ Doğrulanmış model listesi kullanılacak" : "Model listesi araştırma sırasında bulunur"}
            </Hint>
          ) : (
            !isNone(rig.processor) && rig.processor.trim().length > 2 && webIdentify(rig.processor.trim(), "processor")
          )}
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Gitar / bas modeli</span>
          <input
            className="hud-input"
            list="guitar-suggestions"
            placeholder="ör. Fender Player Stratocaster, Fender Precision Bass"
            value={rig.guitar}
            onChange={(e) => {
              const value = e.target.value;
              const pickups = guessPickups(value);
              onChange(pickups ? { guitar: value, pickups } : { guitar: value });
            }}
          />
          <datalist id="guitar-suggestions">
            {GUITAR_NAMES.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          {guitar ? (
            <Hint ok>
              ✓ Katalogda: {guitar.brand} {guitar.model} — {guitar.pickupDetail}
            </Hint>
          ) : (
            rig.guitar.trim().length > 2 && webIdentify(rig.guitar.trim(), "guitar")
          )}
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Manyetik dizilimi</span>
          <select className="hud-input" value={rig.pickups} onChange={(e) => onChange({ pickups: e.target.value })}>
            {PICKUP_CONFIGS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <PickupModels rig={rig} onChange={onChange} />

        <PedalList value={rig.pedals} onChange={(pedals) => onChange({ pedals })} identify={(row) => webIdentify(row, "pedal")} />

        {!rig.amp.trim() && !rig.processor.trim() && (
          <p className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
            Ton bulmak için en az bir amfi ya da prosesör yaz.
          </p>
        )}
        <p className="text-xs text-ink-mute">Ekipmanın bu bilgisayarda otomatik kaydedilir.</p>
      </div>
    </section>
  );
}
