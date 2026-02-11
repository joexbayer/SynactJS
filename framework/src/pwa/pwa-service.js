import { fail } from "../errors.js";

function createStatusSnapshot(status) {
    return {
        supported: Boolean(status.supported),
        registered: Boolean(status.registered),
        installing: Boolean(status.installing),
        waiting: Boolean(status.waiting),
        updateAvailable: Boolean(status.updateAvailable),
        active: Boolean(status.active),
        installPromptAvailable: Boolean(status.installPromptAvailable),
        installed: Boolean(status.installed),
        scope: status.scope || null,
        lastError: status.lastError || null
    };
}

function isStandaloneDisplayMode(windowRef) {
    if (!windowRef || typeof windowRef.matchMedia !== "function") {
        return false;
    }

    try {
        return Boolean(windowRef.matchMedia("(display-mode: standalone)").matches);
    } catch (_) {
        return false;
    }
}

export class PWAService {
    constructor({
        windowRef = typeof window !== "undefined" ? window : null,
        navigatorRef = typeof navigator !== "undefined" ? navigator : null,
        autoInit = true
    } = {}) {
        this.windowRef = windowRef;
        this.navigatorRef = navigatorRef;
        this.events = new Map();

        this.initialized = false;
        this.registration = null;
        this.deferredInstallPrompt = null;

        this.windowCleanup = [];
        this.registrationCleanup = [];

        this.boundBeforeInstallPrompt = (event) => this.onBeforeInstallPrompt(event);
        this.boundAppInstalled = () => this.onAppInstalled();

        this.status = createStatusSnapshot({
            supported: Boolean(this.navigatorRef?.serviceWorker),
            registered: false,
            installing: false,
            waiting: false,
            updateAvailable: false,
            active: false,
            installPromptAvailable: false,
            installed: isStandaloneDisplayMode(this.windowRef),
            scope: null,
            lastError: null
        });

        if (autoInit) {
            this.initialize();
        }
    }

    initialize() {
        if (this.initialized) {
            return this;
        }

        this.initialized = true;

        if (this.windowRef && typeof this.windowRef.addEventListener === "function") {
            this.windowRef.addEventListener("beforeinstallprompt", this.boundBeforeInstallPrompt);
            this.windowRef.addEventListener("appinstalled", this.boundAppInstalled);

            this.windowCleanup.push(() => this.windowRef.removeEventListener("beforeinstallprompt", this.boundBeforeInstallPrompt));
            this.windowCleanup.push(() => this.windowRef.removeEventListener("appinstalled", this.boundAppInstalled));
        }

        return this;
    }

    onBeforeInstallPrompt(event) {
        if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
        }

