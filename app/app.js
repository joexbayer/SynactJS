import { Counter } from './components/counter.js';
import { Posts } from './components/posts.js';
import { Navbar } from './components/navbar.js';
import { Todo } from './components/todo.js';

export function App() {
    const routes = {
        '/home': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                h1({ class: "text-3xl font-bold mb-6 text-blue-700" }, 'Mini React'),
                div({ class: "flex gap-6 mb-8" },
                    h(Counter, { label: 'A', key: '1' }),
                    h(Counter, { label: 'B', key: '2' }),
                ),
            )
        ),
        '/posts': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "posts" }),
                h(Posts)
            )
        ),
        '/about': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "about" }),
                h1({ class: "text-2xl text-blue-700" }, "About Mini React"),
                p({}, "This is a simple React-like framework built with JavaScript.")
            )
        ),
        '/todo': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "todo" }),
                h(Todo)
            )
        ),
        '/': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "home" }),
                h1({ class: "text-3xl font-bold mb-6 text-blue-700" }, 'Welcome to Mini React'),
                p({ class: "text-lg text-gray-700 mb-4" }, "This is a simple React-like framework built with JavaScript."),
                p({ class: "text-lg text-gray-700" }, "Explore the components and features."),
                div({ class: "mt-6" },
                    a({
                        href: "/posts",
                        class: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    }, "View Posts")
                )
            )
        ),
        '*': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                h(Navbar, { current: "" }),
                h1({ class: "text-2xl text-red-600" }, "404 Not Found")
            )
        )
    };

    return div({}, h(RouteView, { routes }))
}