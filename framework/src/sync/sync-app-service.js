import { fail } from "../errors.js";
import { createSyncSession, SyncSession } from "./sync-session.js";

const DEFAULT_IMPORT_OPTIONS = Object.freeze({
    mode: "merge",
    onConflict: "newest"
});

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

function normalizeConfigPatch(patch = {}) {
    const value = patch && typeof patch === "object" ? patch : {};

    return {
        baseUrl: "baseUrl" in value ? String(value.baseUrl || "").trim() : undefined,
        appId: "appId" in value ? String(value.appId || "").trim() : undefined,
        email: "email" in value ? String(value.email || "").trim().toLowerCase() : undefined,
        rememberAuth: "rememberAuth" in value ? Boolean(value.rememberAuth) : undefined
    };
}

function resolveConfig(baseConfig = {}, patch = {}) {
    const normalizedPatch = normalizeConfigPatch(patch);

    const nextConfig = {
        ...baseConfig,
        ...Object.fromEntries(
            Object.entries(normalizedPatch).filter(([, value]) => value !== undefined)
        )
    };

    nextConfig.baseUrl = String(nextConfig.baseUrl || "").trim();
    nextConfig.appId = String(nextConfig.appId || "").trim();
    nextConfig.email = String(nextConfig.email || "").trim().toLowerCase();
    nextConfig.rememberAuth = nextConfig.rememberAuth !== false;

    return nextConfig;
}

export class SyncAppService {
    constructor(options = {}) {
        this.storage = resolveStorage(options.storage);
        this.configStorageKey = String(options.configStorageKey || "synact.sync.config");
        this.sessionClientConfig = {
            ...(options.clientConfig && typeof options.clientConfig === "object" ? options.clientConfig : {}),
            ...("fetchImpl" in options ? { fetchImpl: options.fetchImpl } : {}),
            ...("crypto" in options ? { crypto: options.crypto } : {}),
            ...("credentials" in options ? { credentials: options.credentials } : {}),
            ...("headers" in options ? { headers: options.headers } : {})
        };

        this.defaultConfig = resolveConfig(
            {
                baseUrl: "",
                appId: "",
                email: "",
                rememberAuth: true
            },
            options.defaults || {}
        );

        this.config = { ...this.defaultConfig };

        const session = options.session || createSyncSession({
            dataApi: options.dataApi || null,
            storage: this.storage,
            storageKey: options.sessionStorageKey || "synact.sync.session",
            persist: this.config.rememberAuth,
            ...this.sessionClientConfig
        });

        if (!(session instanceof SyncSession) && typeof session?.configure !== "function") {
            fail("S016", "SyncAppService requires a SyncSession-compatible instance.", {
                context: "sync.appService.constructor"
            });
        }

        this.session = session;
        this.state = {
            lastError: null
        };
    }

    setDataApi(dataApi) {
        if (this.session && typeof this.session.setDataApi === "function") {
            this.session.setDataApi(dataApi);
        }
        return this;
    }

    readPersistedConfig() {
        if (!this.storage) {
            return null;
        }

        return safeParseJSON(this.storage.getItem(this.configStorageKey));
    }

    persistConfig() {
        if (!this.storage) {
            return;
        }

        const raw = safeStringify(this.config);
        if (raw) {
            this.storage.setItem(this.configStorageKey, raw);
        }
    }

    clearPersistedConfig() {
        if (!this.storage) {
            return;
        }

        this.storage.removeItem(this.configStorageKey);
    }

    getConfig() {
        return {
            ...this.config
        };
    }

    getState() {
        return {
            config: this.getConfig(),
            ...this.session.getState(),
            lastError: this.state.lastError
        };
    }

    ensureConfigured(context = "sync.appService") {
        const config = this.getConfig();

        if (!config.baseUrl || !config.appId) {
            fail("S016", "Sync configuration requires baseUrl and appId.", { context });
        }

        return config;
    }

    applyConfig(config) {
        const previousConfig = this.config || {};
        this.config = resolveConfig(this.defaultConfig, config);
        this.session.persist = this.config.rememberAuth;

        if (!this.config.baseUrl || !this.config.appId) {
            return this.getConfig();
        }

        const currentState = typeof this.session.getState === "function" ? this.session.getState() : null;
        const endpointChanged = previousConfig.baseUrl !== this.config.baseUrl
            || previousConfig.appId !== this.config.appId;
        const needsInitialConfigure = !currentState?.configured;

        if (endpointChanged || needsInitialConfigure) {
            this.session.configure({
                ...this.sessionClientConfig,
                baseUrl: this.config.baseUrl,
                appId: this.config.appId
            });
        }

        if (!this.config.rememberAuth) {
            this.session.clearPersistedAuth();
        }

        return this.getConfig();
    }

