const { h, div, renderApp, mountedContainers } = require("../synact.js");
const { resetDOM } = require("./helpers");

describe("state module", () => {
    afterEach(() => {
        resetDOM();
    });

    it("tracks mounted root containers", () => {
        function App() {
            return div({}, "state");
        }

        const root = document.createElement("div");
        const dispose = renderApp(() => h(App), root);

        expect(mountedContainers.has(root)).toBe(true);

        dispose();
        expect(mountedContainers.has(root)).toBe(false);
    });
});
