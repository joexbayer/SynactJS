import { Container, Section, Heading, Paragraph, Divider, Box, Link } from './components/ui.js';

const docsSections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'install', title: 'Install' },
    { id: 'quickstart', title: 'Quick Start' },
    { id: 'data', title: 'Data Layer' },
    { id: 'importexport', title: 'Import / Export' },
    { id: 'sync', title: 'Encrypted Sync' },
    { id: 'lazy', title: 'Lazy + Skeleton' },
    { id: 'pwa', title: 'PWA API' },
    { id: 'mobilelib', title: 'Mobile Library' },
    { id: 'errors', title: 'Error System' },
    { id: 'api', title: 'API Reference' }
];

function CodeBlock({ language = 'js', codeText }) {
    return Box({
        style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
        children: [
            pre({ class: 'text-sm leading-relaxed overflow-scroll' },
                code({ class: `language-${language}` }, codeText.trim())
            )
        ]
    });
}

function BulletList(items) {
    return ul(
        { class: 'list-disc pl-6 text-slate-700 leading-relaxed mb-3 space-y-1' },
        ...items.map((item) => li({}, item))
    );
}

function getDocsContent(selectedSection) {
    switch (selectedSection) {
        case 'intro':
            return [
                Heading({ text: 'Introduction' }),
                Paragraph({ text: 'SynactJS is a React-like framework for mobile-first PWAs on static hosting. It runs in the browser with script tags and focuses on local-first app behavior.' }),
                BulletList([
                    'Build app-like UI for static hosts (GitHub Pages, Netlify static, S3 static)',
                    'Use local data storage with migrations',
                    'Export/import local snapshots safely',
                    'Manage service worker and install lifecycle',
                    'Compose mobile UI with optional SynactLib components'
                ])
            ];

        case 'install':
            return [
                Heading({ text: 'Install' }),
                Paragraph({ text: 'Load core runtime and optional UI library as plain scripts:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<!-- Core runtime -->
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>

<!-- Optional mobile/UI component library -->
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/lib/synact.lib.min.js"></script>`
                }),
                Paragraph({ text: 'For local project files:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<script src="./synact.js"></script>
<script src="./lib/synact.lib.js"></script>`
                })
            ];

        case 'quickstart':
            return [
                Heading({ text: 'Quick Start' }),
                Paragraph({ text: 'Minimal static mobile PWA setup:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<!doctype html>
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

    <script src="./synact.js"></script>
    <script src="./lib/synact.lib.js"></script>
    <script>
      function App() {
        return SynactLib.MobileAppShell({
          title: 'Task App',
          subtitle: 'Offline-first',
          children: [
            SynactLib.OfflineBanner({}),
            SynactLib.Card({ title: 'Ready', children: 'Synact app loaded.' })
          ]
        });
      }

      SynactJS.start({
        app: App,
        container: '#app',
        data: { appId: 'task-mobile', engine: 'localstorage', schemaVersion: 1 },
        pwa: { init: true, register: true, registerOptions: { swUrl: '/sw.js', scope: '/' } }
      });
    </script>
  </body>
</html>`
                }),
                Paragraph({ text: 'For static hosting routing, prefer hash links (example: `#/tasks`) to avoid refresh 404 issues.' })
            ];

        case 'data':
            return [
                Heading({ text: 'Data Layer' }),
                Paragraph({ text: 'Use `SynactJS.data` for local-first records with IndexedDB primary and localStorage fallback.' }),
                BulletList([
                    'Initialize once with appId + schemaVersion',
                    'Use collection/id record model',
                    'Migrations are versioned and deterministic',
                    'CRUD + query methods are async'
                ]),
                CodeBlock({
                    language: 'js',
                    codeText: `await SynactJS.data.init({
  appId: 'task-mobile',
  engine: 'auto',
  schemaVersion: 2,
  migrations: [
    {
      version: 2,
      up: async ({ store }) => {
        const profile = await store.read('meta', 'profile');
        if (!profile) {
          await store.write('meta', 'profile', { createdByMigration: true });
        }
      }
    }
  ]
});

await SynactJS.data.write('tasks', 'task-1', { title: 'Buy milk', done: false });
await SynactJS.data.update('tasks', 'task-1', { done: true });
const task = await SynactJS.data.read('tasks', 'task-1');
const tasks = await SynactJS.data.query('tasks', { sortBy: 'updatedAt', sortDirection: 'desc' });
await SynactJS.data.delete('tasks', 'task-1');`
                }),
                Paragraph({ text: 'Image payload helpers store data URLs for local-first media records:' }),
                CodeBlock({
                    language: 'js',
                    codeText: `await SynactJS.data.writeImage('images', 'plant-photo-1', fileInput.files[0], {
  alt: 'Living room monstera'
});

const image = await SynactJS.data.readImage('images', 'plant-photo-1');`
                }),
                Paragraph({ text: 'Call `await SynactJS.data.close()` during teardown/tests when needed.' })
            ];

        case 'importexport':
            return [
                Heading({ text: 'Import / Export' }),
                Paragraph({ text: 'Snapshot import/export is built into `SynactJS.data`.' }),
                BulletList([
                    'Export snapshots for backup/transfer',
                    'Validate checksum before import',
                    'Import modes: merge or replace',
                    'Dry run support for safe preview'
                ]),
                CodeBlock({
                    language: 'js',
                    codeText: `const snapshot = await SynactJS.data.export();

const validation = SynactJS.data.validateSnapshot(snapshot, { verifyChecksum: true });
if (!validation.valid) {
  throw new Error(validation.errors.join('\n'));
}

const report = await SynactJS.data.import(snapshot, {
  mode: 'merge',
  dryRun: false,
  onConflict: 'newest'
});

console.log(report.summary);`
                }),
                Paragraph({ text: 'Snapshot metadata includes `format`, `appId`, `schemaVersion`, `runtimeVersion`, `exportedAt`, and `checksum`.' })
            ];

        case 'sync':
            return [
                Heading({ text: 'Encrypted Sync (Optional)' }),
                Paragraph({ text: 'Use `SynactJS.sync` for optional self-hosted account + encrypted snapshot sync.' }),
                BulletList([
                    'Client-side snapshot encryption with WebCrypto',
                    'Self-host support via configurable baseUrl',
                    'Opaque blob storage on server (no app-specific schema required)',
                    'Can sync any DataStore collection structure'
                ]),
                CodeBlock({
                    language: 'js',
                    codeText: `SynactJS.sync.init({
  baseUrl: 'https://sync.example.com',
  appId: 'plants-local'
});

await SynactJS.sync.login({
  email: 'you@example.com',
  password: 'StrongPassword123!'
});

SynactJS.sync.setPassphrase('device-only-passphrase');
await SynactJS.sync.pushDataSnapshot();
await SynactJS.sync.pullDataSnapshot({
  importOptions: { mode: 'merge', onConflict: 'newest' }
});`
                }),
                Paragraph({ text: 'Reference self-host service docs: `server/sync-server/README.md`.' })
            ];

        case 'lazy':
            return [
                Heading({ text: 'Lazy Loading + Skeletons' }),
                Paragraph({ text: 'Use `SynactJS.lazy` to load views on demand and `SynactJS.skeleton` for loading placeholders.' }),
                CodeBlock({
                    language: 'js',
                    codeText: `const LazySettings = SynactJS.lazy(
  () => import('./views/settings.js'),
  {
    fallback: SynactJS.skeleton({ rows: 4 }),
    errorFallback: ({ error }) => div({}, error.message)
  }
);`
                }),
                BulletList([
                    'Reduces initial bundle size for multi-view apps',
                    'Provides first-class loading fallback pattern',
                    'No dependency on third-party suspense runtime'
                ])
            ];

        case 'pwa':
            return [
                Heading({ text: 'PWA API' }),
                Paragraph({ text: 'Use `SynactJS.pwa` to register service workers, check updates, and manage install prompts.' }),
                CodeBlock({
                    language: 'js',
                    codeText: `await SynactJS.pwa.register({ swUrl: '/sw.js', scope: '/' });

const unsubscribe = SynactJS.pwa.on('updateAvailable', () => {
  console.log('Update ready');
});

const status = SynactJS.pwa.getStatus();
const installState = SynactJS.pwa.getInstallState();

if (installState.canPrompt) {
  await SynactJS.pwa.promptInstall();
}

await SynactJS.pwa.checkForUpdate();
await SynactJS.pwa.activateUpdate();`
                }),
                BulletList([
                    'Methods: register, unregister, checkForUpdate, activateUpdate, promptInstall',
                    'State: getStatus, getInstallState',
                    'Events: statusChange, updateAvailable, installPromptAvailable, appInstalled'
                ])
            ];

        case 'mobilelib':
            return [
                Heading({ text: 'Mobile Library (`lib/`)' }),
                Paragraph({ text: 'SynactLib is an optional component package with mobile shell and utility primitives.' }),
                BulletList([
                    'Mobile shell: MobileAppShell, BottomNav, OfflineBanner, PWAInstallBanner',
                    'Layout/data: AppShell, Grid, Stack, Card, StatCard, DataTable, KeyValueList, EmptyState, SparkBars',
                    'Inputs/controls: Button, Badge, Input, Textarea, SelectField, Switch, Progress, Alert, Divider, Kbd, Toolbar, Tabs, Accordion, Modal',
                    'Browser tools: ClipboardButton, ShareButton, NetworkStatusBadge, ThemeToggle, FileDropzone, GeolocationCard'
                ]),
                CodeBlock({
                    language: 'js',
                    codeText: `function MobileHome() {
  const [tab, setTab] = useState('home');

  return SynactLib.MobileAppShell({
    title: 'Task App',
    subtitle: 'Offline-first',
    bottomNav: SynactLib.BottomNav({
      activeId: tab,
      onChange: (id) => setTab(id),
      items: [
        { id: 'home', label: 'Home', icon: 'H' },
        { id: 'tasks', label: 'Tasks', icon: 'T' },
        { id: 'settings', label: 'Settings', icon: 'S' }
      ]
    }),
    children: [
      SynactLib.OfflineBanner({}),
      SynactLib.PWAInstallBanner({}),
      SynactLib.Card({ title: 'Tab', children: tab })
    ]
  });
}`
                })
            ];

        case 'errors':
            return [
                Heading({ text: 'Error System' }),
                Paragraph({ text: 'SynactJS emits structured errors with stable codes for runtime and browser integration issues.' }),
                CodeBlock({
                    language: 'js',
                    codeText: `SynactJS.configure({
  errorMode: 'console', // or 'throw'
  logErrors: true,
  onError: (error, meta) => {
    console.log(error.code, meta.context, error.details);
  }
});`
                }),
                BulletList([
                    'S013: browser/platform API unavailable',
                    'S014: network/fetch failure',
                    'S015: WebSocket failure',
                    'S016: invalid API usage/options'
                ])
            ];

        case 'api':
            return [
                Heading({ text: 'API Reference' }),
                Heading({ text: 'Core Runtime', level: 2 }),
                BulletList([
                    'SynactJS.register(component)',
                    'SynactJS.start({ app, container, data?, pwa? })',
                    'SynactJS.render(componentOrVNode, containerOrSelector, props?)',
                    'SynactJS.mount(...) / SynactJS.unmount(...)',
                    'SynactJS.lazy(loader, options?)',
                    'SynactJS.skeleton(options?)',
                    'SynactJS.configure(config) / SynactJS.getConfig()'
                ]),
                Heading({ text: 'Core Hooks', level: 2 }),
                BulletList([
                    'useState, useEffect, useMemo, useCallback',
                    'useForm',
                    'createContext, useContext',
                    'useRouter, RouteView, Fragment'
                ]),
                Heading({ text: 'Data Namespace', level: 2 }),
                BulletList([
                    'SynactJS.data.init(config)',
                    'SynactJS.data.write/read/update/delete/query(...)',
                    'SynactJS.data.export(options?)',
                    'SynactJS.data.validateSnapshot(snapshot, options?)',
                    'SynactJS.data.import(snapshot, options?)',
                    'SynactJS.data.close()'
                ]),
                Heading({ text: 'PWA Namespace', level: 2 }),
                BulletList([
                    'SynactJS.pwa.register(options?)',
                    'SynactJS.pwa.checkForUpdate()',
                    'SynactJS.pwa.activateUpdate()',
                    'SynactJS.pwa.promptInstall()',
                    'SynactJS.pwa.getStatus() / SynactJS.pwa.getInstallState()'
                ]),
                Heading({ text: 'Sync Namespace', level: 2 }),
                BulletList([
                    'SynactJS.sync.init(config)',
                    'SynactJS.sync.register/login/refresh/logout(...)',
                    'SynactJS.sync.setPassphrase(passphrase)',
                    'SynactJS.sync.pushSnapshot/pullSnapshot(...)',
                    'SynactJS.sync.pushDataSnapshot/pullDataSnapshot(...)'
                ]),
                Heading({ text: 'Helper Namespace', level: 2 }),
                Paragraph({ text: 'Browser helpers are grouped under `SynactJS.helpers` and available globally (fetch, websocket, storage, media, timers).' }),
                Link({ href: 'https://github.com/joexbayer/SynactJS/tree/main', text: 'Open repository', className: 'font-medium' })
            ];

        default:
            return [Paragraph({ text: 'Select a section.' })];
    }
}

