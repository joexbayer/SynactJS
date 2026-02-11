# SynactJS

A lightweight, browser-only UI framework built as a hobby project to learn about how React works. With a focus on no classes, no build tools, no servers required. It runs directly in the browser and is perfect for small projects, quick experiments, or progressively enhancing static and server-rendered pages.

In it's current state, very similar to Preact. This framework is entirely built around functions, hooks, and a virtual DOM. Its long-term goal is to evolve with unique features specifically for the web platform, allowing use alongside serverside rendered apps such as Rails or Django.

> **Warning:** SynactJS is an educational project to help understand how React-like libraries work internally. It is not intended for production use.

## Documentation

You can find the latest documentation and live demos on the [SynactJS Docs (GitHub Pages)](https://joexbayer.github.io/SynactJS/), which is built with SynactJS.

## CDN

```html
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
```

## Features

- Virtual DOM diffing and patching
- `useState` and `useEffect`, `useMemo` hooks
- JSX-like element creation with `h()` or tag shorthands
- Simple component model
- Browser-native helper layer for fetch, WebSocket, storage, media queries, events, timers, polling, and debouncing
- Configurable error system with error codes
- Optional component library (`lib/synact.lib.js`) for dashboards and admin UIs

## Usage

1. **Use**  
    To quickly try SynactJS, you can load it directly from a CDN in your HTML:

    ```html
    <script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
    ```

2. **Project Structure**  
    Example project structure in `/docs`:
    - `app/` as the root folder, with an `app/components/` folder for individual components.

---

### Optional Component Library (`lib/`)

To keep core SynactJS lightweight, prebuilt UI components are shipped as a separate optional script.

```html
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/lib/synact.lib.min.js"></script>
```

Available globals after loading the optional library:
Layout/data:
- `SynactLib.AppShell`
- `SynactLib.Grid`
- `SynactLib.Stack`
- `SynactLib.Card`
- `SynactLib.StatCard`
- `SynactLib.DataTable`
- `SynactLib.KeyValueList`
- `SynactLib.EmptyState`
- `SynactLib.SparkBars`

Shadcn-style primitives:
- `SynactLib.Button`
- `SynactLib.Badge`
- `SynactLib.Input`
- `SynactLib.Textarea`
- `SynactLib.SelectField`
- `SynactLib.Switch`
- `SynactLib.Progress`
- `SynactLib.Alert`
- `SynactLib.Divider`
- `SynactLib.Kbd`
- `SynactLib.Toolbar`
- `SynactLib.Tabs`
- `SynactLib.Accordion`
- `SynactLib.Modal`

Browser-powered components:
- `SynactLib.ClipboardButton`
- `SynactLib.ShareButton`
- `SynactLib.NetworkStatusBadge`
- `SynactLib.ThemeToggle`
- `SynactLib.FileDropzone`
- `SynactLib.GeolocationCard`

Example dashboard with minimal HTML:

```html
<div id="app"></div>
<script>
  function Dashboard() {
    return SynactLib.AppShell({
      title: "Sales Dashboard",
      subtitle: "Live reactive widgets with simple HTML",
      actions: [SynactLib.Button({ onClick: () => alert("Export") }, "Export")],
      children: [
        SynactLib.Grid({
          children: [
            SynactLib.StatCard({ label: "Revenue", value: "$54,220", delta: "+8.2%", tone: "positive" }),
            SynactLib.StatCard({ label: "Churn", value: "2.1%", delta: "-0.4%", tone: "positive" }),
            SynactLib.Card({ title: "Weekly Trend", children: SynactLib.SparkBars({ values: [8, 12, 10, 14, 13, 18, 16] }) })
          ]
        })
      ]
    });
  }

  SynactJS.render(Dashboard, "app");
</script>
```

Full mock data example file in this repo: `dashboard.html`

Browser-powered quick example:

```js
const [modalOpen, setModalOpen] = useState(false);

SynactLib.Toolbar({
  children: [
    SynactLib.ThemeToggle({}),
    SynactLib.NetworkStatusBadge({}),
    SynactLib.ClipboardButton({ text: "https://your-app.example", label: "Copy Link" }),
    SynactLib.ShareButton({ data: { title: "Dashboard", url: location.href } }),
    SynactLib.Button({ variant: "primary", onClick: () => setModalOpen(true) }, "Open Modal")
  ]
});
```

---

### Error System

SynactJS emits structured errors with codes like `S001`, `S004`, `S006`, etc.

```js
SynactJS.configure({
  errorMode: "console", // "console" or "throw"
  logErrors: true,
  onError: (error, meta) => {
    console.log("Synact error:", error.code, meta);
  }
});
```

Use `errorMode: "throw"` in development or tests when you want failures to stop execution immediately.

---

### Browser Helpers (Drop-In APIs)

These helpers are available globally (e.g. `useFetch`, `createWebSocket`) and under `SynactJS.helpers`.

Data and networking:
- `createHttpClient(config)`
- `parseResponse(response, mode?)`
- `useFetch(input, options)`
- `createWebSocket(url, options)`
- `useWebSocket(url, options)`

Storage and browser state:
- `useStorageState(key, initialValue, options?)`
- `useLocalStorage(key, initialValue)`
- `useSessionStorage(key, initialValue)`
- `useEventListener(target, eventName, handler)`
- `useOnlineStatus()`
- `useMediaQuery(query)`

Time and async control:
- `useTimeout(callback, delay)`
- `useInterval(callback, delay)`
- `usePolling(callback, intervalMs, options)`
- `useDebouncedValue(value, delay)`
- `sleep(ms)`

Example:

```html
<div id="app"></div>
<script src="./synact.js"></script>
<script>
  const api = createHttpClient({ baseUrl: "https://api.example.com" });

  function App() {
    const { data, loading, error, refresh } = useFetch("/stats", { client: api });
    const socket = useWebSocket("wss://example.com/socket", { reconnect: true });
    const online = useOnlineStatus();
    const [theme, setTheme] = useLocalStorage("theme", "light");
    const compact = useMediaQuery("(max-width: 768px)");

    if (loading) return div({}, "Loading...");
    if (error) return div({}, "Request failed.");

    return div({},
      button({ onClick: () => refresh() }, "Refresh"),
      button({ onClick: () => setTheme(theme === "light" ? "dark" : "light") }, `Theme: ${theme}`),
      p({}, `Online: ${online}`),
      p({}, `Socket status: ${socket.status}`),
      p({}, `Compact layout: ${compact}`),
      pre({}, JSON.stringify(data))
    );
  }

  SynactJS.render(App, "app");
</script>
```

`useFetch` options (common):
- `client`: use your own `createHttpClient(...)` instance
- `immediate`: auto-run on mount (default `true`)
- `deps`: additional dependencies to auto-refresh on change
- `parse`: `"json"` (default), `"text"`, `"blob"`, `"arrayBuffer"`, `"formData"`, `"raw"` or parser function
- `onSuccess` / `onError`: lifecycle callbacks

`useWebSocket` options (common):
- `autoConnect` (default `true`)
- `reconnect`, `reconnectInterval`, `maxRetries`
- `parseJSON`, `serializeJSON`
- `onMessage`, `onStatusChange`

Structured helper errors:
- `S013`: browser API unavailable
- `S014`: network/fetch failure
- `S015`: WebSocket failure
- `S016`: invalid helper usage/options

---

### Example 1: Full App Usage

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8" />
     <title>SynactJS</title>
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
     <script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
</head>
<body>
     <!-- Mount the main App component -->
     <div data-component="App"></div>
     <script type="module" src="./main.js"></script>
</body>
</html>
```

**main.js**
```js
import { App } from './app.js';
// Register your main App component (See example files in the app/ folder)
SynactJS.register(App);
```
---

### Example 2: Direct Use of Counter Component

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8" />
     <title>SynactJS</title>
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
     <script src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
</head>
<body>
     <div data-component="Counter" data-prop='{"label":"Counter A"}'></div>
     <script>
        function Counter({ label = 'Counter' }) {
            const [count, setCount] = useState(0);

            useEffect(() => {
                console.log(`[${label}] count is now ${count}`);
            }, [count]);

            return button({
                class: 'bg-blue-600 text-white p-2',
                onClick: () => setCount(count + 1)
            }, `Click Me ${count} (${label})`);
        }

        SynactJS.register(Counter);
    </script>
</body>
</html>
```

---

## Babel compatible

Although not how its "meant" to be used, you can also use SynactJS with Babel and JSX for a more React-like developer experience. See the example below:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<div data-component="Counter"></div>
<script type="text/babel">
    /** @jsx h */

    function Counter() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            console.log(`Count is now ${count}`);
        }, [count]);

        return (
            <div>
                <h1>SynactJS Counter</h1>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
        );
    }

    SynactJS.register(Counter); 
</script>
```

### Note on JSX Usage

When using SynactJS (or similar libraries like Preact) with Babel or TypeScript, you must specify the JSX factory function at the top of your file using the `/** @jsx h */` pragma. This tells the transpiler to convert JSX syntax into calls to the `h` function instead of the default `React.createElement`. Omitting this directive can lead to runtime errors if React is not present or if you intend to use a different JSX runtime. Always include `/** @jsx h */` at the top of your file when working with alternative JSX runtimes to ensure correct compilation.

## License

MIT
