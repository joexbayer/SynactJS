const STORAGE_KEY = "synact.sync.settings";

export function createDefaultSyncSettings(appId = "synact-sample-pwa") {
  return {
    syncServerUrl: "http://localhost:8787",
    syncAppId: appId,
    syncRememberAuth: true,
    syncAutoEnabled: false,
    syncAutoIntervalMinutes: 30,
    syncAutoDirection: "both"
  };
}

function safeParse(raw) {
  if (!raw || typeof raw !== "string") return null;

  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export async function readSyncSettings(appId = "synact-sample-pwa") {
  const defaults = createDefaultSyncSettings(appId);

  try {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") {
      return defaults;
    }
    return { ...defaults, ...saved };
  } catch (_) {
    return defaults;
  }
}

export async function writeSyncSettings(appId = "synact-sample-pwa", patch = {}) {
  const current = await readSyncSettings(appId);
  const next = { ...current, ...(patch || {}) };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    // no-op when storage is blocked
  }

  return next;
}
