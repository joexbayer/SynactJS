const fs = require("fs");
const path = require("path");
const { h, renderApp, SynactJS } = require("../synact.js");
const { flushMicrotasks } = require("./helpers");

describe("SynactLib bundle", () => {
    let originalPwaApi;

    function loadLibraryBundle() {
        const libPath = path.join(__dirname, "..", "lib", "synact.lib.js");
        const source = fs.readFileSync(libPath, "utf8");
        // eslint-disable-next-line no-eval
        eval(source);
    }

    beforeEach(() => {
        document.body.innerHTML = "";
        document.documentElement.className = "";
        localStorage.clear();
        window.SynactLib = undefined;
        originalPwaApi = SynactJS.pwa;
    });

    afterEach(() => {
        SynactJS.pwa = originalPwaApi;
    });

    it("exposes expanded component API on window.SynactLib", () => {
        loadLibraryBundle();

        expect(window.SynactLib).toBeTruthy();

        const expected = [
            "AppShell",
            "Grid",
            "Stack",
            "Card",
            "StatCard",
            "DataTable",
            "KeyValueList",
            "EmptyState",
            "Badge",
            "Button",
            "Input",
            "Textarea",
            "SelectField",
            "Switch",
            "Progress",
            "Alert",
            "Divider",
            "Kbd",
            "SparkBars",
            "Toolbar",
            "Tabs",
            "Accordion",
            "Modal",
            "ClipboardButton",
            "ShareButton",
            "NetworkStatusBadge",
            "ThemeToggle",
            "FileDropzone",
            "GeolocationCard",
            "MobileAppShell",
            "BottomNav",
            "OfflineBanner",
            "PWAInstallBanner"
        ];

        for (const key of expected) {
            expect(typeof window.SynactLib[key]).toBe("function");
        }
    });

    it("ThemeToggle renders when storage access throws", async () => {
        loadLibraryBundle();
        SynactJS.configure({ logErrors: false });

        const getItemSpy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("storage blocked");
        });
        const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("storage blocked");
        });

        try {
            const container = document.createElement("div");
            document.body.appendChild(container);
            renderApp(() => h(window.SynactLib.ThemeToggle, {}), container);
            await flushMicrotasks();

            expect(container.querySelector("button")).toBeTruthy();
            expect(container.textContent).toContain("Theme:");
        } finally {
            getItemSpy.mockRestore();
            setItemSpy.mockRestore();
            SynactJS.configure({ logErrors: true });
        }
    });

    it("Button defaults to type=button to avoid accidental form submit", async () => {
        loadLibraryBundle();

        const container = document.createElement("div");
        document.body.appendChild(container);
        renderApp(() => h(window.SynactLib.Button, { children: "Save" }), container);
        await flushMicrotasks();

        const buttonEl = container.querySelector("button");
        expect(buttonEl).toBeTruthy();
        expect(buttonEl.getAttribute("type")).toBe("button");
    });

    it("OfflineBanner responds to browser online/offline events", async () => {
        loadLibraryBundle();

        const container = document.createElement("div");
        document.body.appendChild(container);

        renderApp(() => h(window.SynactLib.OfflineBanner, {
            offlineText: "Offline now",
            hideWhenOnline: true
        }), container);

        window.dispatchEvent(new Event("offline"));
        await flushMicrotasks();
        expect(container.textContent).toContain("Offline now");

        window.dispatchEvent(new Event("online"));
        await flushMicrotasks();
        expect(container.textContent).not.toContain("Offline now");
    });

    it("PWAInstallBanner prompts install and reports outcome", async () => {
        loadLibraryBundle();

        const listeners = new Map();
        let installState = { canPrompt: true, installed: false };
        const promptInstall = jest.fn().mockImplementation(async () => {
            installState = { ...installState, canPrompt: false };
            return { outcome: "accepted", platform: "web" };
        });
        SynactJS.pwa = {
            getInstallState: jest.fn(() => ({ ...installState })),
            promptInstall,
            on: jest.fn((eventName, callback) => {
                if (!listeners.has(eventName)) listeners.set(eventName, new Set());
                listeners.get(eventName).add(callback);
                return () => listeners.get(eventName)?.delete(callback);
            })
        };

        const onResult = jest.fn();
        const container = document.createElement("div");
        document.body.appendChild(container);

        renderApp(() => h(window.SynactLib.PWAInstallBanner, {
            title: "Install Synact App",
            installLabel: "Install now",
            onResult
        }), container);
        await flushMicrotasks();

        expect(container.textContent).toContain("Install Synact App");
        const installButton = Array.from(container.querySelectorAll("button"))
            .find((btn) => btn.textContent.includes("Install now"));
        expect(installButton).toBeTruthy();

        installButton.click();
        await flushMicrotasks();
        await flushMicrotasks();

        expect(promptInstall).toHaveBeenCalledTimes(1);
        expect(onResult).toHaveBeenCalledWith({ outcome: "accepted", platform: "web" });
        expect(container.textContent).not.toContain("Install Synact App");
    });

    it("PWAInstallBanner dismisses and persists dismissal to storage", async () => {
        loadLibraryBundle();

        const dismissKey = "synact-test-install-banner-dismiss";
        SynactJS.pwa = {
            getInstallState: jest.fn(() => ({ canPrompt: true, installed: false })),
            promptInstall: jest.fn().mockResolvedValue({ outcome: "dismissed" }),
            on: jest.fn(() => () => {})
        };

        const container = document.createElement("div");
        document.body.appendChild(container);

        renderApp(() => h(window.SynactLib.PWAInstallBanner, {
            title: "Install again",
            dismissLabel: "Later",
            dismissKey
        }), container);
        await flushMicrotasks();

        const dismissButton = Array.from(container.querySelectorAll("button"))
            .find((btn) => btn.textContent.includes("Later"));
        expect(dismissButton).toBeTruthy();

        dismissButton.click();
        await flushMicrotasks();

        expect(localStorage.getItem(dismissKey)).toBe("1");
        expect(container.textContent).not.toContain("Install again");
    });
});
