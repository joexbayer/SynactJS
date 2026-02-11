# SynactJS

SynactJS is a React-like framework for building **mobile-first PWAs on static hosting** (GitHub Pages, Netlify static sites, S3 static hosting, and similar environments).

It ships as browser-ready scripts, so you can build app-like experiences without a backend runtime.

Live docs: [https://joexbayer.github.io/SynactJS/](https://joexbayer.github.io/SynactJS/)

## Project Direction

SynactJS now focuses on:
- Static webpage PWAs.
- Local-first app data.
- Safe import/export of user data snapshots.
- Service worker lifecycle and install flows.
- Mobile UI primitives for app-shell UX.

Foundation docs:
- [`PWA_FOUNDATION_PLAN_AND_SPEC.md`](PWA_FOUNDATION_PLAN_AND_SPEC.md)
- [`../AGENTS.md`](../AGENTS.md)

## Quick Start (Static Mobile PWA)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <title>Synact PWA</title>
  </head>
  <body>
    <div id="app"></div>

    <script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/lib/synact.lib.min.js"></script>

    <script>
      function App() {
        return SynactLib.MobileAppShell({
          title: "Synact PWA",
          subtitle: "Local-first static app",
          children: [
            SynactLib.OfflineBanner({}),
            SynactLib.PWAInstallBanner({}),
            SynactLib.Card({ title: "Ready", children: "Your app is running." })
          ]
        });
      }

      SynactJS.render(App, "#app");
    </script>
  </body>
</html>
```

## Easier App Bootstrap

Use `SynactJS.start(...)` to reduce setup boilerplate:

```js
await SynactJS.start({
  app: App,
  container: "#app",
  waitForDom: true,
  once: true,
  data: {
    appId: "task-mobile",
    engine: "localstorage",
    schemaVersion: 1
  },
  pwa: {
    init: true,
    register: true,
    registerOptions: { swUrl: "/sw.js", scope: "/" }
  }
});
```

## Local-First Data Layer

Initialize once on app startup:

```js
await SynactJS.data.init({
  appId: "task-mobile",
  engine: "auto", // indexeddb -> localstorage fallback
  schemaVersion: 1,
  migrations: []
});
```

Direct data helpers (no `.store` access required):

```js
await SynactJS.data.write("tasks", "task-1", { title: "Buy milk", done: false });
const task = await SynactJS.data.read("tasks", "task-1");
await SynactJS.data.update("tasks", "task-1", { done: true });
await SynactJS.data.delete("tasks", "task-1");
const rows = await SynactJS.data.query("tasks");
```

Image helpers:

```js
const imageId = "plant-photo-1";
await SynactJS.data.writeImage("images", imageId, fileInput.files[0], {
  alt: "Living room monstera"
});
const image = await SynactJS.data.readImage("images", imageId);
```

Use the store:

```js
await SynactJS.data.store.write("tasks", "task-1", {
  title: "Buy milk",
  done: false
});

await SynactJS.data.store.update("tasks", "task-1", { done: true });

const task = await SynactJS.data.store.read("tasks", "task-1");
const tasks = await SynactJS.data.store.query("tasks", {
  sortBy: "updatedAt",
  sortDirection: "desc"
});

await SynactJS.data.store.delete("tasks", "task-1");
```

## Import / Export Snapshots

Export:

```js
const snapshot = await SynactJS.data.export();
const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "synact-backup.json";
a.click();
URL.revokeObjectURL(url);
```

Validate and import:

```js
const validation = SynactJS.data.validateSnapshot(snapshot, { verifyChecksum: true });
if (!validation.valid) {
  console.error(validation.errors);
}

const report = await SynactJS.data.import(snapshot, {
  mode: "merge", // or "replace"
  dryRun: false,
  onConflict: "newest" // "newest" | "incoming" | "existing" | custom function
});

console.log(report.summary);
```

Snapshot format includes:
- `format`
- `appId`
- `schemaVersion`
- `exportedAt`
- `runtimeVersion`
- `collections`
- `checksum`

## Optional Encrypted Cloud Sync

SynactJS includes an optional sync client for self-hosted backends:

```js
SynactJS.sync.init({
  baseUrl: "https://sync.your-domain.com",
  appId: "plants-local"
});

await SynactJS.sync.register({
  email: "you@example.com",
  password: "StrongPassword123!"
});

SynactJS.sync.setPassphrase("device-only-encryption-passphrase");
await SynactJS.sync.pushDataSnapshot();
await SynactJS.sync.pullDataSnapshot({
  importOptions: { mode: "merge", onConflict: "newest" }
});
```

Design notes:
- Snapshot payloads are encrypted client-side before upload.
- Server stores opaque encrypted blobs (`encryptedSnapshot`) and does not need app-specific schemas.
- Reference self-host server: [`../server/sync-server/README.md`](../server/sync-server/README.md)

## Create App Boilerplate

Default scaffold template is `pwa-sync` (manifest + service worker + sync settings prewired), but this is not enforced.

From repo root:

```sh
npm run create:app -- my-app
```

Or from `framework/` directly:

```sh
npm run create:app -- my-app
```

This scaffolds a React-like app structure with:
- `src/` app code,
- `scripts/dev.mjs` and `scripts/build.mjs`,
- single production output at `dist/app.bundle.js`.

Use the minimal template instead:

```sh
npm run create:app -- my-app --template basic
```

Core methods:
- `SynactJS.sync.init(config)`
- `SynactJS.sync.initSession(config)` (high-level session helper)
- `SynactJS.sync.createSession(config)` (manual session helper instance)
- `SynactJS.sync.initAppService(config)` (recommended app-facing orchestration)
- `SynactJS.sync.createAppService(config)` (manual app service instance)
- `SynactJS.sync.initFeatureService(config)` (settings + app service orchestration)
- `SynactJS.sync.createFeatureService(config)` (manual feature service instance)
- `SynactJS.sync.register({ email, password })`
- `SynactJS.sync.login({ email, password })`
- `SynactJS.sync.refresh()`
- `SynactJS.sync.logout()`
- `SynactJS.sync.restoreAuth(options?)` (with `initSession`)
- `SynactJS.sync.syncNow(options?)` (with `initSession`)
- `SynactJS.sync.setPassphrase(passphrase)`
- `SynactJS.sync.pushSnapshot(snapshot, options?)`
- `SynactJS.sync.pullSnapshot(options?)`
- `SynactJS.sync.pushDataSnapshot(options?)`
- `SynactJS.sync.pullDataSnapshot(options?)`

Session helper example (minimal app code):

```js
const session = SynactJS.sync.initSession({
  baseUrl: "https://sync.your-domain.com",
  appId: "plants-local",
  dataApi: SynactJS.data,
  storageKey: "plants-sync-session"
});

await session.restoreAuth({ refresh: true, silent: true });
await session.login(
  { email: "you@example.com", password: "StrongPassword123!" },
  { passphrase: "device-only-passphrase", remember: true }
);

await session.syncNow({
  direction: "both",
  pullOptions: { importOptions: { mode: "merge", onConflict: "newest" } }
});
```

App service example (least app boilerplate):

```js
const syncService = SynactJS.sync.initAppService({
  dataApi: SynactJS.data,
  defaults: {
    baseUrl: "https://sync.your-domain.com",
    appId: "plants-local",
    rememberAuth: true
  },
  configStorageKey: "plants-sync-config",
  sessionStorageKey: "plants-sync-session"
});

await syncService.bootstrap({ restoreAuth: true, refresh: true, silent: true });
await syncService.authenticate("login", {
  email: "you@example.com",
  password: "StrongPassword123!",
  passphrase: "device-only-passphrase",
  autoPull: true
});

await syncService.sync({ direction: "both" });
```

Feature service example (least app handler code):

```js
const syncFeature = SynactJS.sync.initFeatureService({
  dataApi: SynactJS.data,
  defaults: {
    baseUrl: "https://sync.your-domain.com",
    appId: "plants-local",
    rememberAuth: true
  },
  readSettings: () => repo.getSettings(),
  writeSettings: (patch) => repo.updateSettings(patch),
  afterPull: async () => {
    await refreshAppState();
  }
});

await syncFeature.bootstrap({ restoreAuth: true, refresh: true, silent: true });
await syncFeature.saveConfig({ syncEmail: "you@example.com" });
await syncFeature.authenticate("login", {
  email: "you@example.com",
  password: "StrongPassword123!",
  passphrase: "device-only-passphrase",
  autoPull: true
});
await syncFeature.sync({ direction: "both" });

// Optional configurable auto sync from persisted settings:
await syncFeature.startAutoSync({
  immediate: false,
  onError: (error) => console.error("Auto sync failed", error)
});
```

## Lazy Loading + Skeletons

```js
const LazySettings = SynactJS.lazy(
  () => import("./views/settings.js"),
  {
    fallback: SynactJS.skeleton({ rows: 4 }),
    errorFallback: ({ error }) => div({}, `Failed: ${error.message}`)
  }
);
```

Helpers:
- `SynactJS.lazy(loader, options?)`
- `SynactJS.skeleton(options?)`

## Form Helper

```js
function ProfileForm() {
  const form = SynactJS.useForm({
    initialValues: { name: "", newsletter: false },
    validate: (values) => (values.name ? {} : { name: "Name is required" })
  });

  return div(
    {},
    input({ ...form.bind("name") }),
    input({ type: "checkbox", ...form.bind("newsletter", { type: "checkbox" }) }),
    button({ onClick: form.handleSubmit((values) => console.log(values)) }, "Save")
  );
}
```

## PWA Lifecycle API

Register your service worker:

```js
await SynactJS.pwa.register({
  swUrl: "/sw.js",
  scope: "/"
});
```

Listen for events:

```js
const unsubscribe = SynactJS.pwa.on("updateAvailable", () => {
  console.log("New app version is ready");
});
```

Core methods:
- `SynactJS.pwa.register(options)`
- `SynactJS.pwa.unregister()`
- `SynactJS.pwa.checkForUpdate()`
- `SynactJS.pwa.activateUpdate()`
- `SynactJS.pwa.promptInstall()`
- `SynactJS.pwa.getStatus()`
- `SynactJS.pwa.getInstallState()`
- `SynactJS.pwa.destroy()`

## Mobile UI Library (`SynactLib`)

Primary mobile PWA components:
- `SynactLib.MobileAppShell`
- `SynactLib.BottomNav`
- `SynactLib.OfflineBanner`
- `SynactLib.PWAInstallBanner`

Additional components:
- `SynactLib.AppShell`
- `SynactLib.Grid`
- `SynactLib.Stack`
- `SynactLib.Card`
- `SynactLib.StatCard`
- `SynactLib.DataTable`
- `SynactLib.KeyValueList`
- `SynactLib.EmptyState`
- `SynactLib.Badge`
- `SynactLib.Button`
- `SynactLib.Input`
- `SynactLib.Textarea`
- `SynactLib.SelectField`
- `SynactLib.Switch`
- `SynactLib.Progress`
- `SynactLib.Alert`
- `SynactLib.Divider`
- `SynactLib.Kbd`
- `SynactLib.SparkBars`
- `SynactLib.Toolbar`
- `SynactLib.Tabs`
- `SynactLib.Accordion`
- `SynactLib.Modal`
- `SynactLib.ClipboardButton`
- `SynactLib.ShareButton`
- `SynactLib.NetworkStatusBadge`
- `SynactLib.ThemeToggle`
- `SynactLib.FileDropzone`
- `SynactLib.GeolocationCard`

Example mobile shell:

```js
function MobileHome() {
  const [tab, setTab] = useState("home");

  const nav = SynactLib.BottomNav({
    activeId: tab,
    onChange: (id) => setTab(id),
    items: [
      { id: "home", label: "Home", icon: "H" },
      { id: "tasks", label: "Tasks", icon: "T" },
      { id: "settings", label: "Settings", icon: "S" }
    ]
  });

  return SynactLib.MobileAppShell({
    title: "Task App",
    subtitle: "Offline-first",
    bottomNav: nav,
    children: [
      SynactLib.OfflineBanner({ hideWhenOnline: true }),
      SynactLib.PWAInstallBanner({}),
      SynactLib.Card({ title: "Current tab", children: tab })
    ]
  });
}
```

## Real-World Demo App

A full multi-view example app lives in [`plants/index.html`](plants/index.html):
- custom Tailwind UI components (no `SynactLib` components),
- local-first plant records and journal,
- dedicated backup/import-export view,
- local image storage via data URL helpers.

## Router Notes For Static Hosts

For static hosting, prefer hash-based links so direct refreshes stay on `index.html`:

```html
<a href="#/tasks">Tasks</a>
<a href="#/settings">Settings</a>
```

`useRouter()` and `RouteView` include hash and query data in route matching.

## Minimal Manifest + Service Worker

`manifest.webmanifest`:

```json
{
  "name": "Synact PWA",
  "short_name": "Synact",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

`sw.js`:

```js
const CACHE_NAME = "synact-app-v1";
const APP_ASSETS = [
  "/",
  "/index.html",
  "/synact.min.js",
  "/lib/synact.lib.min.js",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

## Error Handling

```js
SynactJS.configure({
  errorMode: "console", // or "throw"
  logErrors: true,
  onError: (error, meta) => {
    console.log(error.code, meta.context, error.details);
  }
});
```

Common helper and platform error codes:
- `S013`: browser/platform API unavailable.
- `S014`: network/fetch failure.
- `S015`: WebSocket failure.
- `S016`: invalid API usage/options.

## Development Commands

```sh
npm test -- --runInBand
npm run build
npm run build:lib
npm run dist
```

## License

MIT
