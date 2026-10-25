// Tarayıcıda saklanan kullanıcı verileri (ekipman profili ve kaydedilen tonlar).
// localStorage erişilemezse (gizli pencere vb.) sessizce varsayılana döner.

import { migrateRig, type Instrument, type ToneType, type UserRig } from "./gear";
import type { PartialTone, ToneMeta } from "./schema";

const RIG_KEY = "tonefinder.rig";
const RIGS_KEY = "tonefinder.rigs";
const SAVED_KEY = "tonefinder.saved";
const HISTORY_KEY = "tonefinder.history";
const HISTORY_LIMIT = 20;

/** Sonucu üreten şarkı isteği (geri bildirimle yeniden uyarlamada aynısı gönderilir) */
export interface SongQuery {
  song: string;
  artist: string;
  part: string;
  partDetail: string;
  instrument: Instrument;
  toneType: ToneType;
}

export interface SavedTone {
  id: string;
  savedAt: number;
  deviceLabel: string;
  part: string;
  /** Yalnız araştırma (1. adım) ya da araştırma + uyarlama (2. adım) */
  result: PartialTone;
  /** Eski sürümlerde kaydedilen tonlarda yok */
  query?: SongQuery;
  artwork?: string;
  meta?: ToneMeta;
  /** Sonucun üretildiği rig'in adı ve manyetik dizilimi (seçici grafiği için) */
  rigName?: string;
  pickupLayout?: string;
}

/** Kayıtlı ekipman setleri ("Ev", "Prova"...) */
export interface NamedRig {
  id: string;
  name: string;
  rig: UserRig;
}

export interface RigStore {
  activeId: string;
  rigs: NamedRig[];
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // depolama kullanılamıyor; uygulama yine çalışır
  }
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

/** Rig listesi; eski tek rig kaydı ilk rig olarak taşınır */
export function loadRigs(): RigStore {
  const stored = read<{ activeId?: string; rigs?: { id?: string; name?: string; rig?: Record<string, unknown> }[] } | null>(RIGS_KEY, null);
  const rigs: NamedRig[] = (stored?.rigs ?? [])
    .filter((r) => r && typeof r.id === "string" && r.rig)
    .map((r) => ({ id: r.id!, name: r.name?.trim() || "Rig", rig: migrateRig(r.rig!) }));
  if (rigs.length === 0) rigs.push({ id: newId(), name: "Rigim", rig: migrateRig(read<Record<string, unknown>>(RIG_KEY, {})) });
  const activeId = rigs.some((r) => r.id === stored?.activeId) ? stored!.activeId! : rigs[0].id;
  return { activeId, rigs };
}

export const saveRigs = (store: RigStore) => write(RIGS_KEY, store);
export const createRigId = newId;

// Eski sürümlerde kaydedilen tonlar: çok eski yapıdakileri atla, zincirdeki eski
// kaynak etiketlerini ("device" / "user_pedal") yenilerine çevir.
const OLD_SOURCES: Record<string, "processor" | "pedal"> = { device: "processor", user_pedal: "pedal" };

/** Eski sürümlerin kayıtlarında olmayan alanları tamamlar; geçersiz kaydı atar */
function normalize(t: SavedTone): SavedTone | null {
  const r = t?.result as (PartialTone & { confidence?: PartialTone["research_confidence"] }) | undefined;
  if (!r?.song?.title || !r.original_rig) return null;
  return {
    ...t,
    result: {
      ...r,
      song: { ...r.song, tone_tags: r.song.tone_tags ?? [] },
      warnings: r.warnings ?? [],
      sections: r.sections ?? [],
      sources: r.sources ?? [],
      research_confidence: r.research_confidence ?? r.confidence ?? "medium",
      ...(Array.isArray(r.chain)
        ? { chain: r.chain.map((b) => ({ ...b, source: OLD_SOURCES[b.source as string] ?? b.source })) }
        : {}),
    },
  };
}

const normalizeAll = (list: SavedTone[]) => list.map(normalize).filter((t): t is SavedTone => t !== null);

export const loadSaved = (): SavedTone[] => normalizeAll(read<SavedTone[]>(SAVED_KEY, []));
export const storeSaved = (tones: SavedTone[]) => write(SAVED_KEY, tones);

/** Son sonuçlar (kaydedilmese de sayfa yenilenince kaybolmasın) */
export const loadHistory = (): SavedTone[] =>
  normalizeAll(read<SavedTone[]>(HISTORY_KEY, [])).slice(0, HISTORY_LIMIT);
export const storeHistory = (tones: SavedTone[]) => write(HISTORY_KEY, tones.slice(0, HISTORY_LIMIT));

/** Dışa aktarılan ton dosyasını (.tonefinder.json) okur; geçersizse null */
export function parseToneFile(text: string): SavedTone | null {
  try {
    const t = JSON.parse(text) as SavedTone & { format?: string };
    if (t?.format !== "tonefinder-tone") return null;
    const { format: _format, ...tone } = t;
    return normalize({ ...tone, id: newId(), savedAt: Date.now() });
  } catch {
    return null;
  }
}

export function toneFile(tone: SavedTone): string {
  return JSON.stringify({ format: "tonefinder-tone", ...tone }, null, 2);
}
