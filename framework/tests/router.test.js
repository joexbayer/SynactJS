const { h, div, button, renderApp, useRouter, RouteView } = require("../synact.js");
const { flushMicrotasks, resetDOM } = require("./helpers");

describe("router module", () => {
    afterEach(() => {
        resetDOM();
    });

    it("useRouter returns route and push updates it", async () => {
        window.history.pushState({}, "", "/foo");

        function App() {
            const [route, push] = useRouter();
            return div({}, route, button({ onClick: () => push("/bar") }, "go"));
        }

        const container = document.createElement("div");
        renderApp(App, container);

        expect(container.textContent).toContain("/foo");
        container.querySelector("button").click();
        await flushMicrotasks();
        expect(container.textContent).toContain("/bar");
    });

    it("RouteView renders matching route", async () => {
        window.history.pushState({}, "", "/a");
        const routes = {
            "/a": () => h("div", {}, "A"),
            "/b": () => h("div", {}, "B"),
            "*": () => h("div", {}, "Not found")
        };

        const container = document.createElement("div");
        renderApp(() => h(RouteView, { routes }), container);
        expect(container.textContent).toBe("A");

        window.history.pushState({}, "", "/b");
        window.dispatchEvent(new PopStateEvent("popstate"));
        await flushMicrotasks();
        expect(container.textContent).toBe("B");
    });

    it("preserves query and hash segments during push navigation", async () => {
        window.history.pushState({}, "", "/");

        function App() {
            const [route, push] = useRouter();
            return div(
                {},
                button({ onClick: () => push("/reports?tab=week#chart") }, "Open reports"),
                h("span", { id: "route" }, route)
            );
        }

        const container = document.createElement("div");
        renderApp(() => h(App), container);
        container.querySelector("button").click();
        await flushMicrotasks();

        expect(window.location.pathname + window.location.search + window.location.hash).toBe("/reports?tab=week#chart");
        expect(container.textContent).toContain("/reports?tab=week#chart");
    });
});
