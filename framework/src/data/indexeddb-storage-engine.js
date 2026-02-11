import { fail, createSynactError } from "../errors.js";
import { StorageEngine } from "./storage-engine.js";

function requestToPromise(request, context) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            reject(request.error || createSynactError("S013", "IndexedDB request failed.", { context }));
        };
    });
}

function transactionToPromise(transaction, context) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => {
            reject(transaction.error || createSynactError("S013", "IndexedDB transaction failed.", { context }));
        };
        transaction.onabort = () => {
            reject(transaction.error || createSynactError("S013", "IndexedDB transaction aborted.", { context }));
        };
    });
}

export class IndexedDBStorageEngine extends StorageEngine {
    constructor({
        namespace = "synact",
        dbName,
        storeName = "records",
        dbVersion = 1,
        indexedDBImpl = typeof indexedDB !== "undefined" ? indexedDB : null
    } = {}) {
        super({ namespace });
        this.dbName = dbName || `synact-${this.namespace}`;
        this.storeName = storeName;
        this.dbVersion = Number(dbVersion) || 1;
        this.indexedDBImpl = indexedDBImpl;
        this.db = null;
        this.openPromise = null;
    }

    async open() {
        if (this.ready && this.db) {
            return this;
        }

        if (this.openPromise) {
            return this.openPromise;
        }

        if (!this.indexedDBImpl || typeof this.indexedDBImpl.open !== "function") {
            fail("S013", "IndexedDB is not available in this environment.", {
                context: "data.indexeddb.open"
            });
        }

        this.openPromise = new Promise((resolve, reject) => {
            let request;
            try {
                request = this.indexedDBImpl.open(this.dbName, this.dbVersion);
            } catch (error) {
                reject(createSynactError("S013", "Unable to open IndexedDB database.", {
                    context: "data.indexeddb.open"
                }, error));
                return;
            }

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "key" });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.ready = true;
                this.openPromise = null;
                resolve(this);
            };

            request.onerror = () => {
                this.openPromise = null;
                reject(request.error || createSynactError("S013", "IndexedDB open request failed.", {
                    context: "data.indexeddb.open"
                }));
            };

            request.onblocked = () => {
                this.openPromise = null;
                reject(createSynactError("S013", "IndexedDB open request was blocked.", {
                    context: "data.indexeddb.open"
                }));
            };
        });

        return this.openPromise;
    }

    async close() {
        if (this.db && typeof this.db.close === "function") {
            this.db.close();
        }

        this.db = null;
        this.ready = false;
        this.openPromise = null;
    }

    async ensureDb(context) {
        await this.open();
        this.ensureReady(context);
        return this.db;
    }

    async get(key) {
        const db = await this.ensureDb("data.indexeddb.get");
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const qualifiedKey = this.resolveKey(key, "data.indexeddb.get");
        const request = store.get(qualifiedKey);

        const [result] = await Promise.all([
            requestToPromise(request, "data.indexeddb.get"),
            transactionToPromise(transaction, "data.indexeddb.get")
        ]);

        return result ? result.value : null;
    }

    async set(key, value) {
        const db = await this.ensureDb("data.indexeddb.set");
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const qualifiedKey = this.resolveKey(key, "data.indexeddb.set");

        const request = store.put({
            key: qualifiedKey,
            value: String(value),
            updatedAt: Date.now()
        });

        await Promise.all([
            requestToPromise(request, "data.indexeddb.set"),
            transactionToPromise(transaction, "data.indexeddb.set")
        ]);

        return true;
    }

    async remove(key) {
        const db = await this.ensureDb("data.indexeddb.remove");
        const qualifiedKey = this.resolveKey(key, "data.indexeddb.remove");
        const previousValue = await this.get(key);

        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(qualifiedKey);

        await Promise.all([
            requestToPromise(request, "data.indexeddb.remove"),
            transactionToPromise(transaction, "data.indexeddb.remove")
        ]);

        return previousValue != null;
    }

    async list(prefix = "") {
        const db = await this.ensureDb("data.indexeddb.list");
        const normalizedPrefix = String(prefix || "");
        const results = [];

        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor();

        await new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    resolve();
                    return;
                }

                const unqualifiedKey = this.stripNamespace(cursor.key);
                if (unqualifiedKey != null && unqualifiedKey.startsWith(normalizedPrefix)) {
                    results.push({ key: unqualifiedKey, value: cursor.value?.value ?? null });
                }

                cursor.continue();
            };

            request.onerror = () => {
                reject(request.error || createSynactError("S013", "IndexedDB cursor request failed.", {
                    context: "data.indexeddb.list"
                }));
            };
        });

        await transactionToPromise(transaction, "data.indexeddb.list");
        return results;
    }

    async clear(prefix = "") {
        const normalizedPrefix = String(prefix || "");
        const db = await this.ensureDb("data.indexeddb.clear");

        if (!normalizedPrefix) {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            await Promise.all([
                requestToPromise(request, "data.indexeddb.clear"),
                transactionToPromise(transaction, "data.indexeddb.clear")
            ]);

            return true;
        }

        const entries = await this.list(normalizedPrefix);
        if (entries.length === 0) {
            return 0;
        }

        await this.transaction(entries.map((entry) => ({ type: "remove", key: entry.key })));
        return entries.length;
    }

    async transaction(operations = []) {
        if (!Array.isArray(operations)) {
            fail("S016", "IndexedDBStorageEngine.transaction() expects an array of operations.", {
                context: "data.indexeddb.transaction"
            });
        }

        const db = await this.ensureDb("data.indexeddb.transaction");
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const requestPromises = [];

        for (const operation of operations) {
            if (!operation || typeof operation !== "object") {
                fail("S016", "Invalid transaction operation shape.", {
                    context: "data.indexeddb.transaction"
                });
            }

            const key = this.resolveKey(operation.key, "data.indexeddb.transaction");

            if (operation.type === "set") {
                const request = store.put({ key, value: String(operation.value ?? ""), updatedAt: Date.now() });
                requestPromises.push(requestToPromise(request, "data.indexeddb.transaction"));
                continue;
            }

            if (operation.type === "remove") {
                const request = store.delete(key);
                requestPromises.push(requestToPromise(request, "data.indexeddb.transaction"));
                continue;
            }

            fail("S016", `Unsupported transaction operation type "${operation.type}".`, {
                context: "data.indexeddb.transaction"
            });
        }

        await Promise.all([...requestPromises, transactionToPromise(transaction, "data.indexeddb.transaction")]);
        return true;
    }
}
