import { fail } from "../errors.js";
import { createSyncAppService, SyncAppService } from "./sync-app-service.js";

const DEFAULT_IMPORT_OPTIONS = Object.freeze({
    mode: "merge",
    onConflict: "newest"
});

const DEFAULT_SETTINGS_FIELDS = Object.freeze({
    serverUrl: "syncServerUrl",
    appId: "syncAppId",
    email: "syncEmail",
    rememberAuth: "syncRememberAuth",
    autoSyncEnabled: "syncAutoEnabled",
    autoSyncIntervalMinutes: "syncAutoIntervalMinutes",
    autoSyncDirection: "syncAutoDirection"
});

const DEFAULT_AUTO_SYNC = Object.freeze({
    enabled: false,
    intervalMinutes: 30,
    direction: "both"
});

const AUTO_SYNC_DIRECTIONS = new Set(["both", "pull", "push"]);

function normalizeString(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value).trim();
}

function normalizeSettingsFields(fields = {}) {
    const resolved = {
        ...DEFAULT_SETTINGS_FIELDS,
        ...(fields && typeof fields === "object" ? fields : {})
    };

    return {
        serverUrl: normalizeString(resolved.serverUrl, DEFAULT_SETTINGS_FIELDS.serverUrl),
        appId: normalizeString(resolved.appId, DEFAULT_SETTINGS_FIELDS.appId),
        email: normalizeString(resolved.email, DEFAULT_SETTINGS_FIELDS.email),
        rememberAuth: normalizeString(resolved.rememberAuth, DEFAULT_SETTINGS_FIELDS.rememberAuth),
        autoSyncEnabled: normalizeString(resolved.autoSyncEnabled, DEFAULT_SETTINGS_FIELDS.autoSyncEnabled),
        autoSyncIntervalMinutes: normalizeString(resolved.autoSyncIntervalMinutes, DEFAULT_SETTINGS_FIELDS.autoSyncIntervalMinutes),
        autoSyncDirection: normalizeString(resolved.autoSyncDirection, DEFAULT_SETTINGS_FIELDS.autoSyncDirection)
    };
}

function normalizeAutoSyncInterval(value, fallback = DEFAULT_AUTO_SYNC.intervalMinutes) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }

    return Math.max(5, Math.floor(numeric));
}

function normalizeAutoSyncDirection(value, fallback = DEFAULT_AUTO_SYNC.direction) {
    const normalized = normalizeString(value).toLowerCase();
    if (AUTO_SYNC_DIRECTIONS.has(normalized)) {
        return normalized;
    }
    return fallback;
}

function cloneObject(value) {
    if (!value || typeof value !== "object") {
        return null;
    }

    return {
        ...value
    };
}

function ensureObject(value, context) {
    if (!value || typeof value !== "object") {
        fail("S016", "Expected an object result from sync settings hook.", { context });
    }

    return value;
}

