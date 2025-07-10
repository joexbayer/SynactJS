import { Navbar } from './components/navbar.js';

import { DocsView } from './docs.js';
import { HomeView } from './home.js';
import { ExamplesView } from './examples.js';

import { Heading, Paragraph, Box, Container, Subheading } from './components/ui.js';

const ThemeContext = createContext("light");

function InnerApp() {
    const routes = {
        '/': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                h(HomeView)
            )
        ),
        '/home': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                h(HomeView)
            )
        ),
        '/docs': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "docs" }),
                h(DocsView)
            )
        ),
        '/about': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "about" }),
                Container({
                    style: 'min-height: 100vh;',
                    children: [
                        Heading({ text: 'About SynactJS' }),
                        Paragraph({ text: 'SynactJS came out of frustration with wanting reactive components on static or server-rendered pages, without needing a whole Node build pipeline and server just to get dynamic content.' }),
                        Subheading({ text: 'Why SynactJS?' }),
                        Paragraph({ text: 'I know this project is very similar to Preact currently (and even React can technically run in the browser without a build step), but I wanted to build something myself with a more "browser native" approach. Easier to use with traditional server-rendered apps like Rails or Django.' }),
                        Subheading({ text: 'How is it different?' }),
                        Paragraph({ text: 'It’s inspired by how React works, using hooks and a virtual DOM, but with a focus on being browser-only, no build tools, and no servers. I’ve also never liked Alpine.js, especially when it comes to dynamic updates or managing component state across the page.' }),
                    ]
                })
            )
        ),
        '/examples': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "examples" }),
                h(ExamplesView, { className: "mt-8" })
            )
        ),
        '*': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                div({ class: "flex flex-col items-center mt-16" },
                    div({ class: "text-6xl mb-4" }, "🚧"),
                    div({ class: "text-3xl font-bold text-orange-700 mb-2" }, "Under Construction"),
                    div({ class: "text-lg text-gray-700 mb-6 text-center max-w-md" },
                        "We're working hard to bring you this page. Please check back soon!"
                    ),
                    div({ class: "animate-bounce text-2xl text-orange-500" }, "👷‍♂️"),
                )
            )
        )
    }

    return h(RouteView, { routes, prefix: '/SynactJS' }, null);
}

export function App() {
    return h(ThemeContext.Provider, {
        value: "dark",
        children: h(InnerApp)
    });
}

document.addEventListener("DOMContentLoaded", () => {
    window.SynactJS.register(App);
});