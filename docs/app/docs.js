import { Container, Section, Heading, Paragraph, Divider, Box, Link } from './components/ui.js';

const docsSections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'install', title: 'Installation' },
    { id: 'usage', title: 'Usage' },
    { id: 'helpers', title: 'Browser Helpers' },
    { id: 'lib', title: 'Component Library' },
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
                Paragraph({ text: 'SynactJS is a drop-in, browser-first UI framework. Include one script, write JavaScript components, and render into a single HTML mount node.' }),
                Paragraph({ text: 'The core runtime gives you virtual DOM + hooks. Optional layers add prebuilt UI components (`SynactLib`) and browser-native helper abstractions for data, sockets, storage, and events.' }),
                BulletList([
                    'No build step required for basic usage',
                    'Hooks + component model similar to React',
                    'Works with static HTML and server-rendered pages',
                    'Optional extras: SynactLib + browser helper APIs'
                ])
            ];

        case 'install':
            return [
                Heading({ text: 'Installation' }),
                Paragraph({ text: 'For the drop-in experience, use classic script tags:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<!-- Core runtime -->
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>

<!-- Optional prebuilt UI components -->
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/lib/synact.lib.min.js"></script>`
                }),
                Paragraph({ text: 'The optional library is separate so the core runtime stays small.' }),
                Paragraph({ text: 'For local project files, you can also use:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<script src="./synact.js"></script>
<script src="./lib/synact.lib.js"></script>`
                })
            ];

        case 'usage':
            return [
                Heading({ text: 'Usage' }),
                Paragraph({ text: 'Minimal HTML + JavaScript app:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
    <script src="./synact.js"></script>
    <script>
      function Counter() {
        const [count, setCount] = useState(0);
        return button({ onClick: () => setCount(count + 1) }, \`Count: \${count}\`);
      }

      SynactJS.render(Counter, 'app');
    </script>
  </body>
</html>`
                }),
                Paragraph({ text: 'Progressive enhancement with `data-component` also works:' }),
                CodeBlock({
                    language: 'html',
                    codeText: `<div data-component="Greeting" data-prop='{"name":"Synact"}'></div>
<script src="./synact.js"></script>
<script>
  function Greeting({ name }) {
    return div({}, \`Hello \${name}\`);
  }

  SynactJS.register(Greeting);
</script>`
                })
            ];

        case 'helpers':
            return [
                Heading({ text: 'Browser Helpers' }),
                Paragraph({ text: 'SynactJS now ships browser-native helper APIs integrated with hooks and cleanup behavior. They are available globally and at `SynactJS.helpers`.' }),
                BulletList([
                    'Data: createHttpClient, parseResponse, useFetch',
                    'Realtime: createWebSocket, useWebSocket',
                    'Storage: useStorageState, useLocalStorage, useSessionStorage',
                    'Environment: useEventListener, useOnlineStatus, useMediaQuery',
                    'Timing: useTimeout, useInterval, usePolling, useDebouncedValue, sleep'
                ]),
                Heading({ text: 'Fetch Example', level: 2 }),
                CodeBlock({
                    language: 'js',
                    codeText: `const api = createHttpClient({ baseUrl: 'https://api.example.com' });

function Metrics() {
  const { data, loading, error, refresh } = useFetch('/stats', { client: api });

  if (loading) return div({}, 'Loading...');
  if (error) return div({}, 'Request failed');

  return div({}
    ,button({ onClick: () => refresh() }, 'Refresh')
    ,pre({}, JSON.stringify(data, null, 2))
  );
}`
                }),
                Heading({ text: 'WebSocket Example', level: 2 }),
                CodeBlock({
                    language: 'js',
                    codeText: `function LiveFeed() {
  const { status, lastMessage, send } = useWebSocket('wss://example.com/socket', {
    reconnect: true,
    reconnectInterval: 1500
  });

  return div({}
    ,p({}, \`Socket: \${status}\`)
    ,button({ onClick: () => send({ type: 'ping' }) }, 'Ping')
    ,pre({}, JSON.stringify(lastMessage, null, 2))
  );
}`
                }),
                Heading({ text: 'Storage + Polling Example', level: 2 }),
                CodeBlock({
                    language: 'js',
                    codeText: `function DashboardSettings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const online = useOnlineStatus();

  usePolling(() => {
    console.log('poll tick');
  }, 10000, { enabled: online, immediate: false });

  return button({ onClick: () => setTheme(theme === 'light' ? 'dark' : 'light') }, theme);
}`
                })
            ];

        case 'lib':
            return [
                Heading({ text: 'Component Library (`lib/`)' }),
                Paragraph({ text: 'SynactLib is an optional add-on for dashboards/admin UIs. Keep it separate to avoid bloating the base runtime for users who only need core hooks + rendering.' }),
                Paragraph({ text: 'The current library includes a shadcn-style primitive set plus browser-powered components.' }),
                BulletList([
                    'Layout/data: AppShell, Grid, Stack, Card, StatCard, DataTable, KeyValueList, EmptyState, SparkBars',
                    'Primitives: Button, Badge, Input, Textarea, SelectField, Switch, Progress, Alert, Divider, Kbd, Tabs, Accordion, Modal',
                    'Browser-powered: ClipboardButton, ShareButton, NetworkStatusBadge, ThemeToggle, FileDropzone, GeolocationCard'
                ]),
                CodeBlock({
                    language: 'html',
                    codeText: `<div id="app"></div>
<script src="./synact.js"></script>
<script src="./lib/synact.lib.js"></script>
<script>
  function Dashboard() {
    return SynactLib.AppShell({
      title: 'Operations',
      children: [
        SynactLib.Grid({ children: [
          SynactLib.StatCard({ label: 'Revenue', value: '$54,220', delta: '+8.2%', tone: 'positive' }),
          SynactLib.Card({ title: 'Trend', children: SynactLib.SparkBars({ values: [8,12,10,14,18] }) })
        ] })
      ]
    });
  }

  SynactJS.render(Dashboard, 'app');
</script>`
                }),
                CodeBlock({
                    language: 'js',
                    codeText: `function QuickActions() {
  const [open, setOpen] = useState(false);

  return SynactLib.Toolbar({
    children: [
      SynactLib.ThemeToggle({}),
      SynactLib.NetworkStatusBadge({}),
      SynactLib.ClipboardButton({ text: location.href }),
      SynactLib.ShareButton({ data: { title: 'Synact Dashboard', url: location.href } }),
      SynactLib.Button({ variant: 'primary', onClick: () => setOpen(true) }, 'Open Modal'),
      SynactLib.Modal({ open, title: 'Hello', onClose: () => setOpen(false), children: 'Modal content' })
    ]
  });
}`
                }),
                Paragraph({ text: 'A full mock dashboard example is included at `/dashboard.html` in the repository root.' })
            ];

        case 'errors':
            return [
                Heading({ text: 'Error System' }),
                Paragraph({ text: 'SynactJS emits structured errors with codes (e.g. `S001`, `S007`, `S014`) for predictable diagnostics and easier troubleshooting.' }),
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
                Paragraph({ text: 'Common helper-related codes:' }),
                BulletList([
                    'S013: browser API unavailable in current environment',
                    'S014: network/fetch failure',
                    'S015: WebSocket operation failure',
                    'S016: invalid helper usage or bad helper options'
                ])
            ];

        case 'api':
            return [
                Heading({ text: 'API Reference' }),
                Heading({ text: 'Core Runtime', level: 2 }),
                BulletList([
                    'SynactJS.register(component)',
                    'SynactJS.render(componentOrVNode, containerOrSelector, props?)',
                    'SynactJS.mount(...) / SynactJS.unmount(...)',
                    'SynactJS.configure(config) / SynactJS.getConfig()'
                ]),
                Heading({ text: 'Core Hooks', level: 2 }),
                BulletList([
                    'useState, useEffect, useMemo, useCallback',
                    'createContext, useContext',
                    'useRouter, RouteView, Fragment'
                ]),
                Heading({ text: 'Tag Helpers', level: 2 }),
                Paragraph({ text: 'HTML helper functions are globally available (`div`, `button`, `input`, `table`, etc.) and map to virtual DOM element creation.' }),
                Heading({ text: 'Helper Namespace', level: 2 }),
                Paragraph({ text: 'All browser helper APIs are also grouped at `SynactJS.helpers` for discoverability and editor autocomplete.' }),
                Paragraph({ text: 'See the project README for complete up-to-date examples and code snippets.' }),
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
