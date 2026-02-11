# Function-as-State (Reactive Functions)
Description:
Instead of just rendering data, Synact lets functions themselves be reactive state.
Why it matters:
No need for re-renders when just behavior changes. Breaks React’s tight coupling of logic and VDOM updates.

```js
const [handler, setHandler] = createSignal(() => () => alert("Hi"));

button({ onClick: handler() }, "Click Me");

setHandler(() => () => alert("Updated!")); 
```

# Lifecycled Islands (Out-of-Tree Components)
Description:
Components can live outside the main DOM tree (like modals, overlays, portals) but still maintain state and hooks.
Why it matters:
No more awkward context bridges or portals. Logic stays local, DOM goes global.

```js
const Tooltip = () => usePortal(() =>
  div({ class: "tooltip" }, "I'm in <body>!")
);
```
# Components as State Machines

Description:
Every component can define states and transitions declaratively  no need for useReducer spaghetti.
Why it matters:
Replaces scattered conditional logic with clear, visualizable, debuggable machines.

```js
const Toggle = () => {
  const { state, send } = useMachine({
    off: { on: { TOGGLE: "on" } },
    on: { on: { TOGGLE: "off" } }
  });

  return button({ onClick: () => send("TOGGLE") }, `State: ${state}`);
};
```
# Multi-Runtime Components (DOM, API, Worker)

Description:

Components aren’t just visualthey can run as APIs, workers, or data fetchers.

Why it matters:

Write once, deploy everywhere. Perfect for isomorphic apps, dashboards, and FaaS platforms.

```js
function UserInfo() {
  const user = useResource(() => fetch("/api/user").then(r => r.json()));
  return div({}, `Hello ${user()?.name}`);
}

// Reuse it server-side:
api.get("/info", () => renderComponentToJSON(UserInfo));
```

# Mutable Layout Engine (useLayout)
Description:

Control DOM layout without triggering re-renders via useLayout()  perfect for scroll, animation, or transforms.

Why it matters:

Reduces costly VDOM updates, gives you motion control built into the lifecycle.

```js
const el = useLayout(el => {
  const onScroll = () => el.style.transform = `translateY(${window.scrollY}px)`;
  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
});
```


# Reactive useStorage() Hook

Description:

Sync a signal with localStorage or sessionStorage automatically.

Why it matters:

No more effect spaghetti for persistence  state is just… persistent.

```js
const [theme, setTheme] = useStorage("theme", "light");
```

# Built-in useWorker() Hook

Description:

Run functions in a Web Worker, no boilerplate.

Why it matters:

Keeps your UI thread buttery smooth  use it for image compression, markdown parsing, etc.

```js
const [result, run] = useWorker(() => heavyCalculation());

button({ onClick: run }, "Start Work");
```
