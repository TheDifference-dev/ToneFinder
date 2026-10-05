"use client";

import { AMP_NAMES, matchAmp } from "@/lib/amps";
import { AMP_MODES, matchDevice, PICKUP_CONFIGS, PROCESSOR_SUGGESTIONS, type AmpMode, type UserRig } from "@/lib/gear";
import { GUITAR_NAMES, guessPickups, matchGuitar } from "@/lib/guitars";

function Hint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={`mt-1.5 block text-xs ${ok ? "text-ok" : "text-ink-mute"}`}>{children}</span>;
}

function DeviceHint({ text }: { text: string }) {
  if (!text.trim() || /^yok$/i.test(text.trim())) return null;
  const device = matchDevice(text);
  if (device?.verified) return <Hint ok>✓ Doğrulanmış model listesi kullanılacak</Hint>;
  return <Hint ok={false}>Model listesi araştırma sırasında bulunur</Hint>;
}

function AmpHint({ text }: { text: string }) {
  if (!text.trim()) return null;
  const amp = matchAmp(text);
  if (amp) return <Hint ok>✓ Katalogda: {amp.brand} {amp.model} — kanalları ve modları biliniyor</Hint>;
  return <DeviceHint text={text} />;
}

function GuitarHint({ text }: { text: string }) {
  const g = text.trim() ? matchGuitar(text) : undefined;
  if (!g) return null;
  return <Hint ok>✓ Katalogda: {g.brand} {g.model} — {g.pickupDetail}</Hint>;
}

export function RigPanel({ rig, onChange }: { rig: UserRig; onChange: (patch: Partial<UserRig>) => void }) {
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
        <label className="block">
          <span className="hud-label mb-1.5 block">Amfi</span>
          <input
            className="hud-input"
            list="amp-suggestions"
            placeholder="ör. Boss Dual Cube LX, Marshall DSL40CR"
            value={rig.amp}
            onChange={(e) => onChange({ amp: e.target.value })}
          />
          <datalist id="amp-suggestions">
            {AMP_NAMES.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <AmpHint text={rig.amp} />
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Amfiyi nasıl kullanıyorsun?</span>
          <select className="hud-input" value={rig.ampMode} onChange={(e) => onChange({ ampMode: e.target.value as AmpMode })}>
            {AMP_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {rig.ampMode === "monitor" && matchAmp(rig.amp)?.monitor && (
            <span className="mt-1.5 block rounded-md bg-accent-soft px-2.5 py-1.5 text-xs text-ink">{matchAmp(rig.amp)?.monitor}</span>
          )}
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Gitar prosesörü / multi-efekt (varsa)</span>
          <input
            className="hud-input"
            list="processor-suggestions"
            placeholder="ör. HeadRush Core, Line 6 HX Stomp — yoksa boş bırak"
            value={rig.processor}
            onChange={(e) => onChange({ processor: e.target.value })}
          />
          <datalist id="processor-suggestions">
            {PROCESSOR_SUGGESTIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <DeviceHint text={rig.processor} />
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Gitar modeli</span>
          <input
            className="hud-input"
            list="guitar-suggestions"
            placeholder="ör. Fender Player Stratocaster"
            value={rig.guitar}
            onChange={(e) => {
              const guitar = e.target.value;
              const pickups = guessPickups(guitar);
              onChange(pickups ? { guitar, pickups } : { guitar });
            }}
          />
          <datalist id="guitar-suggestions">
            {GUITAR_NAMES.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <GuitarHint text={rig.guitar} />
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Manyetikler</span>
          <select className="hud-input" value={rig.pickups} onChange={(e) => onChange({ pickups: e.target.value })}>
            {PICKUP_CONFIGS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="hud-label mb-1.5 block">Pedallarım (her satıra bir tane)</span>
          <textarea
            className="hud-input min-h-20"
            placeholder={"ör. Ibanez TS9\nDunlop Cry Baby\nBoss DD-8"}
            value={rig.pedals}
            onChange={(e) => onChange({ pedals: e.target.value })}
          />
        </label>

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
