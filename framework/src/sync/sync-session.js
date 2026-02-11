import { fail } from "../errors.js";
import { createSyncClient, SyncClient } from "./sync-client.js";

function resolveStorage(preferredStorage = null) {
    if (preferredStorage && typeof preferredStorage.getItem === "function" && typeof preferredStorage.setItem === "function") {
        return preferredStorage;
    }

    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.localStorage || null;
    } catch (_) {
        return null;
    }
}

function safeParseJSON(rawValue) {
    if (typeof rawValue !== "string" || !rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch (_) {
        return null;
    }
}

function safeStringify(value) {
    try {
        return JSON.stringify(value);
    } catch (_) {
        return null;
    }
}

function normalizeClientConfig(options = {}) {
    const clientConfig = options.clientConfig && typeof options.clientConfig === "object"
        ? { ...options.clientConfig }
        : {};

    const baseUrl = options.baseUrl ?? clientConfig.baseUrl;
    const appId = options.appId ?? clientConfig.appId;

    if (!baseUrl || !appId) {
        return null;
    }

    return {
        ...clientConfig,
        ...("baseUrl" in options ? { baseUrl: options.baseUrl } : {}),
        ...("appId" in options ? { appId: options.appId } : {}),
        ...("credentials" in options ? { credentials: options.credentials } : {}),
        ...("headers" in options ? { headers: options.headers } : {}),
        ...("fetchImpl" in options ? { fetchImpl: options.fetchImpl } : {}),
        ...("crypto" in options ? { crypto: options.crypto } : {})
    };
}

export class SyncSession {
    constructor(options = {}) {
        this.storage = resolveStorage(options.storage);
        this.storageKey = String(options.storageKey || "synact.sync.session");
        this.persist = options.persist !== false;
        this.dataApi = options.dataApi || null;

        this.client = options.client || null;
        this.clientFactory = typeof options.createClient === "function" ? options.createClient : createSyncClient;

        this.state = {
            configured: Boolean(this.client),
            authenticated: false,
            user: null,
            passphraseSet: false,
            lastSyncAt: null,
            lastSyncDirection: null,
            lastError: null
        };

        if (this.client) {
            if (!(this.client instanceof SyncClient) && typeof this.client.request !== "function") {
                fail("S016", "SyncSession client must be a SyncClient-compatible instance.", {
                    context: "sync.session.constructor"
                });
            }
        }

        const nextClientConfig = normalizeClientConfig(options);
        if (!this.client && nextClientConfig) {
            this.configure(nextClientConfig);
        }
    }

    getState() {
        return {
            ...this.state
        };
    }

    setDataApi(dataApi) {
        this.dataApi = dataApi;
        return this;
    }

    ensureClient(context = "sync.session") {
        if (!this.client) {
            fail("S016", "SyncSession is not configured. Set baseUrl/appId first.", { context });
        }

        return this.client;
    }

    ensureDataApi(context = "sync.session") {
        if (!this.dataApi || typeof this.dataApi.export !== "function" || typeof this.dataApi.import !== "function") {
            fail("S016", "SyncSession requires SynactJS.data API (init + export/import methods).", { context });
        }

        return this.dataApi;
    }

    configure(config = {}) {
        const nextConfig = normalizeClientConfig(config) || normalizeClientConfig({
            ...config,
            clientConfig: config
        });

        if (!nextConfig) {
            fail("S016", "SyncSession.configure requires baseUrl and appId.", {
                context: "sync.session.configure"
            });
        }

        this.client = this.clientFactory(nextConfig);
        this.state.configured = true;
        this.state.lastError = null;
        return this.client;
    }

    setPassphrase(passphrase) {
        const client = this.ensureClient("sync.session.setPassphrase");
        client.setPassphrase(passphrase);
        this.state.passphraseSet = true;
        this.state.lastError = null;
        return passphrase;
    }

    clearPassphrase() {
        if (!this.client) {
            this.state.passphraseSet = false;
            return;
        }

        this.client.clearPassphrase();
        this.state.passphraseSet = false;
    }

    readPersistedAuth() {
        if (!this.persist || !this.storage) {
            return null;
        }

        return safeParseJSON(this.storage.getItem(this.storageKey));
    }

    persistAuth({ accessToken, user } = {}) {
        if (!this.persist || !this.storage) {
            return;
        }

        const raw = safeStringify({
            accessToken: accessToken || null,
            user: user || null,
            updatedAt: new Date().toISOString()
        });

        if (raw) {
            this.storage.setItem(this.storageKey, raw);
        }
    }

    clearPersistedAuth() {
        if (!this.storage) {
            return;
        }

        this.storage.removeItem(this.storageKey);
    }

    applyAuthPayload(payload = {}, { remember = this.persist, fallbackUser = null } = {}) {
        const client = this.ensureClient("sync.session.applyAuth");
        const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : null;

        if (!accessToken) {
            this.clearAuthState({ clearStorage: remember });
            return this.getState();
        }

        client.setAccessToken(accessToken);

        const nextUser = payload.user || fallbackUser || this.state.user || null;
        this.state.authenticated = true;
        this.state.user = nextUser;
        this.state.lastError = null;

        if (remember) {
            this.persistAuth({
                accessToken,
                user: nextUser
            });
        }

        return this.getState();
    }

    clearAuthState({ clearStorage = true } = {}) {
        if (this.client) {
            this.client.clearAccessToken();
        }

        this.state.authenticated = false;
        this.state.user = null;

        if (clearStorage) {
            this.clearPersistedAuth();
        }
    }

    async register(credentials = {}, options = {}) {
        const client = this.ensureClient("sync.session.register");
        const remember = options.remember !== false;

        const payload = await client.register(credentials);
        if (options.passphrase) {
            this.setPassphrase(options.passphrase);
        }

        this.applyAuthPayload(payload, {
            remember,
            fallbackUser: payload?.user || null
        });

        return payload;
    }

    async login(credentials = {}, options = {}) {
        const client = this.ensureClient("sync.session.login");
        const remember = options.remember !== false;

        const payload = await client.login(credentials);
        if (options.passphrase) {
            this.setPassphrase(options.passphrase);
        }

        this.applyAuthPayload(payload, {
            remember,
            fallbackUser: payload?.user || null
        });

        return payload;
    }

    async restoreAuth(options = {}) {
        const client = this.ensureClient("sync.session.restoreAuth");
        const {
            refresh = true,
            silent = true
        } = options;

        const persisted = this.readPersistedAuth();
        if (!persisted?.accessToken) {
            return {
                restored: false,
                refreshed: false,
                payload: null
            };
        }

        client.setAccessToken(persisted.accessToken);
        this.state.authenticated = true;
        this.state.user = persisted.user || null;

        if (!refresh) {
            return {
                restored: true,
                refreshed: false,
                payload: null
            };
        }

        try {
            const payload = await client.refresh({ silent });
            if (payload?.accessToken) {
                this.applyAuthPayload(payload, {
                    remember: true,
                    fallbackUser: persisted.user || null
                });
            }

            return {
                restored: true,
                refreshed: Boolean(payload?.accessToken),
                payload: payload || null
            };
        } catch (error) {
            this.clearAuthState({ clearStorage: true });
            if (!silent) {
                throw error;
            }

            this.state.lastError = error?.message || String(error);
            return {
                restored: false,
                refreshed: false,
                payload: null
            };
        }
    }

    async logout(options = {}) {
        const client = this.ensureClient("sync.session.logout");
        const clearStorage = options.clearStorage !== false;

        try {
            await client.logout();
        } finally {
            this.clearAuthState({ clearStorage });
        }

        return true;
    }

    markSync(direction) {
        this.state.lastSyncAt = new Date().toISOString();
        this.state.lastSyncDirection = direction;
        this.state.lastError = null;
    }

    async pushDataSnapshot(options = {}) {
        const client = this.ensureClient("sync.session.pushDataSnapshot");
        const dataApi = this.ensureDataApi("sync.session.pushDataSnapshot");

        const snapshot = await dataApi.export(options.exportOptions || {});
        const result = await client.pushSnapshot(snapshot, options);

        this.markSync("push");
        return {
            snapshot,
            result
        };
    }

    async pullDataSnapshot(options = {}) {
        const client = this.ensureClient("sync.session.pullDataSnapshot");
        const dataApi = this.ensureDataApi("sync.session.pullDataSnapshot");

        let pulled;
        try {
            pulled = await client.pullSnapshot(options);
        } catch (error) {
            if (Number(error?.details?.status) === 404) {
                return {
                    snapshot: null,
                    report: null,
                    meta: null
                };
            }

            this.state.lastError = error?.message || String(error);
            throw error;
        }

        if (!pulled?.snapshot) {
            return {
                snapshot: null,
                report: null,
                meta: pulled?.meta || null
            };
        }

        const report = await dataApi.import(
            pulled.snapshot,
            options.importOptions || {
                mode: "merge",
                onConflict: "newest"
            }
        );

        this.markSync("pull");

        return {
            snapshot: pulled.snapshot,
            report,
            meta: pulled.meta || null
        };
    }

    async syncNow(options = {}) {
        const direction = options.direction || "both";

        if (direction === "push") {
            return {
                push: await this.pushDataSnapshot(options.pushOptions || options)
            };
        }

        if (direction === "pull") {
            return {
                pull: await this.pullDataSnapshot(options.pullOptions || options)
            };
        }

        const pull = await this.pullDataSnapshot(options.pullOptions || options);
        const push = await this.pushDataSnapshot(options.pushOptions || options);

        this.markSync("both");

        return {
            pull,
            push
        };
    }
}

export function createSyncSession(config = {}) {
    return new SyncSession(config);
}
