// Tarayıcıda saklanan kullanıcı verileri (ekipman profili ve kaydedilen tonlar).
// localStorage erişilemezse (gizli pencere vb.) sessizce varsayılana döner.

import { DEFAULT_RIG, type UserRig } from "./gear";
import type { ToneResult } from "./schema";

const RIG_KEY = "tonefinder.rig";
const SAVED_KEY = "tonefinder.saved";

export interface SavedTone {
  id: string;
  savedAt: number;
  deviceLabel: string;
  part: string;
  result: ToneResult;
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

export const loadRig = (): UserRig => ({ ...DEFAULT_RIG, ...read<Partial<UserRig>>(RIG_KEY, {}) });
export const saveRig = (rig: UserRig) => write(RIG_KEY, rig);

// Eski sürümde kaydedilen tonların yapısı farklı; onları atla.
export const loadSaved = (): SavedTone[] =>
  read<SavedTone[]>(SAVED_KEY, []).filter((t) => Array.isArray(t?.result?.chain) && t.result.original_rig);
export const storeSaved = (tones: SavedTone[]) => write(SAVED_KEY, tones);
