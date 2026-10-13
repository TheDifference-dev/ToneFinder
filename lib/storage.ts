// Tarayıcıda saklanan kullanıcı verileri (ekipman profili ve kaydedilen tonlar).
// localStorage erişilemezse (gizli pencere vb.) sessizce varsayılana döner.

import { migrateRig, type Instrument, type ToneType, type UserRig } from "./gear";
import type { ToneMeta, ToneResult } from "./schema";

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
  result: ToneResult;
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

export const loadSaved = (): SavedTone[] =>
  read<SavedTone[]>(SAVED_KEY, [])
    .filter((t) => Array.isArray(t?.result?.guitar?.compensation) && Array.isArray(t.result.chain))
    .map((t) => ({
      ...t,
      result: {
        ...t.result,
        chain: t.result.chain.map((b) => ({ ...b, source: OLD_SOURCES[b.source as string] ?? b.source })),
      },
    }));
export const storeSaved = (tones: SavedTone[]) => write(SAVED_KEY, tones);

/** Son sonuçlar (kaydedilmese de sayfa yenilenince kaybolmasın) */
export const loadHistory = (): SavedTone[] =>
  read<SavedTone[]>(HISTORY_KEY, []).filter((t) => Array.isArray(t?.result?.chain)).slice(0, HISTORY_LIMIT);
export const storeHistory = (tones: SavedTone[]) => write(HISTORY_KEY, tones.slice(0, HISTORY_LIMIT));

/** Dışa aktarılan ton dosyasını (.tonefinder.json) okur; geçersizse null */
export function parseToneFile(text: string): SavedTone | null {
  try {
    const t = JSON.parse(text) as SavedTone & { format?: string };
    if (t?.format !== "tonefinder-tone" || !t.result?.song?.title || !Array.isArray(t.result.chain)) return null;
    const { format: _format, ...tone } = t;
    return { ...tone, id: newId(), savedAt: Date.now() };
  } catch {
    return null;
  }
}

export function toneFile(tone: SavedTone): string {
  return JSON.stringify({ format: "tonefinder-tone", ...tone }, null, 2);
}
