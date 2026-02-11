const { SynactJS, div } = require("../synact.js");
const { resetDOM } = require("./helpers");

describe("public API module", () => {
    afterEach(() => {
        resetDOM();
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
});