function Content() {
    const [selectedSection, setSelectedSection] = useState(docsSections[0].id);

    function Menu() {
        const menuItems = docsSections.map((section) => (
            Link({
                href: `#${section.id}`,
                text: section.title,
                className: `block py-2 px-4 rounded ${selectedSection === section.id ? 'bg-gray-200 font-semibold' : ''}`,
                onClick: (event) => {
                    event.preventDefault();
                    setSelectedSection(section.id);
                }
            })
        ));

        return Box({
            className: 'menu hidden sm:block',
            style: 'border-right: 1px solid #eee; padding: 2rem 1rem; position: sticky; top: 0; min-width: 220px;',
            children: menuItems
        });
    }

    const content = getDocsContent(selectedSection);

    const allContent = docsSections.map((section) => (
        Section({
            id: section.id,
            className: `section ${selectedSection === section.id ? 'active' : ''}`,
            children: [
                ...getDocsContent(section.id),
                Divider()
            ]
        })
    ));

    return Container({
        style: 'display: flex; align-items: flex-start; min-height: 100vh;',
        children: [
            Menu(),
            Box({ style: 'padding: 2rem; flex: 1; min-width: 0;', className: 'hidden sm:block', children: content }),
            Box({ style: 'padding: 2rem; flex: 1; min-width: 0;', className: 'sm:hidden', children: allContent })
        ]
    });
}

export function DocsView() {
    return h(Content);
}
