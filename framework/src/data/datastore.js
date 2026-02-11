import { fail } from "../errors.js";
import { MigrationRunner } from "./migration-runner.js";
import { StorageEngine } from "./storage-engine.js";
import { IndexedDBStorageEngine } from "./indexeddb-storage-engine.js";
import { LocalStorageEngine } from "./localstorage-storage-engine.js";

function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function parseJSON(rawValue, context) {
    try {
        return JSON.parse(rawValue);
    } catch (error) {
        fail("S016", "Failed to parse stored JSON value.", { context }, error);
    }
}

function stringifyJSON(value, context) {
    try {
        return JSON.stringify(value);
    } catch (error) {
        fail("S016", "Failed to serialize value as JSON.", { context }, error);
    }
}

function nowISO() {
    return new Date().toISOString();
}

function resolveEngineMode(engine) {
    if (engine == null) {
        return "auto";
    }

    if (typeof engine === "string") {
        return engine;
    }

    return null;
}

export class DataStore {
    constructor(config = {}) {
        const appId = String(config.appId || "").trim();
        if (!appId) {
            fail("S016", "DataStore requires a non-empty appId.", { context: "data.datastore.constructor" });
        }

        const schemaVersion = Number(config.schemaVersion ?? 1);
        if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
            fail("S016", "schemaVersion must be an integer >= 1.", {
                context: "data.datastore.constructor"
            });
        }

        this.appId = appId;
        this.schemaVersion = schemaVersion;
        this.engineMode = resolveEngineMode(config.engine);
        this.engineConfig = {
            dbName: config.dbName,
            storeName: config.storeName,
            dbVersion: config.dbVersion,
            indexedDBImpl: config.indexedDBImpl,
            storage: config.storage
        };
        this.namespace = String(config.namespace || `synact:${appId}`);
        this.engine = config.engine instanceof StorageEngine ? config.engine : config.engineInstance || null;
        this.migrationRunner = new MigrationRunner({ migrations: config.migrations || [] });