export class SyncFeatureService {
    constructor(options = {}) {
        this.fields = normalizeSettingsFields(options.settingsFields || {});

        this.defaults = {
            baseUrl: normalizeString(options.defaults?.baseUrl || options.baseUrl || ""),
            appId: normalizeString(options.defaults?.appId || options.appId || ""),
            email: normalizeString(options.defaults?.email || "").toLowerCase(),
            rememberAuth: options.defaults?.rememberAuth !== false
        };

        this.readSettingsFn = typeof options.readSettings === "function" ? options.readSettings : null;
        this.writeSettingsFn = typeof options.writeSettings === "function" ? options.writeSettings : null;
        this.afterPullFn = typeof options.afterPull === "function" ? options.afterPull : null;
        this.persistAuthEmail = options.persistAuthEmail !== false;
        this.pushMetadataFactory = typeof options.pushMetadataFactory === "function"
            ? options.pushMetadataFactory
            : null;
        this.autoSyncDefaults = {
            enabled: options.autoSync?.enabled === true,
            intervalMinutes: normalizeAutoSyncInterval(
                options.autoSync?.intervalMinutes,
                DEFAULT_AUTO_SYNC.intervalMinutes
            ),
            direction: normalizeAutoSyncDirection(
                options.autoSync?.direction,
                DEFAULT_AUTO_SYNC.direction
            )
        };

        const appService = options.appService || createSyncAppService(options);
        if (!(appService instanceof SyncAppService) && typeof appService?.bootstrap !== "function") {
            fail("S016", "SyncFeatureService requires a SyncAppService-compatible instance.", {
                context: "sync.feature.constructor"
            });
        }

        this.appService = appService;
        this.settings = null;
        this.autoSyncTimer = null;
        this.autoSyncInFlight = null;
        this.autoSyncTick = null;
        this.autoSyncHandlers = {
            onTick: null,
            onError: null,
            onSkipped: null
        };
        this.autoSyncState = {
            enabled: this.autoSyncDefaults.enabled,
            active: false,
            intervalMinutes: this.autoSyncDefaults.intervalMinutes,
            direction: this.autoSyncDefaults.direction,
            lastRunAt: null,
            lastError: null,
            lastSkipReason: null
        };
    }

    setDataApi(dataApi) {
        if (typeof this.appService?.setDataApi === "function") {
            this.appService.setDataApi(dataApi);
        }

        return this;
    }

    getSettings() {
        return cloneObject(this.settings);
    }

    getSyncState() {
        return this.appService.getState();
    }

    getAutoSyncState() {
        return {
            ...this.autoSyncState
        };
    }

    getState() {
        return {
            settings: this.getSettings(),
            sync: this.getSyncState(),
            autoSync: this.getAutoSyncState()
        };
    }

    resolveConfig(settings = this.settings, patch = {}) {
        const sourceSettings = settings && typeof settings === "object" ? settings : {};
        const sourcePatch = patch && typeof patch === "object" ? patch : {};
        const hasServerPatch = "baseUrl" in sourcePatch || this.fields.serverUrl in sourcePatch;
        const hasAppIdPatch = "appId" in sourcePatch || this.fields.appId in sourcePatch;
        const hasEmailPatch = "email" in sourcePatch || this.fields.email in sourcePatch;
        const hasRememberPatch = "rememberAuth" in sourcePatch || this.fields.rememberAuth in sourcePatch;

        const baseUrl = hasServerPatch
            ? normalizeString(sourcePatch.baseUrl ?? sourcePatch[this.fields.serverUrl])
            : normalizeString(sourceSettings[this.fields.serverUrl] ?? this.defaults.baseUrl);

        const appId = hasAppIdPatch
            ? normalizeString(sourcePatch.appId ?? sourcePatch[this.fields.appId])
            : normalizeString(sourceSettings[this.fields.appId] ?? this.defaults.appId);

        const email = (hasEmailPatch
            ? normalizeString(sourcePatch.email ?? sourcePatch[this.fields.email])
            : normalizeString(sourceSettings[this.fields.email] ?? this.defaults.email)).toLowerCase();

        const rememberAuth = hasRememberPatch
            ? Boolean(sourcePatch.rememberAuth ?? sourcePatch[this.fields.rememberAuth])
            : (sourceSettings[this.fields.rememberAuth] ?? this.defaults.rememberAuth) !== false;

        return {
            baseUrl,
            appId,
            email,
            rememberAuth
        };
    }

    toSettingsPatch(config = {}) {
        const resolved = this.resolveConfig({}, config);

        return {
            [this.fields.serverUrl]: resolved.baseUrl || this.defaults.baseUrl,
            [this.fields.appId]: resolved.appId || this.defaults.appId,
            [this.fields.email]: resolved.email,
            [this.fields.rememberAuth]: resolved.rememberAuth
        };
    }

