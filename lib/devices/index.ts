import { HEADRUSH_REFERENCE } from "./headrush";
import { HELIX_REFERENCE } from "./helix";
import { KATANA_REFERENCE } from "./katana";

// Cihaz bazlı doğrulanmış model referansları (model adı → taklit ettiği gerçek ekipman,
// parametre aralıkları). Burada olmayan cihazlar için yapay zekâ model listesini
// araştırma sırasında web'den bulur.
const REFERENCES: Record<string, string> = {
  "headrush-core": HEADRUSH_REFERENCE,
  headrush: HEADRUSH_REFERENCE,
  "line6-helix": HELIX_REFERENCE,
  "line6-hx-stomp": HELIX_REFERENCE,
  "line6-pod-go": HELIX_REFERENCE,
  "boss-katana-gen3": KATANA_REFERENCE,
  "boss-katana-mk2": KATANA_REFERENCE,
};

export function deviceReference(deviceId: string): string | undefined {
  return REFERENCES[deviceId];
}

export function hasDeviceReference(deviceId: string): boolean {
  return deviceId in REFERENCES;
}
