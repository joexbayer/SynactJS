import SynactJSCore from "./core.js";
import { runtime, cleanupHookCollection } from "./state.js";
import { configureRuntime, getRuntimeConfig, fail } from "./errors.js";
import { browserHelpers } from "./browser.js";
import { createPWAService, PWAService } from "./pwa/index.js";
import {
    createDataStore,
    createImportExportManager,
    createStorageEngine,
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
} from "./data/index.js";
import {
    createSyncAppService,
    createSyncClient,
    createSyncFeatureService,
    createSyncSession,
    createSnapshotCrypto,
    SyncAppService,
    SyncSession,
    SyncFeatureService,
    SyncClient,
    SnapshotCrypto
} from "./sync/index.js";

const pwaApi = {
    currentService: null,

    init(options = {}) {
        if (this.currentService) {
            this.currentService.destroy();
        }

        this.currentService = createPWAService(options);
        return this.currentService;
    },

    ensureService(context) {
        if (!this.currentService) {
            this.currentService = createPWAService();
        }

        if (!this.currentService) {
            fail("S013", "Unable to create PWAService instance.", { context });
        }

        return this.currentService;
    },

    get service() {
        return this.currentService;
    },

    on(eventName, handler) {
        return this.ensureService("pwa.api.on").on(eventName, handler);
    },

    async register(options = {}) {
        return this.ensureService("pwa.api.register").register(options);
    },

    async unregister() {
        if (!this.currentService) {
            return false;
        }
        return this.currentService.unregister();
    },

    async checkForUpdate() {
        return this.ensureService("pwa.api.checkForUpdate").checkForUpdate();
    },

    async activateUpdate() {
        return this.ensureService("pwa.api.activateUpdate").activateWaitingWorker();
    },

    async promptInstall() {
        return this.ensureService("pwa.api.promptInstall").promptInstall();
    },

    getStatus() {
        return this.ensureService("pwa.api.getStatus").getStatus();
    },

    getInstallState() {
        return this.ensureService("pwa.api.getInstallState").getInstallState();
    },

    destroy() {
        if (!this.currentService) {
            return;
        }
        this.currentService.destroy();
        this.currentService = null;
    },

    createService: createPWAService,
    PWAService
};

