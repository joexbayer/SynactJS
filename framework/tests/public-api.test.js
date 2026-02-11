const { SynactJS, div } = require("../synact.js");
const { flushMicrotasks, resetDOM } = require("./helpers");

describe("public API module", () => {
    afterEach(async () => {
        try {
            await SynactJS.data.close();
        } catch (_) {
            // cleanup no-op
        }
        SynactJS.pwa.destroy();
        resetDOM();
        localStorage.clear();
    });

    it("render mounts by container id and returns disposer", () => {
        const root = document.createElement("div");
        root.id = "root";
        document.body.appendChild(root);

        function App() {
            return div({}, "hello");
        }

        const dispose = SynactJS.render(App, "root");
        expect(root.textContent).toBe("hello");

        dispose();
        expect(root.textContent).toBe("");
    });

    it("mount is alias of render and unmount clears container", () => {
        const root = document.createElement("div");
        document.body.appendChild(root);

        function App() {
            return div({}, "x");
        }

        SynactJS.mount(App, root);
        expect(root.textContent).toBe("x");

        SynactJS.unmount(root);
        expect(root.textContent).toBe("");
    });

    it("start mounts app once per container by default", async () => {
        const root = document.createElement("div");
        root.id = "start-root";
        document.body.appendChild(root);

        let renderCount = 0;
        function App() {
            renderCount += 1;
            return div({}, `boot-${renderCount}`);
        }

        const disposeOne = await SynactJS.start({ app: App, container: root, waitForDom: false });
        expect(root.textContent).toBe("boot-1");

        const disposeTwo = await SynactJS.start({ app: App, container: root, waitForDom: false });
        expect(disposeTwo).toBe(disposeOne);
        expect(renderCount).toBe(1);
    });

    it("start can initialize data and exposes direct data CRUD helpers", async () => {
        const root = document.createElement("div");
        root.id = "start-data-root";
        document.body.appendChild(root);

        function App() {
            return div({}, "data-ready");
        }

        await SynactJS.start({
            app: App,
            container: root,
            waitForDom: false,
            data: {
                appId: "synact-public-api-start-test",
                engine: "localstorage",
                schemaVersion: 1,
                namespace: "synact-public-api-start-test"
            }
        });

        await SynactJS.data.write("tasks", "t1", { title: "Task 1", done: false });
        await SynactJS.data.update("tasks", "t1", { done: true });
        const task = await SynactJS.data.read("tasks", "t1");
        const rows = await SynactJS.data.query("tasks");

        expect(task).toEqual({ title: "Task 1", done: true });
        expect(rows).toEqual([{ title: "Task 1", done: true }]);

        const removed = await SynactJS.data.delete("tasks", "t1");
        expect(removed).toBe(true);
        expect(await SynactJS.data.read("tasks", "t1")).toBeNull();
    });

    it("data image helpers can write and read image payloads", async () => {
        await SynactJS.data.init({
            appId: "synact-public-api-image-test",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-public-api-image-test"
        });

        const blob = new Blob(["hello-image"], { type: "text/plain" });
        await SynactJS.data.writeImage("images", "img-1", blob, { name: "sample.txt", alt: "Sample text image" });

        const imagePayload = await SynactJS.data.readImage("images", "img-1");
        expect(imagePayload).toBeTruthy();
        expect(imagePayload.__synactType).toBe("image");
        expect(imagePayload.name).toBe("sample.txt");
        expect(imagePayload.alt).toBe("Sample text image");
        expect(imagePayload.dataUrl.startsWith("data:text/plain")).toBe(true);
    });

    it("lazy helper renders fallback and then loaded component", async () => {
        const root = document.createElement("div");
        document.body.appendChild(root);

        const LazyComp = SynactJS.lazy(
            async () => function LoadedComp() {
                return div({}, "lazy-ready");
            },
            {
                fallback: div({}, "lazy-loading")
            }
        );

        SynactJS.render(LazyComp, root);
        expect(root.textContent).toBe("lazy-loading");

        await flushMicrotasks();
        await flushMicrotasks();
        expect(root.textContent).toBe("lazy-ready");
    });

    it("skeleton helper returns shimmer rows", () => {
        const root = document.createElement("div");
        document.body.appendChild(root);

        SynactJS.render(SynactJS.skeleton({ rows: 3 }), root);
        const animatedRows = Array.from(root.querySelectorAll("div"))
            .filter((element) => String(element.style.animation || "").includes("synact-shimmer"));
        expect(animatedRows.length).toBe(3);
    });
});