    resolveAutoSyncConfig(settings = this.settings, patch = {}) {
        const sourceSettings = settings && typeof settings === "object" ? settings : {};
        const sourcePatch = patch && typeof patch === "object" ? patch : {};

        const hasEnabledPatch = "autoSyncEnabled" in sourcePatch || this.fields.autoSyncEnabled in sourcePatch;
        const hasIntervalPatch = "autoSyncIntervalMinutes" in sourcePatch || this.fields.autoSyncIntervalMinutes in sourcePatch;
        const hasDirectionPatch = "autoSyncDirection" in sourcePatch || this.fields.autoSyncDirection in sourcePatch;

        const enabled = hasEnabledPatch
            ? Boolean(sourcePatch.autoSyncEnabled ?? sourcePatch[this.fields.autoSyncEnabled])
            : Boolean(sourceSettings[this.fields.autoSyncEnabled] ?? this.autoSyncDefaults.enabled);

        const intervalMinutes = hasIntervalPatch
            ? normalizeAutoSyncInterval(
                sourcePatch.autoSyncIntervalMinutes ?? sourcePatch[this.fields.autoSyncIntervalMinutes],
                this.autoSyncDefaults.intervalMinutes
            )
            : normalizeAutoSyncInterval(
                sourceSettings[this.fields.autoSyncIntervalMinutes],
                this.autoSyncDefaults.intervalMinutes
            );

        const direction = hasDirectionPatch
            ? normalizeAutoSyncDirection(
                sourcePatch.autoSyncDirection ?? sourcePatch[this.fields.autoSyncDirection],
                this.autoSyncDefaults.direction
            )
            : normalizeAutoSyncDirection(
                sourceSettings[this.fields.autoSyncDirection],
                this.autoSyncDefaults.direction
            );

        return {
            enabled,
            intervalMinutes,
            direction
        };
    }

    toAutoSyncSettingsPatch(config = {}) {
        const resolved = this.resolveAutoSyncConfig({}, config);

        return {
            [this.fields.autoSyncEnabled]: resolved.enabled,
            [this.fields.autoSyncIntervalMinutes]: resolved.intervalMinutes,
            [this.fields.autoSyncDirection]: resolved.direction
        };
    }

    async loadSettings(force = false) {
        if (!force && this.settings) {
            return this.getSettings();
        }

        if (!this.readSettingsFn) {
            if (!this.settings) {
                this.settings = {
                    ...this.toSettingsPatch(this.defaults),
                    ...this.toAutoSyncSettingsPatch(this.autoSyncDefaults)
                };
            }
            const autoSync = this.resolveAutoSyncConfig(this.settings);
            this.autoSyncState.enabled = autoSync.enabled;
            this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
            this.autoSyncState.direction = autoSync.direction;
            return this.getSettings();
        }

        const loaded = await this.readSettingsFn();
        this.settings = cloneObject(ensureObject(loaded, "sync.feature.loadSettings"));
        const autoSync = this.resolveAutoSyncConfig(this.settings);
        this.autoSyncState.enabled = autoSync.enabled;
        this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
        this.autoSyncState.direction = autoSync.direction;
        return this.getSettings();
    }

    async persistSettingsPatch(patch = {}) {
        const nextPatch = patch && typeof patch === "object" ? patch : {};

        if (!this.writeSettingsFn) {
            const base = this.settings && typeof this.settings === "object" ? this.settings : {};
            this.settings = {
                ...base,
                ...nextPatch
            };
            const autoSync = this.resolveAutoSyncConfig(this.settings);
            this.autoSyncState.enabled = autoSync.enabled;
            this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
            this.autoSyncState.direction = autoSync.direction;
            return this.getSettings();
        }

        const saved = await this.writeSettingsFn(nextPatch);
        this.settings = cloneObject(ensureObject(saved, "sync.feature.persistSettingsPatch"));
        const autoSync = this.resolveAutoSyncConfig(this.settings);
        this.autoSyncState.enabled = autoSync.enabled;
        this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
        this.autoSyncState.direction = autoSync.direction;
        return this.getSettings();
    }

