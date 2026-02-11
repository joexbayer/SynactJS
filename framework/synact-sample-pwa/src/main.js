import { SynactJS } from "synactjs";
import { App } from "./App.js";
import { readSyncSettings, writeSyncSettings } from "./sync-settings.js";

const APP_ID = "synact-sample-pwa";

await SynactJS.start({
  app: App,
  container: "#app",
  waitForDom: true,
  once: true,
  data: {
    appId: APP_ID,
    engine: "auto",
    schemaVersion: 1
  },
  pwa: {
    init: true,
    register: true,
    registerOptions: {
      swUrl: "./sw.js",
      scope: "./"
    }
  }
});

const syncSettings = await readSyncSettings(APP_ID);
const syncFeature = SynactJS.sync.initFeatureService({
  dataApi: SynactJS.data,
  defaults: {
    baseUrl: syncSettings.syncServerUrl,
    appId: syncSettings.syncAppId || APP_ID,
    rememberAuth: syncSettings.syncRememberAuth !== false
  },
  readSettings: () => readSyncSettings(APP_ID),
  writeSettings: (patch) => writeSyncSettings(APP_ID, patch),
  persistAuthEmail: false
});

await syncFeature.bootstrap({ restoreAuth: true, refresh: true, silent: true });
await syncFeature.startAutoSync({
  immediate: false,
  onError: (error) => {
    console.warn("Auto sync failed:", error);
  }
});

window.__synactSyncFeature = syncFeature;
