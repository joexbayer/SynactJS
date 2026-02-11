# SynactJS Monorepo

This repository is split into two top-level areas:

- `framework/`: SynactJS runtime, data/pwa/sync modules, docs, and tests.
- `example/`: Example apps built on the framework (including the plants demo).
- `server/sync-server/`: Optional Spring Boot sync server.

## Quick Commands (from repo root)

- Build framework runtime: `npm run framework:build`
- Run framework tests: `npm run framework:test -- --runInBand`
- Build plants demo: `npm run framework:build:plants`
- Start sync server: `npm run server:start`
- Scaffold a new Synact app: `npm run create:app -- my-app`
- Scaffold with optional manual sync button: `npm run create:app -- my-app --manual-sync`
- Scaffold minimal template instead: `npm run create:app -- my-app --template basic`

## Main Docs

- Framework docs: [`framework/README.md`](framework/README.md)
- Server docs: [`server/sync-server/README.md`](server/sync-server/README.md)
