import { fail } from "../errors.js";

export class StorageEngine {
    constructor({ namespace = "synact" } = {}) {
        this.namespace = String(namespace || "synact");
        this.ready = false;
    }

    async open() {
        this.ready = true;
        return this;
    }

    async close() {
        this.ready = false;
    }

    ensureReady(context) {
        if (!this.ready) {
            fail("S016", `${this.constructor.name} is not open. Call open() before using it.`, { context });
        }
    }

    normalizeKey(key, context = "data.storage.key") {
        if (typeof key !== "string" || key.trim() === "") {
            fail("S016", "Storage key must be a non-empty string.", { context, keyType: typeof key });
        }

        return key;
    }

    resolveKey(key, context = "data.storage.key") {
        const normalizedKey = this.normalizeKey(key, context);
        return `${this.namespace}:${normalizedKey}`;
    }

    stripNamespace(qualifiedKey) {
        const prefix = `${this.namespace}:`;
        if (!qualifiedKey.startsWith(prefix)) {
            return null;
        }
        return qualifiedKey.slice(prefix.length);
    }

    notImplemented(methodName) {
        fail("S016", `${this.constructor.name}.${methodName}() is not implemented.`, {
            context: `data.storage.${methodName}`
        });
    }

    async get(_key) {
        this.notImplemented("get");
    }

    async set(_key, _value) {
        this.notImplemented("set");
    }

    async remove(_key) {
        this.notImplemented("remove");
    }

    async list(_prefix = "") {
        this.notImplemented("list");
    }

    async clear(_prefix = "") {
        this.notImplemented("clear");
    }

    async transaction(_operations = []) {
        this.notImplemented("transaction");
    }
}