        this.metaKey = "__synact_meta__";
        this.recordPrefix = "record";
        this.meta = null;
        this.ready = false;
        this.openPromise = null;
    }

    static async create(config = {}) {
        const store = new DataStore(config);
        await store.open();
        return store;
    }

    validateCollection(collection, context) {
        if (typeof collection !== "string" || !collection.trim()) {
            fail("S016", "collection must be a non-empty string.", { context });
        }

        return collection;
    }

    validateId(id, context) {
        if (typeof id !== "string" || !id.trim()) {
            fail("S016", "id must be a non-empty string.", { context });
        }

        return id;
    }

    buildRecordKey(collection, id) {
        return `${this.recordPrefix}:${collection}:${id}`;
    }

    buildCollectionPrefix(collection) {
        return `${this.recordPrefix}:${collection}:`;
    }

    parseRecordKey(recordKey) {
        const safeKey = String(recordKey || "");
        const prefix = `${this.recordPrefix}:`;
        if (!safeKey.startsWith(prefix)) {
            return null;
        }

        const rest = safeKey.slice(prefix.length);
        const separatorIndex = rest.indexOf(":");
        if (separatorIndex <= 0) {
            return null;
        }

        const collection = rest.slice(0, separatorIndex);
        const id = rest.slice(separatorIndex + 1);

        if (!collection || !id) {
            return null;
        }

        return { collection, id };
    }

    createEngineFromMode(mode) {
        if (mode === "indexeddb") {
            return new IndexedDBStorageEngine({
                namespace: this.namespace,
                dbName: this.engineConfig.dbName,
                storeName: this.engineConfig.storeName,
                dbVersion: this.engineConfig.dbVersion,
                indexedDBImpl: this.engineConfig.indexedDBImpl
            });
        }

        if (mode === "localstorage") {
            return new LocalStorageEngine({
                namespace: this.namespace,
                storage: this.engineConfig.storage
            });
        }

        fail("S016", `Unsupported DataStore engine mode "${mode}".`, {
            context: "data.datastore.createEngine"
        });
    }

    async resolveEngine() {
        if (this.engine) {
            return this.engine;
        }

        if (this.engineMode === "auto") {
            const indexedDBAvailable = typeof this.engineConfig.indexedDBImpl?.open === "function"
                || typeof indexedDB !== "undefined";
            this.engine = indexedDBAvailable
                ? this.createEngineFromMode("indexeddb")
                : this.createEngineFromMode("localstorage");
            return this.engine;
        }

        if (this.engineMode === "indexeddb" || this.engineMode === "localstorage") {
            this.engine = this.createEngineFromMode(this.engineMode);
            return this.engine;
        }

        fail("S016", "engine must be one of: auto, indexeddb, localstorage, or a StorageEngine instance.", {
            context: "data.datastore.resolveEngine"
        });
    }

    async open() {
        if (this.ready) {
            return this;
        }

        if (this.openPromise) {
            return this.openPromise;
        }

        this.openPromise = this.openInternal().catch((error) => {
            this.ready = false;
            this.openPromise = null;
            throw error;
        });
        return this.openPromise;
    }

    async openInternal() {
        let engine = await this.resolveEngine();

        try {
            await engine.open();
        } catch (error) {
            if (this.engineMode === "auto" && engine instanceof IndexedDBStorageEngine) {
                engine = this.createEngineFromMode("localstorage");
                this.engine = engine;
                await engine.open();
            } else {
                throw error;
            }
        }

        this.ready = true;

        const rawMeta = await engine.get(this.metaKey);
        if (rawMeta == null) {
            const timestamp = nowISO();
            this.meta = {
                appId: this.appId,
                schemaVersion: 0,
                createdAt: timestamp,
                updatedAt: timestamp,
                lastMigrationAt: null,
                lastAppliedMigrations: []
            };
            await engine.set(this.metaKey, stringifyJSON(this.meta, "data.datastore.meta.write"));
        } else {
            this.meta = parseJSON(rawMeta, "data.datastore.meta.read");
            if (this.meta?.appId !== this.appId) {
                fail("S016", "Stored appId does not match the configured DataStore appId.", {
                    context: "data.datastore.meta.validate",
                    configuredAppId: this.appId,
                    storedAppId: this.meta?.appId
                });
            }
        }

        await this.migrate(this.schemaVersion);

        this.openPromise = null;
        return this;
    }

    async ensureOpen(context) {
        if (!this.ready) {
            await this.open();
        }

        if (!this.engine) {
            fail("S016", "DataStore engine is unavailable.", { context });
        }

        return this.engine;
    }

    async writeMeta(nextMeta) {
        const engine = await this.ensureOpen("data.datastore.writeMeta");
        this.meta = { ...nextMeta };
        await engine.set(this.metaKey, stringifyJSON(this.meta, "data.datastore.meta.write"));
        return { ...this.meta };
    }

    getMeta() {
        if (!this.meta) {
            return null;
        }

        return { ...this.meta };
    }

    getRecordTtlMs(record) {
        if (!record?.expiresAt) {
            return undefined;
        }

        const ttlMs = Number(new Date(record.expiresAt).getTime()) - Date.now();
        if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
            return undefined;
        }

        return ttlMs;
    }

    isExpired(record) {
        if (!record?.expiresAt) {
            return false;
        }

        return Number(new Date(record.expiresAt).getTime()) <= Date.now();
    }

    async readRecord(collection, id) {
        const safeCollection = this.validateCollection(collection, "data.datastore.readRecord");
        const safeId = this.validateId(id, "data.datastore.readRecord");

        const engine = await this.ensureOpen("data.datastore.readRecord");
        const recordKey = this.buildRecordKey(safeCollection, safeId);
        const rawRecord = await engine.get(recordKey);

        if (rawRecord == null) {
            return null;
        }

        const record = parseJSON(rawRecord, "data.datastore.readRecord");
        if (this.isExpired(record)) {
            await engine.remove(recordKey);
            return null;
        }

        return record;
    }

    async read(collection, id) {
        const record = await this.readRecord(collection, id);
        return record ? record.payload : null;
    }

    async write(collection, id, payload, options = {}) {
        const safeCollection = this.validateCollection(collection, "data.datastore.write");
        const safeId = this.validateId(id, "data.datastore.write");

        const existingRecord = await this.readRecord(safeCollection, safeId);
        const timestamp = nowISO();

        let expiresAt = null;
        if (options.ttlMs != null) {
            const ttlMs = Number(options.ttlMs);
            if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
                fail("S016", "ttlMs must be a positive number.", { context: "data.datastore.write" });
            }
            expiresAt = new Date(Date.now() + ttlMs).toISOString();
        }

        const record = {
            appId: this.appId,
            collection: safeCollection,
            id: safeId,
            payload,
            createdAt: existingRecord?.createdAt || timestamp,
            updatedAt: timestamp,
            expiresAt
        };

        const engine = await this.ensureOpen("data.datastore.write");
        await engine.set(
            this.buildRecordKey(safeCollection, safeId),
            stringifyJSON(record, "data.datastore.write")
        );

        return payload;
    }

    async update(collection, id, patch) {
        const safeCollection = this.validateCollection(collection, "data.datastore.update");
        const safeId = this.validateId(id, "data.datastore.update");
        const existingRecord = await this.readRecord(safeCollection, safeId);

        if (!existingRecord) {
            return null;
        }

        let nextPayload;
        if (typeof patch === "function") {
            nextPayload = patch(existingRecord.payload);
        } else if (isPlainObject(patch) && isPlainObject(existingRecord.payload)) {
            nextPayload = { ...existingRecord.payload, ...patch };
        } else {
            nextPayload = patch;
        }

        const writeOptions = {};
        if (existingRecord.expiresAt) {
            const ttlMs = this.getRecordTtlMs(existingRecord);
            if (ttlMs > 0) {
                writeOptions.ttlMs = ttlMs;
            }
        }

        return this.write(safeCollection, safeId, nextPayload, writeOptions);
    }

    async delete(collection, id) {
        const safeCollection = this.validateCollection(collection, "data.datastore.delete");
        const safeId = this.validateId(id, "data.datastore.delete");
        const engine = await this.ensureOpen("data.datastore.delete");
        return engine.remove(this.buildRecordKey(safeCollection, safeId));
    }

    async query(collection, options = {}) {
        const safeCollection = this.validateCollection(collection, "data.datastore.query");
        const {
            limit,
            offset = 0,
            sortBy = "updatedAt",
            sortDirection = "desc",
            predicate,
            withMeta = false
        } = options;

        const safeOffset = Math.max(0, Number(offset) || 0);
        const safeLimit = limit == null ? null : Math.max(0, Number(limit) || 0);

        const engine = await this.ensureOpen("data.datastore.query");
        const entries = await engine.list(this.buildCollectionPrefix(safeCollection));
        const records = [];

        for (const entry of entries) {
            const record = parseJSON(entry.value, "data.datastore.query");
            if (this.isExpired(record)) {
                await engine.remove(entry.key);
                continue;
            }

            if (typeof predicate === "function" && !predicate(record.payload, record)) {
                continue;
            }

            records.push(record);
        }

        records.sort((a, b) => {
            const aValue = a?.[sortBy];
            const bValue = b?.[sortBy];

            if (aValue === bValue) return 0;
            if (aValue == null) return sortDirection === "asc" ? -1 : 1;
            if (bValue == null) return sortDirection === "asc" ? 1 : -1;

            const result = String(aValue).localeCompare(String(bValue));
            return sortDirection === "asc" ? result : -result;
        });

        const sliced = records.slice(safeOffset, safeLimit == null ? undefined : safeOffset + safeLimit);
        if (withMeta) {
            return sliced;
        }

        return sliced.map((record) => record.payload);
    }

    async listCollections() {
        const engine = await this.ensureOpen("data.datastore.listCollections");
        const entries = await engine.list(`${this.recordPrefix}:`);
        const collections = new Set();

        for (const entry of entries) {
            const parsed = this.parseRecordKey(entry.key);
            if (!parsed) continue;
            collections.add(parsed.collection);
        }

        return Array.from(collections).sort();
    }

    async listRecords(collection = null) {
        if (collection != null) {
            const safeCollection = this.validateCollection(collection, "data.datastore.listRecords");
            return this.query(safeCollection, { withMeta: true });
        }

        const engine = await this.ensureOpen("data.datastore.listRecords");
        const entries = await engine.list(`${this.recordPrefix}:`);
        const records = [];

        for (const entry of entries) {
            const parsed = this.parseRecordKey(entry.key);
            if (!parsed) continue;

            const record = parseJSON(entry.value, "data.datastore.listRecords");
            if (this.isExpired(record)) {
                await engine.remove(entry.key);
                continue;
            }

            records.push(record);
        }

        return records;
    }

    async writeRecord(record) {
        if (!record || typeof record !== "object") {
            fail("S016", "writeRecord() expects a record object.", {
                context: "data.datastore.writeRecord"
            });
        }

        const collection = this.validateCollection(record.collection, "data.datastore.writeRecord");
        const id = this.validateId(record.id, "data.datastore.writeRecord");
        const createdAt = record.createdAt || nowISO();
        const updatedAt = record.updatedAt || nowISO();
        const expiresAt = record.expiresAt || null;

        const normalizedRecord = {
            appId: this.appId,
            collection,
            id,
            payload: record.payload,
            createdAt,
            updatedAt,
            expiresAt
        };

        const engine = await this.ensureOpen("data.datastore.writeRecord");
        await engine.set(
            this.buildRecordKey(collection, id),
            stringifyJSON(normalizedRecord, "data.datastore.writeRecord")
        );

        return normalizedRecord;
    }

    async clearCollection(collection) {
        const safeCollection = this.validateCollection(collection, "data.datastore.clearCollection");
        const engine = await this.ensureOpen("data.datastore.clearCollection");
        return engine.clear(this.buildCollectionPrefix(safeCollection));
    }

    async clearAllRecords() {
        const engine = await this.ensureOpen("data.datastore.clearAllRecords");
        return engine.clear(`${this.recordPrefix}:`);
    }

    async migrate(targetVersion = this.schemaVersion) {
        const safeTargetVersion = Number(targetVersion);
        if (!Number.isInteger(safeTargetVersion) || safeTargetVersion < 0) {
            fail("S016", "targetVersion must be an integer >= 0.", {
                context: "data.datastore.migrate"
            });
        }

        await this.ensureOpen("data.datastore.migrate");

        const fromVersion = Number(this.meta?.schemaVersion) || 0;
        if (safeTargetVersion === fromVersion) {
            return {
                fromVersion,
                toVersion: safeTargetVersion,
                applied: []
            };
        }

        const migrationResult = await this.migrationRunner.run(fromVersion, safeTargetVersion, {
            store: this,
            engine: this.engine,
            appId: this.appId
        });

        const timestamp = nowISO();
        await this.writeMeta({
            ...this.meta,
            schemaVersion: safeTargetVersion,
            updatedAt: timestamp,
            lastMigrationAt: timestamp,
            lastAppliedMigrations: migrationResult.applied
        });

        return migrationResult;
    }

    async close() {
        if (!this.engine) {
            this.ready = false;
            this.openPromise = null;
            return;
        }

        await this.engine.close();
        this.ready = false;
        this.openPromise = null;
    }
}
