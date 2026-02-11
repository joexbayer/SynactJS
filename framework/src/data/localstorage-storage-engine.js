import { fail } from "../errors.js";
import { StorageEngine } from "./storage-engine.js";

export class LocalStorageEngine extends StorageEngine {
    constructor({ namespace = "synact", storage = null } = {}) {
        super({ namespace });
        this.storage = storage;
        this.storageRef = null;
    }

    resolveStorage() {
        if (this.storage) {
            return this.storage;
        }

        if (typeof window === "undefined") {
            fail("S013", "localStorage is not available in this environment.", {
                context: "data.localstorage.resolve"
            });
        }

        try {
            return window.localStorage;
        } catch (error) {
            fail("S013", "Unable to access localStorage in this environment.", {
                context: "data.localstorage.resolve"
            }, error);
        }
    }

    async open() {
        this.storageRef = this.resolveStorage();
        this.ready = true;
        return this;
    }

    async close() {
        this.storageRef = null;
        this.ready = false;
    }

    getStorage(context) {
        this.ensureReady(context);
        return this.storageRef;
    }

    unsafeGetQualified(qualifiedKey, context) {
        const storage = this.getStorage(context);
        try {
            return storage.getItem(qualifiedKey);
        } catch (error) {
            fail("S013", "localStorage getItem() failed.", { context }, error);
        }
    }

    unsafeSetQualified(qualifiedKey, value, context) {
        const storage = this.getStorage(context);
        try {
            storage.setItem(qualifiedKey, value);
        } catch (error) {
            fail("S013", "localStorage setItem() failed.", { context }, error);
        }
    }

    unsafeRemoveQualified(qualifiedKey, context) {
        const storage = this.getStorage(context);
        try {
            storage.removeItem(qualifiedKey);
        } catch (error) {
            fail("S013", "localStorage removeItem() failed.", { context }, error);
        }
    }

    async get(key) {
        const qualifiedKey = this.resolveKey(key, "data.localstorage.get");
        return this.unsafeGetQualified(qualifiedKey, "data.localstorage.get");
    }

    async set(key, value) {
        const qualifiedKey = this.resolveKey(key, "data.localstorage.set");
        this.unsafeSetQualified(qualifiedKey, String(value), "data.localstorage.set");
        return true;
    }

    async remove(key) {
        const qualifiedKey = this.resolveKey(key, "data.localstorage.remove");
        const previousValue = this.unsafeGetQualified(qualifiedKey, "data.localstorage.remove");
        this.unsafeRemoveQualified(qualifiedKey, "data.localstorage.remove");
        return previousValue != null;
    }

    async list(prefix = "") {
        const storage = this.getStorage("data.localstorage.list");
        const normalizedPrefix = String(prefix || "");
        const results = [];

        for (let i = 0; i < storage.length; i++) {
            const qualifiedKey = storage.key(i);
            if (!qualifiedKey) continue;

            const unqualifiedKey = this.stripNamespace(qualifiedKey);
            if (unqualifiedKey == null) continue;
            if (!unqualifiedKey.startsWith(normalizedPrefix)) continue;

            const value = this.unsafeGetQualified(qualifiedKey, "data.localstorage.list");
            results.push({ key: unqualifiedKey, value });
        }

        return results;
    }

    async clear(prefix = "") {
        const entries = await this.list(prefix);
        for (const entry of entries) {
            await this.remove(entry.key);
        }
        return entries.length;
    }

    async transaction(operations = []) {
        if (!Array.isArray(operations)) {
            fail("S016", "LocalStorageEngine.transaction() expects an array of operations.", {
                context: "data.localstorage.transaction"
            });
        }

        const rollbackMap = new Map();

        for (const operation of operations) {
            if (!operation || typeof operation !== "object") {
                fail("S016", "Invalid transaction operation shape.", {
                    context: "data.localstorage.transaction"
                });
            }

            const key = this.normalizeKey(operation.key, "data.localstorage.transaction");
            if (rollbackMap.has(key)) {
                continue;
            }

            rollbackMap.set(key, await this.get(key));
        }

        try {
            for (const operation of operations) {
                const key = this.normalizeKey(operation.key, "data.localstorage.transaction");

                if (operation.type === "set") {
                    await this.set(key, operation.value ?? "");
                } else if (operation.type === "remove") {
                    await this.remove(key);
                } else {
                    fail("S016", `Unsupported transaction operation type "${operation.type}".`, {
                        context: "data.localstorage.transaction"
                    });
                }
            }
        } catch (error) {
            for (const [key, previousValue] of rollbackMap.entries()) {
                if (previousValue == null) {
                    await this.remove(key);
                } else {
                    await this.set(key, previousValue);
                }
            }

            throw error;
        }

        return true;
    }
}