const dataApi = {
    currentStore: null,
    currentManager: null,

    async init(config = {}) {
        const store = await createDataStore(config);
        this.currentStore = store;
        this.currentManager = createImportExportManager({ store });
        return store;
    },

    async close() {
        if (!this.currentStore) {
            this.currentManager = null;
            return;
        }

        await this.currentStore.close();
        this.currentStore = null;
        this.currentManager = null;
    },

    get store() {
        return this.currentStore;
    },

    get manager() {
        return this.currentManager;
    },

    ensureStore(context) {
        if (!this.currentStore) {
            fail("S016", "SynactJS.data is not initialized. Call SynactJS.data.init(...) first.", { context });
        }

        return this.currentStore;
    },

    ensureManager(context) {
        if (!this.currentStore || !this.currentManager) {
            fail("S016", "SynactJS.data is not initialized. Call SynactJS.data.init(...) first.", { context });
        }

        return this.currentManager;
    },

    async export(options = {}) {
        const manager = this.ensureManager("data.api.export");
        return manager.exportSnapshot(options);
    },

    validateSnapshot(snapshot, options = {}) {
        const manager = this.ensureManager("data.api.validateSnapshot");
        return manager.validateSnapshot(snapshot, options);
    },

    async import(snapshot, options = {}) {
        const manager = this.ensureManager("data.api.import");
        return manager.importSnapshot(snapshot, options);
    },

    async write(collection, id, payload, options = {}) {
        const store = this.ensureStore("data.api.write");
        return store.write(collection, id, payload, options);
    },

    async read(collection, id) {
        const store = this.ensureStore("data.api.read");
        return store.read(collection, id);
    },

    async update(collection, id, patch) {
        const store = this.ensureStore("data.api.update");
        return store.update(collection, id, patch);
    },

    async delete(collection, id) {
        const store = this.ensureStore("data.api.delete");
        return store.delete(collection, id);
    },

    async query(collection, options = {}) {
        const store = this.ensureStore("data.api.query");
        return store.query(collection, options);
    },

    async listRecords(collection = null) {
        const store = this.ensureStore("data.api.listRecords");
        return store.listRecords(collection);
    },

    async listCollections() {
        const store = this.ensureStore("data.api.listCollections");
        return store.listCollections();
    },

    async clearCollection(collection) {
        const store = this.ensureStore("data.api.clearCollection");
        return store.clearCollection(collection);
    },

    async clearAllRecords() {
        const store = this.ensureStore("data.api.clearAllRecords");
        return store.clearAllRecords();
    },

    async fileToDataUrl(file) {
        if (!file || typeof file !== "object") {
            fail("S016", "fileToDataUrl expects a File or Blob value.", {
                context: "data.api.fileToDataUrl"
            });
        }

        if (typeof FileReader === "undefined") {
            fail("S013", "FileReader API is not available in this environment.", {
                context: "data.api.fileToDataUrl"
            });
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(reader.error || new Error("Failed to read file as data URL."));
            reader.readAsDataURL(file);
        });
    },

    async writeImage(collection, id, imageInput, options = {}) {
        let dataUrl = null;
        let mimeType = options.mimeType || null;
        let sizeBytes = options.sizeBytes || null;
        let fileName = options.name || null;

        if (typeof imageInput === "string") {
            dataUrl = imageInput;
        } else if (imageInput && typeof imageInput === "object") {
            dataUrl = await this.fileToDataUrl(imageInput);
            mimeType = mimeType || imageInput.type || null;
            sizeBytes = sizeBytes ?? imageInput.size ?? null;
            fileName = fileName || imageInput.name || null;
        }

        if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
            fail("S016", "writeImage requires a valid data URL string or File/Blob.", {
                context: "data.api.writeImage"
            });
        }

        const payload = {
            __synactType: "image",
            dataUrl,
            mimeType,
            sizeBytes,
            name: fileName,
            alt: options.alt || null,
            updatedAt: new Date().toISOString(),
            meta: options.meta && typeof options.meta === "object" ? options.meta : null
        };

        return this.write(collection, id, payload, options.writeOptions || {});
    },

    async readImage(collection, id) {
        const payload = await this.read(collection, id);
        if (!payload || typeof payload !== "object") {
            return null;
        }

        if (payload.__synactType !== "image" || typeof payload.dataUrl !== "string") {
            return null;
        }

        return payload;
    },

    createStore: createDataStore,
    createImportExportManager,
    createStorageEngine,
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
};

