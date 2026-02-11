const {
    h,
    renderApp,
    useState,
    useEffect,
    useMemo,
    useCallback,
    button,
    div
} = require("../synact.js");
const { flushMicrotasks, resetDOM } = require("./helpers");

describe("hooks module", () => {
    afterEach(() => {
        resetDOM();
    });

    it("useState supports functional updates and rerenders", async () => {
        function Counter() {
            const [count, setCount] = useState(0);
            return button({ onClick: () => setCount((prev) => prev + 1) }, String(count));
        }

        const container = document.createElement("div");
        renderApp(() => h(Counter), container);

        expect(container.textContent).toBe("0");
        container.querySelector("button").click();
        await flushMicrotasks();
        expect(container.textContent).toBe("1");
    });

    it("useEffect runs and cleans up when deps change", async () => {
        const events = [];

        function App() {
            const [count, setCount] = useState(0);

            useEffect(() => {
                events.push(`run:${count}`);
                return () => events.push(`cleanup:${count}`);
            }, [count]);

            return button({ onClick: () => setCount(count + 1) }, String(count));
        }

        const container = document.createElement("div");
        renderApp(() => h(App), container);

        expect(events).toEqual(["run:0"]);
        container.querySelector("button").click();
        await flushMicrotasks();

        expect(events).toEqual(["run:0", "cleanup:0", "run:1"]);
    });

    it("useMemo and useCallback memoize by deps", () => {
        let memoCalls = 0;
        let dep = 1;

        function MemoComp() {
            const val = useMemo(() => {
                memoCalls++;
                return dep * 2;
            }, [dep]);
            return div({}, String(val));
        }

        const container = document.createElement("div");
        renderApp(MemoComp, container);
        expect(container.textContent).toBe("2");
        expect(memoCalls).toBe(1);

        dep = 1;
        renderApp(MemoComp, container);
        expect(memoCalls).toBe(1);

        dep = 2;
        renderApp(MemoComp, container);
        expect(container.textContent).toBe("4");
        expect(memoCalls).toBe(2);

        let callbackCalls = 0;
        function CallbackComp() {
            const fn = useCallback(() => {
                callbackCalls++;
            }, []);
            fn();
            return div({}, "ok");
        }

        renderApp(CallbackComp, container);
        renderApp(CallbackComp, container);
        expect(callbackCalls).toBe(2);
    });
});
