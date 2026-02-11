# Plants Demo App

This is a real-world SynactJS demo app focused on static-hosted mobile PWA usage.

## Run locally

1. Build the browser bundle once:
   - from repo root: `npm run framework:build:plants`
   - or from `framework/`: `npm run build:plants`
2. Open `example/plants/index.html` directly in your browser (works from `file://`).
3. Optional live-server workflow:
   - `python3 -m http.server 4173`
   - open `http://localhost:4173/example/plants/index.html`

## What it covers

- Custom Tailwind-based UI components (no `SynactLib` components).
- Multi-view mobile app shell (`home`, `plants`, `journal`, `sync`, `settings`).
- Local-first data with `SynactJS.data`.
- Account + encrypted cloud sync view using `SynactJS.sync.createFeatureService(...)`.
- Sync server target managed in `Settings`, while the `Sync` view is user-auth + pull/push actions.
- Configurable auto sync cadence (15/30/60/120 min) with direction control (`pull`, `push`, `both`).
- Image storage via `SynactJS.data.writeImage(...)` and `readImage(...)`.

## Folder structure

- `app.js`: app bootstrap + view orchestration.
- `app.bundle.js`: bundled browser script loaded by `index.html`.
- `tailwind.css`: generated production CSS (no Tailwind CDN runtime).
- `components/`: custom presentation components.
- `services/`: class-based app services and repository.
