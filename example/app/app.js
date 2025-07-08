import { Posts } from './components/posts.js';
import { Navbar } from './components/navbar.js';

import { DocsView } from './docs.js';
import { HomeView } from './home.js';

export const ThemeContext = createContext("light");

export function InnerApp() {
    const routes = {
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
        '*': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                div({ class: "flex flex-col items-center mt-16" },
                    div({ class: "text-6xl mb-4" }, "🚧"),
                    div({ class: "text-3xl font-bold text-orange-700 mb-2" }, "Under Construction"),
                    div({ class: "text-lg text-gray-700 mb-6 text-center max-w-md" },
                        "We're working hard to bring you this page. Please check back soon!"
                    ),
                    div({ class: "animate-bounce text-2xl text-orange-500" }, "👷‍♂️")
                )
            )
        ),
    };

    return h(RouteView, { routes })
}

export function App() {
    return h(ThemeContext.Provider, {
        value: "dark",
        children: h(InnerApp)
    });
}