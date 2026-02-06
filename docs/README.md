# SynactJS Docs

This folder contains the docs site for SynactJS (hosted via GitHub Pages/Jekyll) and a Synact-powered docs app under `docs/app/`.

## What is documented here

- Core drop-in usage (`<script src=".../synact.min.js"></script>`)
- Browser helper APIs (`useFetch`, `useWebSocket`, storage/media/event/timer helpers)
- Optional component library (`lib/synact.lib.js`)
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