const syncApi = {
    currentClient: null,
    currentSession: null,
    currentAppService: null,
    currentFeatureService: null,

    init(config = {}) {
        this.currentClient = createSyncClient(config);
        if (this.currentSession && typeof this.currentSession.configure === "function") {
            this.currentSession.configure(config);
        }
        return this.currentClient;
    },

    destroy() {
        if (this.currentFeatureService && typeof this.currentFeatureService.stopAutoSync === "function") {
            this.currentFeatureService.stopAutoSync();
        }

        this.currentClient = null;
        this.currentSession = null;
        this.currentAppService = null;
        this.currentFeatureService = null;
    },

    get client() {
        return this.currentClient;
    },

    get session() {
        return this.currentSession;
    },

    get appService() {
        return this.currentAppService;
    },

    get featureService() {
        return this.currentFeatureService;
    },

    ensureClient(context) {
        if (!this.currentClient) {
            fail("S016", "SynactJS.sync is not initialized. Call SynactJS.sync.init(...) first.", { context });
        }
        return this.currentClient;
    },

    ensureSession(context) {
        if (!this.currentSession) {
            fail("S016", "SynactJS.sync session is not initialized. Call SynactJS.sync.initSession(...) first.", { context });
        }

        return this.currentSession;
    },

    createSession(config = {}) {
        const resolvedConfig = {
            ...config,
            dataApi: config?.dataApi || dataApi
        };

        if (!resolvedConfig.client && this.currentClient) {
            resolvedConfig.client = this.currentClient;
        }

        const session = createSyncSession(resolvedConfig);
        if (session?.client) {
            this.currentClient = session.client;
        }

        return session;
    },

    initSession(config = {}) {
        const session = this.createSession(config);
        this.currentSession = session;
        if (session?.client) {
            this.currentClient = session.client;
        }
        return session;
    },

    createAppService(config = {}) {
        const resolvedConfig = {
            ...config,
            dataApi: config?.dataApi || dataApi
        };

        if (!resolvedConfig.session && this.currentSession) {
            resolvedConfig.session = this.currentSession;
        }

        const service = createSyncAppService(resolvedConfig);
        if (service?.session) {
            this.currentSession = service.session;
        }
        if (service?.session?.client) {
            this.currentClient = service.session.client;
        }
        return service;
    },

    initAppService(config = {}) {
        const service = this.createAppService(config);
        this.currentAppService = service;
        return service;
    },

    createFeatureService(config = {}) {
        const resolvedConfig = {
            ...config,
            dataApi: config?.dataApi || dataApi
        };

        if (!resolvedConfig.appService && this.currentAppService) {
            resolvedConfig.appService = this.currentAppService;
        }

        if (!resolvedConfig.session && this.currentSession) {
            resolvedConfig.session = this.currentSession;
        }

        const service = createSyncFeatureService(resolvedConfig);
        if (service?.appService) {
            this.currentAppService = service.appService;
        }
        if (service?.appService?.session) {
            this.currentSession = service.appService.session;
        }
        if (service?.appService?.session?.client) {
            this.currentClient = service.appService.session.client;
        }

        return service;
    },

    initFeatureService(config = {}) {
        const service = this.createFeatureService(config);
        this.currentFeatureService = service;
        return service;
    },

    setPassphrase(passphrase) {
        return this.ensureClient("sync.api.setPassphrase").setPassphrase(passphrase);
    },

    clearPassphrase() {
        const client = this.ensureClient("sync.api.clearPassphrase");
        client.clearPassphrase();
    },

    setAccessToken(accessToken) {
        return this.ensureClient("sync.api.setAccessToken").setAccessToken(accessToken);
    },

    clearAccessToken() {
        const client = this.ensureClient("sync.api.clearAccessToken");
        client.clearAccessToken();
    },

    async register(credentials = {}) {
        return this.ensureClient("sync.api.register").register(credentials);
    },

    async login(credentials = {}) {
        return this.ensureClient("sync.api.login").login(credentials);
    },

    async refresh(options = {}) {
        return this.ensureClient("sync.api.refresh").refresh(options);
    },

    async logout() {
        return this.ensureClient("sync.api.logout").logout();
    },

    async restoreAuth(options = {}) {
        return this.ensureSession("sync.api.restoreAuth").restoreAuth(options);
    },

    async syncNow(options = {}) {
        return this.ensureSession("sync.api.syncNow").syncNow(options);
    },

    async pushSnapshot(snapshot, options = {}) {
        return this.ensureClient("sync.api.pushSnapshot").pushSnapshot(snapshot, options);
    },

    async pullSnapshot(options = {}) {
        return this.ensureClient("sync.api.pullSnapshot").pullSnapshot(options);
    },

    async pushDataSnapshot(options = {}) {
        if (!dataApi.manager) {
            fail("S016", "SynactJS.data must be initialized before pushDataSnapshot().", {
                context: "sync.api.pushDataSnapshot"
            });
        }

        const snapshot = await dataApi.export(options.exportOptions || {});
        const result = await this.pushSnapshot(snapshot, options);
        return { snapshot, result };
    },

    async pullDataSnapshot(options = {}) {
        if (!dataApi.manager) {
            fail("S016", "SynactJS.data must be initialized before pullDataSnapshot().", {
                context: "sync.api.pullDataSnapshot"
            });
        }

        const pulled = await this.pullSnapshot(options);
        if (!pulled?.snapshot) {
            return {
                snapshot: null,
                report: null,
                meta: pulled?.meta || null
            };
        }

        const report = await dataApi.import(pulled.snapshot, options.importOptions || {
            mode: "merge",
            onConflict: "newest"
        });

        return {
            snapshot: pulled.snapshot,
            report,
            meta: pulled.meta || null
        };
    },

    createClient: createSyncClient,
    createSyncSession,
    createSyncAppService,
    createSyncFeatureService,
    createSnapshotCrypto,
    SyncFeatureService,
    SyncAppService,
    SyncSession,
    SyncClient,
    SnapshotCrypto
};