    async applySettingsToSync(patch = {}) {
        await this.loadSettings(false);
        const config = this.resolveConfig(this.settings, patch);
        this.appService.saveConfig(config);
        return config;
    }

    async bootstrap(options = {}) {
        const settings = await this.loadSettings(true);
        const config = this.resolveConfig(settings, options.config || {});

        const bootstrapResult = await this.appService.bootstrap({
            ...options,
            config
        });

        return {
            ...bootstrapResult,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    async saveConfig(values = {}) {
        const resolvedConfig = await this.applySettingsToSync(values);
        const resolvedAutoSync = this.resolveAutoSyncConfig(this.settings, values);
        const savedSettings = await this.persistSettingsPatch({
            ...this.toSettingsPatch(resolvedConfig),
            ...this.toAutoSyncSettingsPatch(resolvedAutoSync)
        });
        this.autoSyncState.enabled = resolvedAutoSync.enabled;
        this.autoSyncState.intervalMinutes = resolvedAutoSync.intervalMinutes;
        this.autoSyncState.direction = resolvedAutoSync.direction;

        return {
            config: this.appService.getConfig(),
            settings: savedSettings,
            sync: this.getSyncState()
        };
    }

    async authenticate(mode = "login", values = {}, options = {}) {
        const resolvedConfig = await this.applySettingsToSync();

        const result = await this.appService.authenticate(mode, values, {
            ...options,
            remember: options.remember ?? resolvedConfig.rememberAuth,
            importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS
        });

        const email = normalizeString(values?.email || "").toLowerCase();
        if (
            this.persistAuthEmail
            && email
            && email !== normalizeString(this.settings?.[this.fields.email] || "").toLowerCase()
        ) {
            await this.persistSettingsPatch({
                [this.fields.email]: email
            });
        }

        if (result?.pullResult?.snapshot && this.afterPullFn) {
            await this.afterPullFn(result.pullResult);
        }

        return {
            ...result,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    async restoreAuth(options = {}) {
        await this.applySettingsToSync();

        const restored = await this.appService.restoreAuth(options);
        return {
            ...restored,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    buildPushOptions(options = {}) {
        const next = {
            ...(options && typeof options === "object" ? options : {})
        };

        if (!next.metadata && this.pushMetadataFactory) {
            next.metadata = this.pushMetadataFactory();
        }

        return next;
    }

    async pushData(options = {}) {
        await this.applySettingsToSync();

        const result = await this.appService.pushData(this.buildPushOptions(options));
        return {
            result,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    async pullData(options = {}) {
        await this.applySettingsToSync();

        const result = await this.appService.pullData({
            importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS,
            ...(options && typeof options === "object" ? options : {})
        });

        if (result?.snapshot && this.afterPullFn) {
            await this.afterPullFn(result);
        }

        return {
            result,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    async sync(options = {}) {
        await this.applySettingsToSync();

        const direction = options.direction || "both";
        const pullOptions = {
            importOptions: DEFAULT_IMPORT_OPTIONS,
            ...(options.pullOptions || options)
        };
        const pushOptions = this.buildPushOptions(options.pushOptions || options);

        const result = await this.appService.sync({
            ...options,
            direction,
            pullOptions,
            pushOptions
        });

        if (result?.pull?.snapshot && this.afterPullFn) {
            await this.afterPullFn(result.pull);
        }

        return {
            result,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    updateAutoSyncHandlers(options = {}) {
        const source = options && typeof options === "object" ? options : {};

        if (typeof source.onTick === "function") {
            this.autoSyncHandlers.onTick = source.onTick;
        }

        if (typeof source.onError === "function") {
            this.autoSyncHandlers.onError = source.onError;
        }

        if (typeof source.onSkipped === "function") {
            this.autoSyncHandlers.onSkipped = source.onSkipped;
        }
    }

    async runAutoSyncTick(trigger = "interval", options = {}) {
        if (this.autoSyncInFlight) {
            return this.autoSyncInFlight;
        }

        this.autoSyncInFlight = (async () => {
            const syncState = this.getSyncState();
            const config = this.resolveAutoSyncConfig(this.settings, options.patch || {});

            let skippedReason = null;
            if (!config.enabled) {
                skippedReason = "disabled";
            } else if (!syncState.configured || !syncState.authenticated) {
                skippedReason = "not-authenticated";
            } else if (!syncState.passphraseSet) {
                skippedReason = "passphrase-missing";
            }

            if (skippedReason) {
                this.autoSyncState.lastSkipReason = skippedReason;
                if (this.autoSyncHandlers.onSkipped) {
                    this.autoSyncHandlers.onSkipped({
                        reason: skippedReason,
                        trigger,
                        state: this.getAutoSyncState()
                    });
                }

                return {
                    skipped: true,
                    reason: skippedReason
                };
            }

            try {
                const result = await this.sync({
                    direction: config.direction,
                    pullOptions: {
                        importOptions: DEFAULT_IMPORT_OPTIONS
                    }
                });

                this.autoSyncState.lastRunAt = new Date().toISOString();
                this.autoSyncState.lastError = null;
                this.autoSyncState.lastSkipReason = null;

                if (this.autoSyncHandlers.onTick) {
                    this.autoSyncHandlers.onTick({
                        trigger,
                        result,
                        state: this.getAutoSyncState()
                    });
                }

                return result;
            } catch (error) {
                this.autoSyncState.lastError = error?.message || String(error);
                if (this.autoSyncHandlers.onError) {
                    this.autoSyncHandlers.onError(error, {
                        trigger,
                        state: this.getAutoSyncState()
                    });
                }
                throw error;
            } finally {
                this.autoSyncInFlight = null;
            }
        })();

        return this.autoSyncInFlight;
    }

    async startAutoSync(options = {}) {
        this.updateAutoSyncHandlers(options);
        await this.loadSettings(false);

        const config = this.resolveAutoSyncConfig(this.settings, options.patch || {});
        this.autoSyncState.enabled = config.enabled;
        this.autoSyncState.intervalMinutes = config.intervalMinutes;
        this.autoSyncState.direction = config.direction;
        this.autoSyncState.lastError = null;

        if (!config.enabled) {
            this.stopAutoSync();
            return {
                started: false,
                reason: "disabled",
                autoSync: this.getAutoSyncState()
            };
        }

        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }

        this.autoSyncState.active = true;
        this.autoSyncTick = () => this.runAutoSyncTick("interval", { patch: config });

        this.autoSyncTimer = setInterval(() => {
            this.autoSyncTick()
                .catch(() => {});
        }, config.intervalMinutes * 60 * 1000);

        if (options.immediate === true) {
            try {
                await this.runAutoSyncTick("start", { patch: config });
            } catch (error) {
                if (options.throwOnImmediateError === true) {
                    throw error;
                }
            }
        }

        return {
            started: true,
            autoSync: this.getAutoSyncState()
        };
    }

    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }

        this.autoSyncTick = null;
        this.autoSyncInFlight = null;
        this.autoSyncState.active = false;

        return {
            stopped: true,
            autoSync: this.getAutoSyncState()
        };
    }

    async logout(options = {}) {
        const result = await this.appService.logout(options);

        return {
            result,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }

    setPassphrase(passphrase) {
        const value = normalizeString(passphrase);
        if (!value) {
            fail("S016", "Passphrase is required.", {
                context: "sync.feature.setPassphrase"
            });
        }

        const session = this.appService?.session;
        if (!session || typeof session.setPassphrase !== "function") {
            fail("S016", "Sync session does not support setPassphrase.", {
                context: "sync.feature.setPassphrase"
            });
        }

        session.setPassphrase(value);

        return {
            value,
            settings: this.getSettings(),
            sync: this.getSyncState()
        };
    }
}

export function createSyncFeatureService(config = {}) {
    return new SyncFeatureService(config);
}
