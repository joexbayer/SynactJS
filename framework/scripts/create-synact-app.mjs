#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_TEMPLATES = new Set(["pwa-sync", "basic"]);
const DEFAULT_TEMPLATE = "pwa-sync";

function printUsage() {
    console.log("Usage: create-synact-app <app-name-or-path> [--template pwa-sync|basic] [--manual-sync]");
    console.log("Default template: pwa-sync");
    console.log("Default manual sync UI: disabled");
    console.log("Example: create-synact-app my-mobile-pwa --template basic");
    console.log("Example: create-synact-app my-mobile-pwa --manual-sync");
}

function parseArgs(rawArgs) {
    const args = Array.isArray(rawArgs) ? rawArgs : [];
    let targetArg = "";
    let template = DEFAULT_TEMPLATE;
    let includeManualSync = false;

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === "--help" || arg === "-h") {
            return { help: true };
        }

        if (arg === "--template") {
            const value = args[index + 1];
            if (!value) {
                throw new Error("Missing value for --template. Use pwa-sync or basic.");
            }
            template = String(value).trim().toLowerCase();
            index += 1;
            continue;
        }

        if (arg.startsWith("--template=")) {
            template = String(arg.split("=").slice(1).join("=") || "").trim().toLowerCase();
            continue;
        }

        if (arg === "--manual-sync" || arg === "--with-manual-sync") {
            includeManualSync = true;
            continue;
        }

        if (arg.startsWith("-")) {
            throw new Error(`Unknown option: ${arg}`);
        }

        if (targetArg) {
            throw new Error(`Unexpected extra argument: ${arg}`);
        }

        targetArg = arg;
    }

    if (!targetArg) {
        throw new Error("Missing app name or target path.");
    }

    if (!VALID_TEMPLATES.has(template)) {
        throw new Error(`Invalid template: ${template}. Use one of: ${Array.from(VALID_TEMPLATES).join(", ")}`);
    }

    return {
        help: false,
        targetArg,
        template,
        includeManualSync
    };
}

function toPackageName(value) {
    return String(value || "synact-app")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "") || "synact-app";
}

async function exists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch (_) {
        return false;
    }
}

async function ensureEmptyDirectory(targetDir) {
    if (!await exists(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
        return;
    }

    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
        throw new Error(`Target directory is not empty: ${targetDir}`);
    }
}

async function writeFile(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
}

function createCommonFiles({ packageName, synactDependency, appFolderName, template }) {
    return {
        "scripts/build.mjs": `import { build } from "esbuild";

await build({
  entryPoints: ["src/main.js"],
  outfile: "dist/app.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  sourcemap: true,
  minify: true,
  logLevel: "info"
});
`,
        "scripts/dev.mjs": `import { context } from "esbuild";

const ctx = await context({
  entryPoints: ["src/main.js"],
  outfile: "dist/app.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  sourcemap: true,
  minify: false,
  logLevel: "info"
});

await ctx.watch();
const { hosts, port } = await ctx.serve({ servedir: "." });
const host = Array.isArray(hosts) && hosts.length > 0 ? hosts[0] : "127.0.0.1";

console.log(\`Synact dev server running at http://\${host}:\${port}\`);
`,
        "package.json": `${JSON.stringify({
            name: packageName,
            private: true,
            type: "module",
            scripts: {
                dev: "node scripts/dev.mjs",
                build: "node scripts/build.mjs",
                preview: "python3 -m http.server 4173"
            },
            dependencies: {
                synactjs: synactDependency
            },
            devDependencies: {
                esbuild: "^0.25.6"
            }
        }, null, 2)}
`,
        "README.md": `# ${appFolderName}

Template: \`${template}\`

## Scripts

- Install: \`npm install\`
- Dev server (watch + serve): \`npm run dev\`
- Production bundle: \`npm run build\`
- Preview static app: \`npm run preview\`

The production output is a single bundled file: \`dist/app.bundle.js\`.
`,
        ".gitignore": `node_modules/
dist/
`
    };
}