    saveConfig(configPatch = {}) {
        const next = resolveConfig(this.config, configPatch);
        this.applyConfig(next);
        this.persistConfig();
        this.state.lastError = null;
        return this.getConfig();
    }

    bootstrap(options = {}) {
        const persistedConfig = this.readPersistedConfig();
        const runtimeConfig = resolveConfig(
            persistedConfig || this.defaultConfig,
            options.config || {}
        );

        this.applyConfig(runtimeConfig);
        this.persistConfig();

        if (options.restoreAuth === false) {
            return Promise.resolve({
                config: this.getConfig(),
                auth: null,
                state: this.getState()
            });
        }

        return this.restoreAuth({
            refresh: options.refresh !== false,
            silent: options.silent !== false
        }).then((auth) => ({
            config: this.getConfig(),
            auth,
            state: this.getState()
        }));
    }

    async restoreAuth(options = {}) {
        this.ensureConfigured("sync.appService.restoreAuth");

        try {
            const result = await this.session.restoreAuth({
                refresh: options.refresh !== false,
                silent: options.silent !== false
            });
            this.state.lastError = null;
            return result;
        } catch (error) {
            this.state.lastError = error?.message || String(error);
            throw error;
        }
    }

    async authenticate(mode = "login", values = {}, options = {}) {
        this.ensureConfigured("sync.appService.authenticate");

        const action = mode === "register" ? "register" : "login";
        const payload = {
            email: values.email,
            password: values.password
        };

        const remember = options.remember ?? this.config.rememberAuth;
        const passphrase = options.passphrase ?? values.passphrase;

        let authResult;
        if (action === "register") {
            authResult = await this.session.register(payload, { remember, passphrase });
        } else {
            authResult = await this.session.login(payload, { remember, passphrase });
        }

        const nextEmail = String(values.email || "").trim().toLowerCase();
        if (nextEmail && nextEmail !== this.config.email) {
            this.saveConfig({ email: nextEmail });
        }

        let pullResult = null;
        const autoPull = options.autoPull ?? values.autoPull;
        if (autoPull) {
            pullResult = await this.pullData({
                importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS
            });
        }

        this.state.lastError = null;

        return {
            authResult,
            pullResult,
            state: this.getState()
        };
    }

    async logout(options = {}) {
        try {
            await this.session.logout({ clearStorage: options.clearStorage !== false });
            this.session.clearPassphrase();
            this.state.lastError = null;
            return true;
        } catch (error) {
            this.state.lastError = error?.message || String(error);
            throw error;
        }
    }

    async pushData(options = {}) {
        this.ensureConfigured("sync.appService.pushData");

        try {
            const result = await this.session.pushDataSnapshot({
                metadata: options.metadata || null,
                passphrase: options.passphrase,
                aad: options.aad,
                exportOptions: options.exportOptions || {}
            });
            this.state.lastError = null;
            return result;
        } catch (error) {
            this.state.lastError = error?.message || String(error);
            throw error;
        }
    }

    async pullData(options = {}) {
        this.ensureConfigured("sync.appService.pullData");

        try {
            const result = await this.session.pullDataSnapshot({
                passphrase: options.passphrase,
                aad: options.aad,
                importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS
            });
            this.state.lastError = null;
            return result;
        } catch (error) {
            this.state.lastError = error?.message || String(error);
            throw error;
        }
    }

    async sync(options = {}) {
        this.ensureConfigured("sync.appService.sync");

        const direction = options.direction || "both";

        try {
            if (direction === "push") {
                return {
                    push: await this.pushData(options.pushOptions || options)
                };
            }

            if (direction === "pull") {
                return {
                    pull: await this.pullData(options.pullOptions || options)
                };
            }

            const pull = await this.pullData(options.pullOptions || options);
            const push = await this.pushData(options.pushOptions || options);

            this.state.lastError = null;
            return {
                pull,
                push
            };
        } catch (error) {
            this.state.lastError = error?.message || String(error);
            throw error;
        }
    }
}

export function createSyncAppService(config = {}) {
    return new SyncAppService(config);
}
