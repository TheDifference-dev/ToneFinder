"use client";

import { useState } from "react";

export type KeyStatus = { configured: boolean; source: "env" | "file" | null; cli?: { version: string } | null };

// Ayarlar: araştırmayı yapan motorun durumu (Claude Code ya da API) ve API anahtarı.
// Anahtar sunucu tarafında ~/.tonefinder/settings.json dosyasına yazılır, tarayıcıya geri gönderilmez.
export function SettingsPanel({
  status,
  onSaved,
  onClose,
}: {
  status: KeyStatus;
  onSaved: (status: KeyStatus) => void;
  onClose?: () => void;
}) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = (await res.json()) as KeyStatus & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setKey("");
      onSaved({ ...status, configured: data.configured, source: data.source });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const res = await fetch("/api/settings", { method: "DELETE" });
    if (res.ok) onSaved({ ...status, ...((await res.json()) as KeyStatus) });
  }

  return (
    <section className="hud-panel p-6" aria-labelledby="settings-title">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="settings-title" className="font-display text-xl font-bold uppercase tracking-wide text-ink">
          Ayarlar
        </h2>
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-ink-mute hover:bg-raised hover:text-ink" aria-label="Kapat">
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-raised p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="hud-label text-ink-soft">1 · Şarkı araştırması</span>
            <span className={`font-display text-sm font-semibold uppercase ${status.configured || status.cli ? "text-ok" : "text-bad"}`}>
              {status.configured ? "API" : status.cli ? `Claude Code ${status.cli.version}` : "Hazır değil"}
            </span>
          </div>
          {!status.configured && !status.cli && (
            <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
              <p>Claude aboneliğinle, API anahtarı olmadan çalışır. Bu bilgisayarda bir kez:</p>
              <p>
                1. PowerShell: <code className="rounded bg-panel px-1.5 py-0.5 text-ink">irm https://claude.ai/install.ps1 | iex</code>
              </p>
              <p>
                2. <code className="rounded bg-panel px-1.5 py-0.5 text-ink">claude</code> yaz, hesabınla giriş yap.
              </p>
              <p>3. ToneFinder&apos;ı kapatıp yeniden aç.</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-line bg-raised p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="hud-label text-ink-soft">2 · Ekipmana çevirme</span>
            <span className={`font-display text-sm font-semibold uppercase ${status.configured ? "text-ok" : "text-ink-mute"}`}>
              {status.configured ? `API anahtarı${status.source === "env" ? " (ortam)" : ""}` : "API anahtarı gerekli"}
            </span>
          </div>
          <details className="mt-3" open={false}>
            <summary className="cursor-pointer text-sm text-accent">{status.configured ? "Anahtarı değiştir" : "API anahtarı gir"}</summary>
            <p className="mt-2 text-xs text-ink-mute">
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                console.anthropic.com
              </a>{" "}
              → Billing (kredi) → API Keys. Ücretli, aboneliğe dahil değil. Anahtar yalnız bu bilgisayarda saklanır.
            </p>
            <form onSubmit={save} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="hud-input font-mono"
                type="password"
                autoComplete="off"
                placeholder="sk-ant-..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                aria-label="Anthropic API anahtarı"
              />
              <button
                type="submit"
                disabled={saving || !key.trim()}
                className="shrink-0 rounded-md bg-accent px-5 py-2 font-display text-sm font-bold uppercase tracking-wider text-paper disabled:opacity-40"
              >
                {saving ? "Doğrulanıyor…" : "Kaydet"}
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-bad">{error}</p>}
            {status.configured && status.source === "file" && (
              <button type="button" onClick={remove} className="mt-3 text-xs text-ink-mute hover:text-bad">
                Kayıtlı anahtarı sil
              </button>
            )}
          </details>
        </div>
      </div>
    </section>
  );
}