function resolveRenderBlock(block, args = {}) {
    if (typeof block === "function") {
        return block(args);
    }
    return block ?? null;
}

export const SynactJS = {
    register(component) {
        if (typeof component !== "function") {
            fail("S002", "register() expects a component function.", { context: "public-api.register" });
        }

        const componentName = component.name;
        if (!componentName) {
            fail("S003", "register() requires a named function component so data-component can resolve it.", {
                context: "public-api.register"
            });
        }

        runtime.componentRegistry.set(componentName, component);
        this.components = Array.from(runtime.componentRegistry.values());
        SynactJSCore.mountComponents();
        return component;
    },

    render(componentOrVNode, containerOrSelector, props = {}) {
        const container = SynactJSCore.resolveContainer(containerOrSelector);

        if (typeof componentOrVNode === "function") {
            return SynactJSCore.renderApp(() => SynactJSCore.h(componentOrVNode, props), container);
        }

        return SynactJSCore.renderApp(() => componentOrVNode, container);
    },

    mount(componentOrVNode, containerOrSelector, props = {}) {
        return this.render(componentOrVNode, containerOrSelector, props);
    },

    unmount(containerOrSelector) {
        const container = SynactJSCore.resolveContainer(containerOrSelector);
        delete container.__synactStartMounted;
        delete container.__synactStartDisposer;
        SynactJSCore.unmountContainer(container);
    },

    async start({
        app,
        container = "#app",
        props = {},
        waitForDom = true,
        once = true,
        data = null,
        pwa = null
    } = {}) {
        if (!app) {
            fail("S016", "SynactJS.start() requires an app component or vnode.", {
                context: "public-api.start"
            });
        }

        if (waitForDom && typeof document !== "undefined" && document.readyState === "loading") {
            await new Promise((resolve) => {
                document.addEventListener("DOMContentLoaded", resolve, { once: true });
            });
        }

        if (data) {
            await this.data.init(data);
        }

        if (pwa) {
            if (pwa.init !== false) {
                this.pwa.init(pwa.initOptions || {});
            }

            if (pwa.register === true) {
                await this.pwa.register(pwa.registerOptions || {});
            }
        }

        const resolvedContainer = SynactJSCore.resolveContainer(container);
        if (once && resolvedContainer.__synactStartMounted && typeof resolvedContainer.__synactStartDisposer === "function") {
            return resolvedContainer.__synactStartDisposer;
        }

        const disposer = this.render(app, resolvedContainer, props);
        if (once) {
            resolvedContainer.__synactStartMounted = true;
            resolvedContainer.__synactStartDisposer = disposer;
        }

        return disposer;
    },

    lazy(loader, options = {}) {
        if (typeof loader !== "function") {
            fail("S016", "SynactJS.lazy() expects a loader function.", {
                context: "public-api.lazy"
            });
        }

        const {
            fallback = null,
            errorFallback = null
        } = options;

        return function SynactLazyComponent(props = {}) {
            const [state, setState] = SynactJSCore.useState(() => ({
                component: null,
                error: null
            }));

            SynactJSCore.useEffect(() => {
                let cancelled = false;

                Promise.resolve()
                    .then(() => loader())
                    .then((loadedModule) => {
                        if (cancelled) return;
                        const resolvedComponent = loadedModule?.default || loadedModule;
                        if (typeof resolvedComponent !== "function") {
                            fail("S016", "lazy loader must resolve to a component function.", {
                                context: "public-api.lazy.load"
                            });
                        }

                        setState({
                            component: resolvedComponent,
                            error: null
                        });
                    })
                    .catch((error) => {
                        if (cancelled) return;
                        setState({
                            component: null,
                            error
                        });
                    });

                return () => {
                    cancelled = true;
                };
            }, []);

            if (state.error) {
                return resolveRenderBlock(errorFallback, { error: state.error, props });
            }

            if (!state.component) {
                return resolveRenderBlock(fallback, { props });
            }

            return SynactJSCore.h(state.component, props);
        };
    },

    skeleton(options = {}) {
        const {
            rows = 3,
            rowHeight = 12,
            gap = 10,
            borderRadius = 8,
            width = "100%"
        } = options;

        const safeRows = Math.max(1, Number(rows) || 1);
        const safeGap = Math.max(2, Number(gap) || 8);
        const safeHeight = Math.max(6, Number(rowHeight) || 12);
        const safeRadius = Math.max(0, Number(borderRadius) || 8);

        const lines = [];
        for (let index = 0; index < safeRows; index++) {
            const isLastLine = index === safeRows - 1;
            lines.push(
                SynactJSCore.div({
                    key: `skeleton-line-${index}`,
                    style: {
                        height: `${safeHeight}px`,
                        width: isLastLine && safeRows > 1 ? "72%" : width,
                        borderRadius: `${safeRadius}px`,
                        background: "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
                        backgroundSize: "220% 100%",
                        animation: "synact-shimmer 1.2s ease-in-out infinite"
                    }
                })
            );
        }

        return SynactJSCore.div(
            {
                style: {
                    display: "grid",
                    gap: `${safeGap}px`
                }
            },
            ...lines
        );
    },

    configure(config = {}) {
        return configureRuntime(config);
    },

    getConfig() {
        return getRuntimeConfig();
    },

    helpers: browserHelpers,
    pwa: pwaApi,
    data: dataApi,
    sync: syncApi,
    components: []
};

export function attachBrowserGlobals() {
    if (typeof window === "undefined") {
        return;
    }

    if (!document.getElementById("synact-skeleton-keyframes")) {
        const styleEl = document.createElement("style");
        styleEl.id = "synact-skeleton-keyframes";
        styleEl.textContent = "@keyframes synact-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
        document.head.appendChild(styleEl);
    }

    Object.assign(window, SynactJSCore, { SynactJS });
    window.SynactJS = SynactJS;

    document.addEventListener("DOMContentLoaded", () => {
        SynactJSCore.mountComponents();
    });

    window.addEventListener("beforeunload", () => {
        for (const container of runtime.mountedContainers) {
            cleanupHookCollection(container.__SynactJSCtx?.hooks);
        }

        for (const ctx of runtime.contextMap.values()) {
            cleanupHookCollection(ctx?.hooks);
        }

        runtime.contextMap.clear();
        runtime.mountedContainers.clear();
    });
}

export function attachCommonJSExports() {
    const cjsModule = typeof globalThis === "object" ? globalThis.module : undefined;
    if (cjsModule && cjsModule.exports) {
        cjsModule.exports = {
            ...SynactJSCore,
            SynactJS
        };
    }
}
