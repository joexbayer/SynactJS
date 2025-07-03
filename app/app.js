import { Counter } from './components/counter.js';
import { Posts } from './components/posts.js';
import { Navbar } from './components/navbar.js';

export function App() {
    const routes = {
        '/': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                Navbar({ current: "home" }),
                h1({ class: "text-3xl font-bold mb-6 text-blue-700" }, 'Mini React'),
                div({ class: "flex gap-6 mb-8" },
                    Counter({ label: 'A' }),
                    Counter({ label: 'B' })
                ),
            )
        ),
        '/posts': () => (
            div({ class: "min-h-screen bg-gray-100 flex flex-col items-center" },
                Navbar({ current: "posts" }),
                Posts()
            )
        ),
        '*': () => (
            div({ class: "min-h-screen flex items-center justify-center" },
                h1({ class: "text-2xl text-red-600" }, "404 Not Found")
            )
        )
    };

    const [route] = useRouter();

    return Router({ routes, route });
}
