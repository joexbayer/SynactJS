const {
    h,
    div,
    button,
    renderApp,
    createHttpClient,
    useFetch,
    useForm,
    useLocalStorage,
    useEventListener,
    createWebSocket,
    useWebSocket
} = require("../synact.js");
const { flushMicrotasks, resetDOM } = require("./helpers");

function createResponse(body, status = 200, statusText = "OK") {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: jest.fn().mockResolvedValue(body),
        text: jest.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
        blob: jest.fn().mockResolvedValue(body),
        arrayBuffer: jest.fn().mockResolvedValue(body),
        formData: jest.fn().mockResolvedValue(body)
    };
}

describe("browser helpers", () => {
    const realFetch = global.fetch;
    const realWebSocket = global.WebSocket;

    afterEach(() => {
        resetDOM();
        localStorage.clear();
        sessionStorage.clear();
        global.fetch = realFetch;
        global.WebSocket = realWebSocket;
    });

    it("createHttpClient serializes JSON body and parses response", async () => {
        global.fetch = jest.fn().mockResolvedValue(createResponse({ ok: true }));
        const client = createHttpClient({
            baseUrl: "https://api.example.com",
            headers: { "X-App": "Synact" }
        });

        const data = await client.post("/metrics", { clicks: 12 }, { headers: { "X-Trace": "abc" } });

        expect(data).toEqual({ ok: true });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe("https://api.example.com/metrics");
        expect(options.method).toBe("POST");
        expect(options.headers["X-App"]).toBe("Synact");
        expect(options.headers["X-Trace"]).toBe("abc");
        expect(options.headers["Content-Type"]).toBe("application/json");
        expect(options.body).toBe(JSON.stringify({ clicks: 12 }));
    });

    it("useFetch resolves request data and updates render output", async () => {
        let resolveFetch;
        global.fetch = jest.fn().mockImplementation(() => new Promise((resolve) => {
            resolveFetch = resolve;
        }));

        function FetchComp() {
            const { data, loading } = useFetch("/stats");
            if (loading) return div({}, "loading");
            return div({}, data ? `total:${data.total}` : "empty");
        }

        const container = document.createElement("div");
        renderApp(() => h(FetchComp), container);
        expect(container.textContent).toBe("empty");

        await flushMicrotasks();
        expect(container.textContent).toBe("loading");

        resolveFetch(createResponse({ total: 42 }));
        await flushMicrotasks();
        expect(container.textContent).toBe("total:42");
    });

    it("useLocalStorage syncs state into localStorage", async () => {
        function StorageComp() {
            const [value, setValue] = useLocalStorage("synact-count", 0);
            return button({ onClick: () => setValue((prev) => prev + 1) }, String(value));
        }

        const container = document.createElement("div");
        renderApp(() => h(StorageComp), container);

        expect(container.textContent).toBe("0");
        container.querySelector("button").click();
        await flushMicrotasks();

        expect(container.textContent).toBe("1");
        expect(localStorage.getItem("synact-count")).toBe("1");
    });

    it("useForm binds fields and submits values", async () => {
        const submitted = [];

        function FormComp() {
            const form = useForm({
                initialValues: {
                    name: "",
                    subscribed: false
                },
                validate: (values) => {
                    if (!values.name) {
                        return { name: "name-required" };
                    }
                    return {};
                }
            });

            return div(
                {},
                input({ id: "name", ...form.bind("name") }),
                input({ id: "subscribed", type: "checkbox", ...form.bind("subscribed", { type: "checkbox" }) }),
                button({
                    id: "save",
                    onClick: form.handleSubmit((values) => {
                        submitted.push({ ...values });
                    })
                }, "save"),
                div({ id: "error" }, form.errors.name || "")
            );
        }

        const container = document.createElement("div");
        renderApp(() => h(FormComp), container);

        const nameInput = container.querySelector("#name");
        const subscribedInput = container.querySelector("#subscribed");
        const saveButton = container.querySelector("#save");

        nameInput.value = "Synact";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
        subscribedInput.checked = true;
        subscribedInput.dispatchEvent(new Event("input", { bubbles: true }));
        await flushMicrotasks();
        saveButton.click();

        await flushMicrotasks();

        expect(submitted).toEqual([{ name: "Synact", subscribed: true }]);
        expect(container.querySelector("#error").textContent).toBe("");
    });

    it("useForm exposes validation errors on submit", async () => {
        const submitted = [];

        function FormComp() {
            const form = useForm({
                initialValues: { name: "" },
                validate: (values) => (values.name ? {} : { name: "name-required" })
            });

            return div(
                {},
                button({
                    id: "save",
                    onClick: form.handleSubmit((values) => {
                        submitted.push(values);
                    })
                }, "save"),
                div({ id: "error" }, form.errors.name || "")
            );
        }

        const container = document.createElement("div");
        renderApp(() => h(FormComp), container);
        container.querySelector("#save").click();
        await flushMicrotasks();

        expect(submitted).toEqual([]);
        expect(container.querySelector("#error").textContent).toBe("name-required");
    });

    it("useEventListener binds and cleans up listeners", async () => {
        function ListenerComp() {
            const [count, setCount] = useLocalStorage("event-count", 0);
            useEventListener(window, "synact:tick", () => setCount((prev) => prev + 1));
            return div({}, String(count));
        }

        const container = document.createElement("div");
        const dispose = renderApp(() => h(ListenerComp), container);
        expect(container.textContent).toBe("0");

        window.dispatchEvent(new CustomEvent("synact:tick"));
        await flushMicrotasks();
        expect(container.textContent).toBe("1");

        dispose();
        window.dispatchEvent(new CustomEvent("synact:tick"));
        await flushMicrotasks();
        expect(container.textContent).toBe("");
    });

    it("createWebSocket handles lifecycle, parsing, and sending", () => {
        class MockWebSocket {
            constructor(url) {
                this.url = url;
                this.sent = [];
                this.readyState = MockWebSocket.CONNECTING;
            }

            send(payload) {
                this.sent.push(payload);
            }

            close() {
                this.readyState = MockWebSocket.CLOSED;
                if (typeof this.onclose === "function") {
                    this.onclose({ code: 1000 });
                }
            }
        }

        MockWebSocket.CONNECTING = 0;
        MockWebSocket.OPEN = 1;
        MockWebSocket.CLOSED = 3;

        global.WebSocket = MockWebSocket;

        const messages = [];
        const statuses = [];
        const ws = createWebSocket("ws://example.com", { reconnect: false });
        ws.subscribe((message) => messages.push(message));
        ws.onStatus((status) => statuses.push(status));

        const socket = ws.connect();
        socket.readyState = MockWebSocket.OPEN;
        socket.onopen({});
        socket.onmessage({ data: JSON.stringify({ type: "ready" }) });

        ws.send({ op: "ping" });
        expect(messages).toEqual([{ type: "ready" }]);
        expect(statuses).toEqual(["connecting", "open"]);
        expect(socket.sent).toEqual([JSON.stringify({ op: "ping" })]);
    });

    it("useWebSocket updates status and lastMessage", async () => {
        class MockWebSocket {
            constructor(url) {
                this.url = url;
                this.sent = [];
                this.readyState = MockWebSocket.CONNECTING;
                MockWebSocket.instances.push(this);
            }

            send(payload) {
                this.sent.push(payload);
            }

            close() {
                this.readyState = MockWebSocket.CLOSED;
                if (typeof this.onclose === "function") {
                    this.onclose({ code: 1000 });
                }
            }
        }

        MockWebSocket.instances = [];
        MockWebSocket.CONNECTING = 0;
        MockWebSocket.OPEN = 1;
        MockWebSocket.CLOSED = 3;
        global.WebSocket = MockWebSocket;

        function SocketComp() {
            const { status, lastMessage } = useWebSocket("ws://stream.test", { reconnect: false });
            const messageType = lastMessage ? lastMessage.type : "none";
            return div({}, `${status}:${messageType}`);
        }

        const container = document.createElement("div");
        renderApp(() => h(SocketComp), container);

        await flushMicrotasks();
        const socket = MockWebSocket.instances[0];
        expect(container.textContent).toBe("connecting:none");

        socket.readyState = MockWebSocket.OPEN;
        socket.onopen({});
        socket.onmessage({ data: JSON.stringify({ type: "tick" }) });
        await flushMicrotasks();

        expect(container.textContent).toBe("open:tick");
    });
});
