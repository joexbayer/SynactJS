# SynactJS Docs

This folder contains the docs site for SynactJS (hosted via GitHub Pages/Jekyll) and a Synact-powered docs app under `docs/app/`.

## What is documented here

- Static-hosted mobile PWA setup
- Core drop-in usage (`<script src=".../synact.min.js"></script>`)
- Local-first data layer (`SynactJS.data`) with import/export snapshots
- PWA service lifecycle (`SynactJS.pwa`) for install/update flows
- Optional component library (`lib/synact.lib.js`) including mobile shell primitives
- Error system and structured error codes

## Local development

Run Jekyll:

```sh
bundle exec jekyll serve
```

## Runtime files used by docs

- `docs/synact.dev.js` is the local runtime used by the docs site.
- `docs/synact.js` is kept for compatibility in this docs project.

When `synact.js` changes in the repo root, copy it into docs:

```sh
cp ../synact.js ./synact.dev.js
cp ../synact.js ./synact.js
```

## Docs app files

- `docs/app/docs.js`: main documentation content sections
- `docs/app/examples.js`: interactive examples page
- `docs/app/app.js`: route wiring (`/home`, `/docs`, `/examples`, `/about`)
