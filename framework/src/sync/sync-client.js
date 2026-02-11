import { createSynactError, fail, report } from "../errors.js";
import { SnapshotCrypto } from "./snapshot-crypto.js";

function safeJsonParse(rawValue) {
    try {
        return JSON.parse(rawValue);
    } catch (_) {
        return null;
    }
}

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeBaseUrl(baseUrl) {
    const value = String(baseUrl || "").trim();
    if (!value) {
        fail("S016", "SyncClient requires a baseUrl.", {
            context: "sync.client.constructor"
        });
    }

    return value.replace(/\/+$/, "");
}

function resolveUrl(baseUrl, path) {
    const safePath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
    try {
        return new URL(safePath, baseUrl).toString();
    } catch (_) {
        return `${baseUrl}${safePath}`;
    }
}

async function parseResponseBody(response) {
    const contentType = response.headers?.get?.("content-type") || "";

    if (response.status === 204) {
        return null;
    }

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return safeJsonParse(text) ?? text;
}

function normalizeErrorPayload(payload, fallbackMessage) {
    if (payload && typeof payload === "object") {
        if (typeof payload.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        if (Array.isArray(payload.errors) && payload.errors.length > 0) {
            return payload.errors.join(", ");
        }
    }

    return fallbackMessage;
}

export class SyncClient {
    constructor(config = {}) {
        this.baseUrl = normalizeBaseUrl(config.baseUrl);
        this.appId = String(config.appId || "").trim();
        if (!this.appId) {
            fail("S016", "SyncClient requires a non-empty appId.", {
                context: "sync.client.constructor"
            });
        }

        this.fetchImpl = typeof config.fetchImpl === "function"
            ? config.fetchImpl
            : (typeof fetch === "function" ? fetch.bind(globalThis) : null);

        if (typeof this.fetchImpl !== "function") {
            fail("S013", "fetch API is not available in this environment.", {
                context: "sync.client.constructor"
            });
        }

        this.crypto = config.crypto instanceof SnapshotCrypto
            ? config.crypto
            : new SnapshotCrypto(config.crypto || {});

        this.defaultHeaders = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(config.headers || {})
        };

        this.credentials = config.credentials || "include";
        this.accessToken = null;
        this.passphrase = config.passphrase || null;
    }

    setAccessToken(accessToken) {
        this.accessToken = typeof accessToken === "string" ? accessToken : null;
        return this.accessToken;
    }

    clearAccessToken() {
        this.accessToken = null;
    }

    setPassphrase(passphrase) {
        const safePassphrase = String(passphrase || "");
        if (!safePassphrase) {
            fail("S016", "setPassphrase requires a non-empty passphrase.", {
                context: "sync.client.setPassphrase"
            });
        }

        this.passphrase = safePassphrase;
        return this.passphrase;
    }

    clearPassphrase() {
        this.passphrase = null;
    }

    resolvePassphrase(passphrase) {
        const resolved = passphrase || this.passphrase;
        if (!resolved) {
            fail("S016", "A passphrase is required for sync encryption/decryption.", {
                context: "sync.client.passphrase"
            });
        }
        return resolved;
    }

    async request(path, {
        method = "GET",
        body,
        auth = true,
        retryOnUnauthorized = true,
        headers = {},
        credentials
    } = {}) {
        const url = resolveUrl(this.baseUrl, path);
        const mergedHeaders = {
            ...this.defaultHeaders,
            ...headers
        };

        if (auth && this.accessToken) {
            mergedHeaders.Authorization = `Bearer ${this.accessToken}`;
        }

        const requestInit = {
            method,
            headers: mergedHeaders,
            credentials: credentials || this.credentials
        };

        if (body !== undefined) {
            requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        let response;
        try {
            response = await this.fetchImpl(url, requestInit);
        } catch (error) {
            report("S014", error, {
                context: "sync.client.request",
                method,
                url
            });
            throw error;
        }

        if (response.status === 401 && auth && retryOnUnauthorized) {
            const refreshed = await this.refresh({ silent: true });
            if (refreshed?.accessToken) {
                return this.request(path, {
                    method,
                    body,
                    auth,
                    retryOnUnauthorized: false,
                    headers,
                    credentials
                });
            }
        }

        const payload = await parseResponseBody(response);

        if (!response.ok) {
            const message = normalizeErrorPayload(payload, `Sync request failed with status ${response.status}.`);
            const statusError = createSynactError("S014", message, {
                context: "sync.client.response",
                method,
                path,
                status: response.status
            });
            report("S014", statusError, statusError.details);
            throw statusError;
        }

        return payload;
    }

    validateCredentials({ email, password }, context) {
        const safeEmail = String(email || "").trim().toLowerCase();
        const safePassword = String(password || "");

        if (!isEmail(safeEmail)) {
            fail("S016", "A valid email is required for sync authentication.", {
                context
            });
        }

        if (safePassword.length < 10) {
            fail("S016", "Password must be at least 10 characters.", {
                context
            });
        }

        return {
            email: safeEmail,
            password: safePassword
        };
    }

    async register({ email, password } = {}) {
        const credentials = this.validateCredentials({ email, password }, "sync.client.register");

        const payload = await this.request("/v1/auth/register", {
            method: "POST",
            body: {
                ...credentials,
                appId: this.appId
            },
            auth: false,
            retryOnUnauthorized: false
        });

        this.setAccessToken(payload?.accessToken || null);
        return payload;
    }

    async login({ email, password } = {}) {
        const credentials = this.validateCredentials({ email, password }, "sync.client.login");

        const payload = await this.request("/v1/auth/login", {
            method: "POST",
            body: {
                ...credentials,
                appId: this.appId
            },
            auth: false,
            retryOnUnauthorized: false
        });

        this.setAccessToken(payload?.accessToken || null);
        return payload;
    }

    async refresh({ silent = false } = {}) {
        try {
            const payload = await this.request("/v1/auth/refresh", {
                method: "POST",
                body: {
                    appId: this.appId
                },
                auth: false,
                retryOnUnauthorized: false
            });
            this.setAccessToken(payload?.accessToken || null);
            return payload;
        } catch (error) {
            this.clearAccessToken();
            if (!silent) {
                throw error;
            }
            return null;
        }
    }

    async logout() {
        try {
            await this.request("/v1/auth/logout", {
                method: "POST",
                body: {
                    appId: this.appId
                },
                auth: false,
                retryOnUnauthorized: false
            });
        } finally {
            this.clearAccessToken();
        }

        return true;
    }

    async pushSnapshot(snapshot, {
        passphrase,
        metadata = null,
        aad = null
    } = {}) {
        if (!snapshot || typeof snapshot !== "object") {
            fail("S016", "pushSnapshot requires a snapshot object payload.", {
                context: "sync.client.pushSnapshot"
            });
        }

        const encryptedSnapshot = await this.crypto.encryptObject(snapshot, {
            passphrase: this.resolvePassphrase(passphrase),
            aad: aad || this.appId
        });

        return this.request("/v1/sync/blob", {
            method: "PUT",
            body: {
                appId: this.appId,
                metadata,
                encryptedSnapshot
            }
        });
    }

    async pullSnapshot({ passphrase, aad = null } = {}) {
        const response = await this.request(`/v1/sync/blob?appId=${encodeURIComponent(this.appId)}`, {
            method: "GET",
            auth: true
        });

        if (!response || !response.encryptedSnapshot) {
            return null;
        }

        const snapshot = await this.crypto.decryptObject(response.encryptedSnapshot, {
            passphrase: this.resolvePassphrase(passphrase),
            aad: aad || this.appId
        });

        return {
            snapshot,
            meta: {
                appId: response.appId,
                updatedAt: response.updatedAt || null,
                metadata: response.metadata || null
            }
        };
    }
}

export function createSyncClient(config = {}) {
    return new SyncClient(config);
}
