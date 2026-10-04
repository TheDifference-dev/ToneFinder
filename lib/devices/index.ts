import { HEADRUSH_REFERENCE } from "./headrush";

// Cihaz bazlı doğrulanmış model referansları. Burada olmayan cihazlar için
// yapay zekâ model listesini araştırma sırasında web'den bulur.
const REFERENCES: Record<string, string> = {
  "headrush-core": HEADRUSH_REFERENCE,
  headrush: HEADRUSH_REFERENCE,
};

export function deviceReference(deviceId: string): string | undefined {
  return REFERENCES[deviceId];
}
