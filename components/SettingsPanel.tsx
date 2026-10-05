"use client";

import { useState } from "react";

export type KeyStatus = { configured: boolean; source: "env" | "file" | null };

// Anthropic API anahtarını uygulama içinden kaydetme ekranı. Anahtar sunucu tarafında
// ~/.tonefinder/settings.json dosyasına yazılır ve tarayıcıya hiç geri gönderilmez.
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
      onSaved({ configured: data.configured, source: data.source });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const res = await fetch("/api/settings", { method: "DELETE" });
    if (res.ok) onSaved((await res.json()) as KeyStatus);
  }

  return (
    <section className="hud-panel p-6" aria-labelledby="settings-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="hud-label text-accent">CFG</span>
        <h2 id="settings-title" className="text-sm font-bold uppercase tracking-wider">
          Yapay zekâ bağlantısı
        </h2>
        <span className="h-px flex-1 bg-line" />
        {onClose && status.configured && (
          <button type="button" onClick={onClose} className="text-sm font-semibold text-accent hover:underline">
            Kapat
          </button>
        )}
      </div>

      {status.configured ? (
        <p className="mb-4 rounded-md border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">
          ✓ API anahtarı ayarlı{status.source === "env" ? " (ortam değişkeninden)" : ""}. İstersen aşağıdan yenisiyle değiştirebilirsin.
        </p>
      ) : (
        <p className="mb-4 text-ink-soft">
          ToneFinder şarkıları internette araştırmak için Anthropic'in yapay zekâsını kullanır. Bunun için bir kez API anahtarı
          girmen gerekiyor; anahtar yalnızca bu bilgisayarda saklanır.
        </p>
      )}

      <ol className="mb-5 grid gap-2 text-sm text-ink">
        <li>
          <b className="font-mono text-accent">1.</b>{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">
            console.anthropic.com
          </a>{" "}
          adresinde hesap aç.
        </li>
        <li>
          <b className="font-mono text-accent">2.</b> <i>Billing</i> bölümünden kredi yükle (Claude aboneliğinden ayrı ücretlendirilir;
          bir şarkı araştırması tahminen 0,3–1 $).
        </li>
        <li>
          <b className="font-mono text-accent">3.</b> <i>API Keys</i> bölümünden yeni anahtar oluştur, kopyala ve aşağıya yapıştır.
        </li>
      </ol>

      <form onSubmit={save} className="flex flex-col gap-3 sm:flex-row">
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
          className="shrink-0 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-ink disabled:opacity-40"
        >
          {saving ? "Doğrulanıyor…" : "Kaydet"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      {status.configured && status.source === "file" && (
        <button type="button" onClick={remove} className="mt-4 text-xs text-ink-mute hover:text-bad">
          Kayıtlı anahtarı bu bilgisayardan sil
        </button>
      )}
    </section>
  );
}
