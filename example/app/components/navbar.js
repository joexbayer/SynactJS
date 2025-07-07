export function NavLink({ href, children, active }) {
    return (
        a({
            href,
            class: `px-3 py-2 rounded-md text-sm font-medium ${active
                ? "bg-blue-700 text-white"
                : "text-blue-700 hover:bg-blue-100"
                }`
        }, children)
    );
}

export function Navbar({ current } = {}) {
    console.log("Rendering Navbar with current:", current);
    return (
        nav({ class: "w-full bg-white shadow mb-8" },
            div({ class: "max-w-4xl mx-auto px-4 flex items-center h-16" },
                h1({ class: "text-xl font-bold text-blue-700 flex-1" }, "Mini React"),
                div({ class: "flex gap-4" },
                    NavLink({ href: "/home", children: "Home", active: current === "home" }),
                    NavLink({ href: "/posts", children: "Posts", active: current === "posts" }),
                    NavLink({ href: "/about", children: "About", active: current === "about" }),
                    NavLink({ href: "/todo", children: "Todo", active: current === "todo" })
                )
            )
        )
    );
}