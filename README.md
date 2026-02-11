# SynactJS Monorepo

This repository is split into two top-level areas:

- `framework/`: SynactJS runtime, data/pwa/sync modules, docs, tests, and demo apps.
- `server/sync-server/`: Optional Spring Boot sync server.

## Quick Commands (from repo root)

- Build framework runtime: `npm run framework:build`
- Run framework tests: `npm run framework:test -- --runInBand`
- Build plants demo: `npm run framework:build:plants`
- Start sync server: `npm run server:start`
- Scaffold a new Synact app (default template: `pwa-sync`): `npm run create:app -- my-app`
- Scaffold minimal template instead: `npm run create:app -- my-app --template basic`

## Main Docs

- Framework docs: [`framework/README.md`](framework/README.md)
- Server docs: [`server/sync-server/README.md`](server/sync-server/README.md)
