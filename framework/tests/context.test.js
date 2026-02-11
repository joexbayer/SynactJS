const { h, div, createContext, useContext, renderApp } = require("../synact.js");
const { resetDOM } = require("./helpers");

describe("context module", () => {
    afterEach(() => {
        resetDOM();
    });

    it("uses provider value and restores parent context after nested providers", () => {
        const ThemeContext = createContext("light");

        function Reader() {
            return div({}, useContext(ThemeContext));
        }

        function App() {
            return h(ThemeContext.Provider, {
                value: "outer",
                children: div({}
                    , h(Reader)
                    , h(ThemeContext.Provider, { value: "inner", children: h(Reader) })
                    , h(Reader)
                )
            });
        }

        const container = document.createElement("div");
        renderApp(() => h(App), container);

        expect(container.textContent).toBe("outerinnerouter");
    });
});
