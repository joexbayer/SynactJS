const {
    createSyncClient,
    createSnapshotCrypto,
    SynactJS
} = require("../synact.js");
const { webcrypto } = require("node:crypto");
const { TextEncoder, TextDecoder } = require("node:util");

function createResponse(body, status = 200, statusText = "OK", contentType = "application/json") {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        headers: {
            get(name) {
                if (String(name).toLowerCase() === "content-type") {
                    return contentType;
                }
                return null;
            }
        },
        json: jest.fn().mockResolvedValue(body),
        text: jest.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body))
    };
}

describe("sync helpers", () => {
    beforeAll(() => {
        if (!global.crypto) {
            global.crypto = webcrypto;
        }
        if (!global.TextEncoder) {
            global.TextEncoder = TextEncoder;
        }
        if (!global.TextDecoder) {
            global.TextDecoder = TextDecoder;
        }
    });

    afterEach(() => {
        SynactJS.sync.destroy();
        SynactJS.configure({ logErrors: true });
        localStorage.clear();
    });

    it("encrypts and decrypts snapshot payloads", async () => {
        const crypto = createSnapshotCrypto({ kdfIterations: 1000, cryptoImpl: webcrypto });
        const snapshot = {
            format: "synact.snapshot.v1",
            collections: {
                tasks: [{ id: "a", payload: { done: false } }]
            }
        };

        const envelope = await crypto.encryptObject(snapshot, {
            passphrase: "device-passphrase-123",
            aad: "app-sync-test"
        });

        const restored = await crypto.decryptObject(envelope, {
            passphrase: "device-passphrase-123",
            aad: "app-sync-test"
        });

        expect(restored).toEqual(snapshot);
    });

    it("sync client can login and push/pull encrypted snapshots", async () => {
        const serverState = {
            encryptedSnapshot: null
        };

        const fetchImpl = jest.fn(async (url, init = {}) => {
            const parsed = new URL(url);
            const body = init.body ? JSON.parse(init.body) : null;

            if (parsed.pathname === "/v1/auth/login") {
                return createResponse({
                    user: { id: 1, email: "test@example.com" },
                    accessToken: "token-one",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "PUT") {
                expect(init.headers.Authorization).toBe("Bearer token-one");
                expect(body.appId).toBe("sync-test-app");
                expect(body.encryptedSnapshot).toBeTruthy();
                expect(typeof body.encryptedSnapshot.ciphertext).toBe("string");
                serverState.encryptedSnapshot = body.encryptedSnapshot;
                return createResponse({ ok: true });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "GET") {
                return createResponse({
                    appId: "sync-test-app",
                    encryptedSnapshot: serverState.encryptedSnapshot,
                    metadata: { source: "test" },
                    updatedAt: new Date().toISOString()
                });
            }

            return createResponse({ message: "not found" }, 404, "Not Found");
        });

        const client = createSyncClient({
            baseUrl: "https://sync.test",
            appId: "sync-test-app",
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto }
        });

        await client.login({
            email: "test@example.com",
            password: "super-safe-password"
        });

        client.setPassphrase("device-passphrase-123");

        const snapshot = {
            format: "synact.snapshot.v1",
            schemaVersion: 1,
            collections: {
                notes: [{ id: "n1", payload: { body: "hello" } }]
            }
        };

        await client.pushSnapshot(snapshot, {
            metadata: { source: "jest" }
        });

        const pulled = await client.pullSnapshot();
        expect(pulled.snapshot).toEqual(snapshot);
        expect(pulled.meta.appId).toBe("sync-test-app");
    });

    it("sync session helper restores auth and syncs through SynactJS.data", async () => {
        const storageKey = "jest-sync-session";
        const snapshot = {
            format: "synact.snapshot.v1",
            appId: "sync-session-app",
            schemaVersion: 1,
            collections: {
                tasks: [{ id: "t1", payload: { title: "One" } }]
            }
        };

        const fakeDataApi = {
            manager: {},
            export: jest.fn().mockResolvedValue(snapshot),
            import: jest.fn().mockResolvedValue({
                summary: { incoming: 1, created: 1, updated: 0, skipped: 0, deleted: 0 }
            })
        };

        let pushedEnvelope = null;
        const fetchImpl = jest.fn(async (url, init = {}) => {
            const parsed = new URL(url);
            const body = init.body ? JSON.parse(init.body) : {};

            if (parsed.pathname === "/v1/auth/login") {
                return createResponse({
                    user: { id: 7, email: "session@example.com" },
                    accessToken: "session-token-1",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/auth/refresh") {
                return createResponse({
                    accessToken: "session-token-2",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "PUT") {
                expect(init.headers.Authorization).toBeTruthy();
                pushedEnvelope = body.encryptedSnapshot;
                return createResponse({ ok: true });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "GET") {
                return createResponse({
                    appId: "sync-session-app",
                    encryptedSnapshot: pushedEnvelope,
                    metadata: { source: "session-test" },
                    updatedAt: new Date().toISOString()
                });
            }

            if (parsed.pathname === "/v1/auth/logout") {
                return createResponse({ ok: true });
            }

            return createResponse({ message: "not found" }, 404, "Not Found");
        });

        const session = SynactJS.sync.createSession({
            baseUrl: "https://sync.session.test",
            appId: "sync-session-app",
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto },
            dataApi: fakeDataApi,
            storage: localStorage,
            storageKey
        });

        await session.login(
            { email: "session@example.com", password: "super-safe-password" },
            { passphrase: "device-passphrase", remember: true }
        );

        expect(session.getState().authenticated).toBe(true);
        await session.pushDataSnapshot();
        await session.pullDataSnapshot();
        expect(fakeDataApi.export).toHaveBeenCalledTimes(1);
        expect(fakeDataApi.import).toHaveBeenCalledTimes(1);

        const restored = SynactJS.sync.createSession({
            baseUrl: "https://sync.session.test",
            appId: "sync-session-app",
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto },
            dataApi: fakeDataApi,
            storage: localStorage,
            storageKey
        });

        const restoreResult = await restored.restoreAuth({ refresh: true, silent: true });
        expect(restoreResult.restored).toBe(true);
        expect(restored.getState().authenticated).toBe(true);
    });

    it("sync app service handles config, auth, and sync with minimal app code", async () => {
        const configStorageKey = "jest-sync-app-config";
        const sessionStorageKey = "jest-sync-app-session";
        const snapshot = {
            format: "synact.snapshot.v1",
            appId: "sync-app-service",
            schemaVersion: 1,
            collections: {
                items: [{ id: "i1", payload: { label: "Item" } }]
            }
        };

        const fakeDataApi = {
            manager: {},
            export: jest.fn().mockResolvedValue(snapshot),
            import: jest.fn().mockResolvedValue({
                summary: { incoming: 1, created: 1, updated: 0, skipped: 0, deleted: 0 }
            })
        };

        let pushedEnvelope = null;
        const fetchImpl = jest.fn(async (url, init = {}) => {
            const parsed = new URL(url);
            const body = init.body ? JSON.parse(init.body) : {};

            if (parsed.pathname === "/v1/auth/login") {
                return createResponse({
                    user: { id: 9, email: "kit@example.com" },
                    accessToken: "kit-token-1",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/auth/refresh") {
                return createResponse({
                    accessToken: "kit-token-2",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "PUT") {
                pushedEnvelope = body.encryptedSnapshot;
                return createResponse({ ok: true });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "GET") {
                return createResponse({
                    appId: "sync-app-service",
                    encryptedSnapshot: pushedEnvelope,
                    metadata: { source: "sync-app-service-test" },
                    updatedAt: new Date().toISOString()
                });
            }

            return createResponse({ message: "not found" }, 404, "Not Found");
        });

        const appService = SynactJS.sync.createAppService({
            dataApi: fakeDataApi,
            storage: localStorage,
            configStorageKey,
            sessionStorageKey,
            defaults: {
                baseUrl: "https://sync.app.test",
                appId: "sync-app-service",
                rememberAuth: true
            },
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto }
        });

        await appService.bootstrap({ restoreAuth: false });
        await appService.authenticate("login", {
            email: "kit@example.com",
            password: "super-safe-password",
            passphrase: "kit-passphrase",
            autoPull: false
        });

        await appService.pushData();
        await appService.pullData();

        expect(fakeDataApi.export).toHaveBeenCalledTimes(1);
        expect(fakeDataApi.import).toHaveBeenCalledTimes(1);
        expect(appService.getState().authenticated).toBe(true);

        const restoredService = SynactJS.sync.createAppService({
            dataApi: fakeDataApi,
            storage: localStorage,
            configStorageKey,
            sessionStorageKey,
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto }
        });

        const boot = await restoredService.bootstrap({
            restoreAuth: true,
            refresh: true,
            silent: true
        });

        expect(boot.auth.restored).toBe(true);
        expect(restoredService.getState().authenticated).toBe(true);
    });

    it("sync feature service handles settings persistence + sync actions with thin app handlers", async () => {
        const settingsStore = {
            syncServerUrl: "https://sync.feature.test",
            syncAppId: "sync-feature-service",
            syncEmail: "",
            syncRememberAuth: true
        };

        const readSettings = jest.fn(async () => ({
            ...settingsStore
        }));

        const writeSettings = jest.fn(async (patch = {}) => {
            Object.assign(settingsStore, patch);
            return {
                ...settingsStore
            };
        });

        const snapshot = {
            format: "synact.snapshot.v1",
            appId: "sync-feature-service",
            schemaVersion: 1,
            collections: {
                items: [{ id: "f1", payload: { label: "Feature Item" } }]
            }
        };

        const fakeDataApi = {
            manager: {},
            export: jest.fn().mockResolvedValue(snapshot),
            import: jest.fn().mockResolvedValue({
                summary: { incoming: 1, created: 1, updated: 0, skipped: 0, deleted: 0 }
            })
        };

        let pushedEnvelope = null;
        const fetchImpl = jest.fn(async (url, init = {}) => {
            const parsed = new URL(url);
            const body = init.body ? JSON.parse(init.body) : {};

            if (parsed.pathname === "/v1/auth/login") {
                return createResponse({
                    user: { id: 15, email: "feature@example.com" },
                    accessToken: "feature-token-1",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "PUT") {
                pushedEnvelope = body.encryptedSnapshot;
                return createResponse({ ok: true });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "GET") {
                return createResponse({
                    appId: "sync-feature-service",
                    encryptedSnapshot: pushedEnvelope,
                    metadata: { source: "sync-feature-service-test" },
                    updatedAt: new Date().toISOString()
                });
            }

            return createResponse({ message: "not found" }, 404, "Not Found");
        });

        let afterPullCount = 0;
        const featureService = SynactJS.sync.createFeatureService({
            dataApi: fakeDataApi,
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto },
            readSettings,
            writeSettings,
            afterPull: () => {
                afterPullCount += 1;
            }
        });

        await featureService.bootstrap({ restoreAuth: false });
        await featureService.saveConfig({
            syncServerUrl: "https://sync.feature.test",
            syncAppId: "sync-feature-service",
            syncEmail: "feature@example.com",
            syncRememberAuth: true
        });

        const auth = await featureService.authenticate("login", {
            email: "feature@example.com",
            password: "super-safe-password",
            passphrase: "feature-passphrase",
            autoPull: false
        });

        expect(auth.sync.authenticated).toBe(true);

        await featureService.pushData();
        await featureService.pullData();
        await featureService.sync({ direction: "both" });

        expect(readSettings).toHaveBeenCalled();
        expect(writeSettings).toHaveBeenCalled();
        expect(fakeDataApi.export).toHaveBeenCalledTimes(2);
        expect(fakeDataApi.import).toHaveBeenCalledTimes(2);
        expect(afterPullCount).toBe(2);
        expect(featureService.getState().sync.authenticated).toBe(true);
    });

    it("sync feature service supports configurable auto sync", async () => {
        const settingsStore = {
            syncServerUrl: "https://sync.auto.test",
            syncAppId: "sync-auto-service",
            syncEmail: "",
            syncRememberAuth: true,
            syncAutoEnabled: true,
            syncAutoIntervalMinutes: 30,
            syncAutoDirection: "both"
        };

        const readSettings = jest.fn(async () => ({
            ...settingsStore
        }));

        const writeSettings = jest.fn(async (patch = {}) => {
            Object.assign(settingsStore, patch);
            return {
                ...settingsStore
            };
        });

        const snapshot = {
            format: "synact.snapshot.v1",
            appId: "sync-auto-service",
            schemaVersion: 1,
            collections: {
                items: [{ id: "a1", payload: { label: "Auto Item" } }]
            }
        };

        const fakeDataApi = {
            manager: {},
            export: jest.fn().mockResolvedValue(snapshot),
            import: jest.fn().mockResolvedValue({
                summary: { incoming: 1, created: 1, updated: 0, skipped: 0, deleted: 0 }
            })
        };

        let pushedEnvelope = null;
        const fetchImpl = jest.fn(async (url, init = {}) => {
            const parsed = new URL(url);
            const body = init.body ? JSON.parse(init.body) : {};

            if (parsed.pathname === "/v1/auth/login") {
                return createResponse({
                    user: { id: 21, email: "auto@example.com" },
                    accessToken: "auto-token-1",
                    expiresIn: 900
                });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "PUT") {
                pushedEnvelope = body.encryptedSnapshot;
                return createResponse({ ok: true });
            }

            if (parsed.pathname === "/v1/sync/blob" && init.method === "GET") {
                return createResponse({
                    appId: "sync-auto-service",
                    encryptedSnapshot: pushedEnvelope,
                    metadata: { source: "sync-auto-service-test" },
                    updatedAt: new Date().toISOString()
                });
            }

            return createResponse({ message: "not found" }, 404, "Not Found");
        });

        const featureService = SynactJS.sync.createFeatureService({
            dataApi: fakeDataApi,
            fetchImpl,
            crypto: { kdfIterations: 1000, cryptoImpl: webcrypto },
            readSettings,
            writeSettings
        });

        await featureService.bootstrap({ restoreAuth: false });
        await featureService.authenticate("login", {
            email: "auto@example.com",
            password: "super-safe-password",
            passphrase: "auto-passphrase",
            autoPull: false
        });

        const onTick = jest.fn();
        const started = await featureService.startAutoSync({
            immediate: true,
            throwOnImmediateError: true,
            onTick
        });

        expect(started.started).toBe(true);
        expect(featureService.getAutoSyncState().active).toBe(true);
        expect(fakeDataApi.export).toHaveBeenCalledTimes(1);
        expect(fakeDataApi.import).toHaveBeenCalledTimes(0);
        expect(onTick).toHaveBeenCalledTimes(1);

        featureService.stopAutoSync();
        expect(featureService.getAutoSyncState().active).toBe(false);
    });
});
