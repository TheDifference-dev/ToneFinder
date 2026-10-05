"use client";

import { AMP_SUGGESTIONS, GUITAR_SUGGESTIONS, guessPickups, matchDevice, PICKUP_CONFIGS, PROCESSOR_SUGGESTIONS, type UserRig } from "@/lib/gear";

function DeviceHint({ text }: { text: string }) {
  if (!text.trim() || /^yok$/i.test(text.trim())) return null;
  const device = matchDevice(text);
  if (device?.verified) return <span className="mt-1.5 block text-xs text-ok">✓ Doğrulanmış model listesi kullanılacak</span>;
  return <span className="mt-1.5 block text-xs text-ink-mute">Kanalları ve düğmeleri araştırma sırasında bulunur</span>;
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
            placeholder="ör. Marshall DSL40CR, Boss Katana 50"
            value={rig.amp}
            onChange={(e) => onChange({ amp: e.target.value })}
          />
          <datalist id="amp-suggestions">
            {AMP_SUGGESTIONS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <DeviceHint text={rig.amp} />
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
            {GUITAR_SUGGESTIONS.map((g) => (
              <option key={g.name} value={g.name} />
            ))}
          </datalist>
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
