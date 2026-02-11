import { Section, Card, Subheading, Paragraph, Button } from './ui.js';

function Feature({ title, description, details }) {
    const [expanded, setExpanded] = useState(true);

    return Card({
        className: 'mb-4 w-full',
        content: [
            Subheading({ text: title }),
            Paragraph({ text: description }),
            div({ style: "transition: min-height 0.2s; word-wrap: break-word;" },
                expanded ? Paragraph({ text: details }) : div({}, '')
            ),
            a({
                href: "#", onClick: (e) => { e.preventDefault(); setExpanded(!expanded); },
                className: 'mt-2 text-blue-600 underline cursor-pointer'
            },
                expanded ? 'Show Less' : 'Read More'
            )
        ]
    });
}

export function FeaturesSection() {
    return Section({
        children: [
            h(Feature, {
                title: 'Minimal Setup',
                description: 'Drop a single script tag and start building immediately, no installs, no bundlers...',
                details: 'With SynactJS, there’s no need for npm, Webpack, Vite, or any other tooling. Just include one script tag from a CDN and start writing components directly in the browser. Perfect for small apps, widgets, prototypes, or injecting interactivity into static or CMS-generated sites.'
            }),
            h(Feature, {
                title: 'Reactivity Built-In',
                description: 'Manage state and side effects using built-in hooks like useState and useEffect...',
                details: 'SynactJS includes built-in support for `useState`, `useEffect`, `useMemo`, and `useCallback`. No third-party libraries or configuration required. Hooks behave just like in React, enabling functional, declarative code that responds automatically to user interaction and data changes.'
            }),
            h(Feature, {
                title: 'Native Routing',
                description: 'Use `useRouter()` and `RouteView()` to build smooth single-page apps...',
                details: 'You can build SPAs using `useRouter()` and `RouteView()` without any additional packages. The router supports pushState navigation, back/forward browser buttons, and a simple path-to-component mapping system. Graceful fallbacks and minimal boilerplate make routing feel natural and lightweight.'
            }),
            h(Feature, {
                title: 'Components Anywhere',
                description: 'Mount components declaratively with `data-component` on any DOM node...',
                details: 'Enhance static HTML pages by attaching interactive components via the `data-component` attribute. SynactJS automatically scans and mounts these components, enabling progressive enhancement without complex hydration logic. Great for server-rendered pages, dashboards, documentation, or isolated widgets.'
            }),
            h(Feature, {
                title: 'Browser Helpers Built-In',
                description: 'Fetch, WebSockets, storage, media-query, and timer abstractions that fit the hook model...',
                details: 'SynactJS includes helper APIs like `createHttpClient`, `useFetch`, `createWebSocket`, `useWebSocket`, `useLocalStorage`, `useOnlineStatus`, `useMediaQuery`, and polling/debounce helpers. They are exposed globally and under `SynactJS.helpers`, making browser-native capabilities easier to use without extra utility libraries.'
            }),
            h(Feature, {
                title: 'Optional UI Library',
                description: 'Use SynactLib for prebuilt dashboard/admin components without bloating core runtime...',
                details: 'The optional `lib/synact.lib.js` bundle provides `AppShell`, `Grid`, `StatCard`, `DataTable`, and related UI components. It is loaded separately so users that only want core runtime behavior are not forced to download extra UI code.'
            })
        ]
    });
}