        this.deferredInstallPrompt = event;
        this.patchStatus({ installPromptAvailable: true });
        this.emit("installPromptAvailable", { event });
    }

    onAppInstalled() {
        this.deferredInstallPrompt = null;
        this.patchStatus({ installed: true, installPromptAvailable: false });
        this.emit("appInstalled", { installed: true });
    }

    patchStatus(patch) {
        const prevStatus = this.getStatus();
        this.status = createStatusSnapshot({
            ...this.status,
            ...patch
        });

        this.emit("statusChange", {
            current: this.getStatus(),
            previous: prevStatus
        });
    }

    setError(error, context) {
        this.patchStatus({
            lastError: {
                message: error?.message || String(error),
                context
            }
        });
        this.emit("error", { error, context });
    }

    on(eventName, handler) {
        if (typeof handler !== "function") {
            fail("S016", "PWAService.on() expects a callback function.", {
                context: "pwa.events.on",
                eventName
            });
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }

        const handlers = this.events.get(eventName);
        handlers.add(handler);

        return () => {
            handlers.delete(handler);
        };
    }

    emit(eventName, payload) {
        const handlers = this.events.get(eventName);
        if (!handlers || handlers.size === 0) {
            return;
        }

        for (const handler of handlers) {
            try {
                handler(payload);
            } catch (error) {
                this.setError(error, "pwa.events.emit");
            }
        }
    }

    cleanupRegistrationListeners() {
        for (const cleanup of this.registrationCleanup) {
            cleanup();
        }
        this.registrationCleanup = [];
    }

    bindRegistration(registration) {
        this.cleanupRegistrationListeners();

        if (!registration) {
            return;
        }

        const onUpdateFound = () => {
            const worker = registration.installing;
            this.patchStatus({ installing: Boolean(worker) });
            this.emit("updateFound", { registration, worker });

            if (!worker || typeof worker.addEventListener !== "function") {
                return;
            }

            const onStateChange = () => {
                const state = worker.state;

                if (state === "installed") {
                    const hasController = Boolean(this.navigatorRef?.serviceWorker?.controller);
                    const waiting = Boolean(registration.waiting) || hasController;
                    this.patchStatus({
                        installing: false,
                        waiting,
                        updateAvailable: waiting,
                        active: !waiting
                    });

                    if (waiting) {
                        this.emit("updateAvailable", { registration, worker });
                    } else {
                        this.emit("installed", { registration, worker });
                    }
                    return;
                }

                if (state === "activated") {
                    this.patchStatus({
                        installing: false,
                        waiting: false,
                        updateAvailable: false,
                        active: true
                    });
                    this.emit("activated", { registration, worker });
                    return;
                }

                if (state === "redundant") {
                    this.patchStatus({ installing: false });
                    this.emit("redundant", { registration, worker });
                }
            };

            worker.addEventListener("statechange", onStateChange);
            this.registrationCleanup.push(() => worker.removeEventListener("statechange", onStateChange));
        };

        if (typeof registration.addEventListener === "function") {
            registration.addEventListener("updatefound", onUpdateFound);
            this.registrationCleanup.push(() => registration.removeEventListener("updatefound", onUpdateFound));
        }

        if (registration.installing) {
            onUpdateFound();
        }

        if (registration.waiting) {
            this.patchStatus({ waiting: true, updateAvailable: true });
            this.emit("updateAvailable", { registration, worker: registration.waiting });
        }

        const serviceWorkerContainer = this.navigatorRef?.serviceWorker;
        if (serviceWorkerContainer && typeof serviceWorkerContainer.addEventListener === "function") {
            const onControllerChange = () => {
                this.patchStatus({ active: true, waiting: false, updateAvailable: false });
                this.emit("controllerChange", { registration: this.registration });
            };

            serviceWorkerContainer.addEventListener("controllerchange", onControllerChange);
            this.registrationCleanup.push(() => serviceWorkerContainer.removeEventListener("controllerchange", onControllerChange));
        }
    }

    async register({ swUrl = "/sw.js", scope = "/" } = {}) {
        this.initialize();

        const serviceWorkerContainer = this.navigatorRef?.serviceWorker;
        if (!serviceWorkerContainer || typeof serviceWorkerContainer.register !== "function") {
            fail("S013", "Service Worker API is not available in this environment.", {
                context: "pwa.register"
            });
        }

        let registration;
        try {
            registration = await serviceWorkerContainer.register(swUrl, { scope });
        } catch (error) {
            fail("S013", "Service worker registration failed.", {
                context: "pwa.register",
                swUrl,
                scope
            }, error);
        }

        this.registration = registration;
        this.patchStatus({
            supported: true,
            registered: true,
            scope: registration.scope || scope,
            lastError: null
        });

        this.bindRegistration(registration);

        if (serviceWorkerContainer.ready && typeof serviceWorkerContainer.ready.then === "function") {
            serviceWorkerContainer.ready
                .then(() => {
                    this.patchStatus({ active: true });
                    this.emit("ready", { registration: this.registration });
                })
                .catch((error) => {
                    this.setError(error, "pwa.ready");
                });
        }

        this.emit("registered", { registration });
        return registration;
    }

    async unregister() {
        if (!this.registration) {
            return false;
        }

        let result = true;
        if (typeof this.registration.unregister === "function") {
            try {
                result = await this.registration.unregister();
            } catch (error) {
                fail("S013", "Service worker unregister failed.", {
                    context: "pwa.unregister"
                }, error);
            }
        }

        this.cleanupRegistrationListeners();
        this.registration = null;
        this.patchStatus({
            registered: false,
            installing: false,
            waiting: false,
            updateAvailable: false,
            active: false,
            scope: null
        });

        this.emit("unregistered", { result });
        return result;
    }

    async checkForUpdate() {
        if (!this.registration || typeof this.registration.update !== "function") {
            return false;
        }

        try {
            await this.registration.update();
        } catch (error) {
            this.setError(error, "pwa.checkForUpdate");
            throw error;
        }

        if (this.registration.waiting) {
            this.patchStatus({ waiting: true, updateAvailable: true });
            this.emit("updateAvailable", { registration: this.registration, worker: this.registration.waiting });
            return true;
        }

        return this.status.updateAvailable;
    }

    async activateWaitingWorker() {
        if (!this.registration || !this.registration.waiting) {
            return false;
        }

        if (typeof this.registration.waiting.postMessage !== "function") {
            fail("S013", "Waiting service worker does not support postMessage().", {
                context: "pwa.activateWaitingWorker"
            });
        }

        this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        this.emit("updateActivationRequested", { registration: this.registration, worker: this.registration.waiting });
        return true;
    }

    async promptInstall() {
        const promptEvent = this.deferredInstallPrompt;
        if (!promptEvent) {
            return { outcome: "unavailable" };
        }

        if (typeof promptEvent.prompt !== "function") {
            fail("S013", "Install prompt event is not promptable.", {
                context: "pwa.promptInstall"
            });
        }

        await promptEvent.prompt();
        const userChoice = promptEvent.userChoice ? await promptEvent.userChoice : { outcome: "accepted" };

        if (userChoice?.outcome === "accepted") {
            this.patchStatus({ installPromptAvailable: false });
            this.deferredInstallPrompt = null;
        }

        this.emit("installPromptResult", { choice: userChoice });
        return userChoice;
    }

    getStatus() {
        return createStatusSnapshot(this.status);
    }

    getInstallState() {
        return {
            canPrompt: Boolean(this.status.installPromptAvailable && this.deferredInstallPrompt),
            installed: Boolean(this.status.installed)
        };
    }

    destroy() {
        this.cleanupRegistrationListeners();

        for (const cleanup of this.windowCleanup) {
            cleanup();
        }

        this.windowCleanup = [];
        this.events.clear();
        this.registration = null;
        this.deferredInstallPrompt = null;
        this.initialized = false;

        this.patchStatus({
            registered: false,
            installing: false,
            waiting: false,
            updateAvailable: false,
            active: false,
            installPromptAvailable: false
        });
    }
}
