const { SynactJS, PWAService } = require("../synact.js");
const { resetDOM } = require("./helpers");

function createMockWorker(initialState = "installing") {
    const worker = new EventTarget();
    worker.state = initialState;
    worker.postMessage = jest.fn();
    return worker;
}

function createMockRegistration() {
    const registration = new EventTarget();
    registration.scope = "/mock-scope";
    registration.installing = null;
    registration.waiting = null;
    registration.update = jest.fn().mockResolvedValue(undefined);
    registration.unregister = jest.fn().mockResolvedValue(true);
    return registration;
}

function createMockServiceWorkerContainer(registration) {
    const serviceWorker = new EventTarget();
    serviceWorker.controller = { id: "controller" };
    serviceWorker.register = jest.fn().mockResolvedValue(registration);
    serviceWorker.ready = Promise.resolve(registration);
    return serviceWorker;
}

describe("pwa service", () => {
    afterEach(() => {
        SynactJS.pwa.destroy();
        resetDOM();
    });

    it("registers service worker and tracks update availability", async () => {
        const registration = createMockRegistration();
        const serviceWorker = createMockServiceWorkerContainer(registration);
        const mockNavigator = { serviceWorker };

        SynactJS.pwa.init({ windowRef: window, navigatorRef: mockNavigator });
        const registered = await SynactJS.pwa.register({ swUrl: "/sw.js", scope: "/" });

        expect(registered).toBe(registration);
        expect(serviceWorker.register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
        expect(SynactJS.pwa.getStatus().registered).toBe(true);

        const worker = createMockWorker("installing");
        registration.installing = worker;
        registration.dispatchEvent(new Event("updatefound"));

        worker.state = "installed";
        registration.waiting = worker;
        worker.dispatchEvent(new Event("statechange"));

        const status = SynactJS.pwa.getStatus();
        expect(status.updateAvailable).toBe(true);
        expect(status.waiting).toBe(true);

        const activated = await SynactJS.pwa.activateUpdate();
        expect(activated).toBe(true);
        expect(worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    });

    it("tracks install prompt state and handles prompt result", async () => {
        SynactJS.pwa.init({ windowRef: window, navigatorRef: {} });

        const installPromptEvent = new Event("beforeinstallprompt");
        installPromptEvent.prompt = jest.fn().mockResolvedValue(undefined);
        installPromptEvent.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });

        window.dispatchEvent(installPromptEvent);
        expect(SynactJS.pwa.getInstallState().canPrompt).toBe(true);

        const result = await SynactJS.pwa.promptInstall();
        expect(result.outcome).toBe("accepted");
        expect(installPromptEvent.prompt).toHaveBeenCalled();
        expect(SynactJS.pwa.getInstallState().canPrompt).toBe(false);
    });

    it("supports unregister and service destruction", async () => {
        const registration = createMockRegistration();
        const serviceWorker = createMockServiceWorkerContainer(registration);

        SynactJS.pwa.init({ windowRef: window, navigatorRef: { serviceWorker } });
        await SynactJS.pwa.register();

        const unregistered = await SynactJS.pwa.unregister();
        expect(unregistered).toBe(true);
        expect(registration.unregister).toHaveBeenCalled();
        expect(SynactJS.pwa.getStatus().registered).toBe(false);

        SynactJS.pwa.destroy();
        expect(SynactJS.pwa.service).toBeNull();
    });

    it("throws when registering without service worker support", async () => {
        const service = new PWAService({ windowRef: window, navigatorRef: {} });

        SynactJS.configure({ logErrors: false });
        await expect(service.register()).rejects.toThrow();
        SynactJS.configure({ logErrors: true });

        service.destroy();
    });
});