function createBasicTemplateFiles({ appFolderName }) {
    return {
        "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${appFolderName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="./dist/app.bundle.js"></script>
  </body>
</html>
`,
        "src/App.js": `import { SynactJSCore } from "synactjs";

const { div, h1, p, button, useState } = SynactJSCore;

export function App() {
  const [count, setCount] = useState(0);

  return div(
    {
      style: {
        maxWidth: "420px",
        margin: "48px auto",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
        fontFamily: "system-ui, sans-serif"
      }
    },
    h1({}, "Synact App"),
    p({}, "A React-like SynactJS app bundled into one JS file."),
    p({}, \`Count: \${count}\`),
    button(
      {
        onClick: () => setCount((value) => value + 1),
        style: {
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #10b981",
          background: "#10b981",
          color: "white",
          cursor: "pointer"
        }
      },
      "Increment"
    )
  );
}
`,
        "src/main.js": `import { SynactJS } from "synactjs";
import { App } from "./App.js";

SynactJS.start({
  app: App,
  container: "#app",
  waitForDom: true,
  once: true
}).catch((error) => {
  const mount = document.querySelector("#app");
  if (mount) {
    mount.textContent = \`Failed to start app: \${error?.message || String(error)}\`;
  }
});
`
    };
}

function createPwaSyncTemplateFiles({ appFolderName, packageName, includeManualSync = false }) {
    const incrementSpacingStyle = includeManualSync ? ',\n          marginRight: "8px"' : "";
    const manualSyncButton = includeManualSync ? `,
    button(
      {
        onClick: async () => {
          const syncFeature = window.__synactSyncFeature;
          if (!syncFeature) return;
          try {
            await syncFeature.sync({ direction: "both" });
            console.log("Manual sync complete.");
          } catch (error) {
            console.warn("Manual sync failed", error);
          }
        },
        style: {
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #0ea5e9",
          background: "#0ea5e9",
          color: "white",
          cursor: "pointer"
        }
      },
      "Manual Sync"
    )` : "";
    const manualSyncGlobal = includeManualSync ? `
  window.__synactSyncFeature = syncFeature;` : "";

    return {
        "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <title>${appFolderName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="./dist/app.bundle.js"></script>
  </body>
</html>
`,
        "manifest.webmanifest": `{
  "name": "${appFolderName}",
  "short_name": "${appFolderName}",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": []
}
`,
        "sw.js": `const CACHE_NAME = "synact-app-v1";
const APP_ASSETS = ["./", "./index.html", "./dist/app.bundle.js", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
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
`,
        "src/sync-settings.js": `const STORAGE_KEY = "synact.sync.settings";

export function createDefaultSyncSettings(appId = "${packageName}") {
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

export async function readSyncSettings(appId = "${packageName}") {
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

export async function writeSyncSettings(appId = "${packageName}", patch = {}) {
  const current = await readSyncSettings(appId);
  const next = { ...current, ...(patch || {}) };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    // no-op when storage is blocked
  }

  return next;
}
`,
        "src/App.js": `import { SynactJSCore } from "synactjs";

const { div, h1, p, button, useState } = SynactJSCore;

export function App() {
  const [count, setCount] = useState(0);

  return div(
    {
      style: {
        maxWidth: "480px",
        margin: "32px auto",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
        fontFamily: "system-ui, sans-serif"
      }
    },
    h1({}, "Synact PWA + Sync Scaffold"),
    p({}, "This default template includes PWA bootstrap and optional sync wiring."),
    p({}, "Update server URL/appId in src/sync-settings.js or in your own settings screen."),
    p({}, \`Count: \${count}\`),
    button(
      {
        onClick: () => setCount((value) => value + 1),
        style: {
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #10b981",
          background: "#10b981",
          color: "white",
          cursor: "pointer"${incrementSpacingStyle}
        }
      },
      "Increment"
    )${manualSyncButton}
  );
}
`,
        "src/main.js": `import { SynactJS } from "synactjs";
import { App } from "./App.js";
import { readSyncSettings, writeSyncSettings } from "./sync-settings.js";

const APP_ID = "${packageName}";

async function boot() {
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
${manualSyncGlobal}
}

boot().catch((error) => {
  const mount = document.querySelector("#app");
  if (mount) {
    mount.textContent = \`Failed to start app: \${error?.message || String(error)}\`;
  }
  console.error(error);
});
`
    };
}

function getTemplateFiles({ template, appFolderName, packageName, includeManualSync }) {
    if (template === "basic") {
        return createBasicTemplateFiles({ appFolderName });
    }

    return createPwaSyncTemplateFiles({ appFolderName, packageName, includeManualSync });
}

async function main() {
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.help) {
        printUsage();
        process.exit(0);
    }

    const { targetArg, template, includeManualSync } = parsed;
    const targetDir = path.resolve(process.cwd(), targetArg);
    const appFolderName = path.basename(targetDir);
    const packageName = toPackageName(appFolderName);

    await ensureEmptyDirectory(targetDir);

    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const frameworkDir = path.resolve(scriptDir, "..");
    const relativeFrameworkPath = path.relative(targetDir, frameworkDir).replace(/\\/g, "/") || ".";
    const synactDependency = `file:${relativeFrameworkPath}`;

    const files = {
        ...createCommonFiles({ packageName, synactDependency, appFolderName, template }),
        ...getTemplateFiles({ template, appFolderName, packageName, includeManualSync })
    };

    await Promise.all(
        Object.entries(files).map(([relativePath, content]) => writeFile(path.join(targetDir, relativePath), content))
    );

    console.log(`Created Synact app at ${targetDir}`);
    console.log(`Template: ${template}`);
    console.log(`Manual sync UI: ${includeManualSync ? "enabled" : "disabled"}`);
    console.log("Next steps:");
    console.log(`  cd ${targetArg}`);
    console.log("  npm install");
    console.log("  npm run dev");
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
