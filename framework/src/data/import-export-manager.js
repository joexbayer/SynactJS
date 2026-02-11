import { fail } from "../errors.js";
import { DataStore } from "./datastore.js";

function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
    }

    if (isPlainObject(value)) {
        const keys = Object.keys(value).sort();
        return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
    }

    return JSON.stringify(value);
}

function computeFNV1a32(input) {
    let hash = 0x811c9dc5;
    const text = String(input || "");

    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash.toString(16).padStart(8, "0");
}

function toTimestamp(value) {
    const time = Number(new Date(value).getTime());
    if (!Number.isFinite(time)) {
        return null;
    }

    return time;
}

function defaultConflictResolver({ existingRecord, incomingRecord }) {
    const existingTimestamp = toTimestamp(existingRecord?.updatedAt);
    const incomingTimestamp = toTimestamp(incomingRecord?.updatedAt);

    if (existingTimestamp == null && incomingTimestamp == null) {
        return "incoming";
    }

    if (existingTimestamp == null) {
        return "incoming";
    }

    if (incomingTimestamp == null) {
        return "existing";
    }

    return incomingTimestamp >= existingTimestamp ? "incoming" : "existing";
}

export class ImportExportManager {
    constructor({
        store,
        format = "synact.snapshot.v1",
        runtimeVersion = "0.0.0"
    } = {}) {
        if (!(store instanceof DataStore)) {
            fail("S016", "ImportExportManager requires a DataStore instance.", {
                context: "data.importExport.constructor"
            });
        }

        this.store = store;
        this.format = format;
        this.runtimeVersion = String(runtimeVersion || "0.0.0");
    }

    computeChecksum(snapshot) {
        const input = { ...snapshot };
        delete input.checksum;
        return `fnv1a32:${computeFNV1a32(stableSerialize(input))}`;
    }

    normalizeRecord(collection, record, context = "data.importExport.normalizeRecord") {
        if (!record || typeof record !== "object") {
            fail("S016", "Snapshot record must be an object.", { context, collection });
        }

        if (typeof record.id !== "string" || !record.id.trim()) {
            fail("S016", "Snapshot record.id must be a non-empty string.", {
                context,
                collection
            });
        }

        const createdAt = record.createdAt || new Date().toISOString();
        const updatedAt = record.updatedAt || createdAt;

        return {
            appId: this.store.appId,
            collection,
            id: record.id,
            payload: record.payload,
            createdAt,
            updatedAt,
            expiresAt: record.expiresAt || null
        };
    }

    async exportSnapshot(options = {}) {
        const {
            includeMeta = true,
            includeChecksum = true
        } = options;

        await this.store.open();
        const records = await this.store.listRecords();
        const collections = {};

        for (const record of records) {
            if (!collections[record.collection]) {
                collections[record.collection] = [];
            }

            collections[record.collection].push({
                id: record.id,
                payload: record.payload,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                expiresAt: record.expiresAt || null
            });
        }

        for (const items of Object.values(collections)) {
            items.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        }

        const snapshot = {
            format: this.format,
            appId: this.store.appId,
            exportedAt: new Date().toISOString(),
            schemaVersion: Number(this.store.getMeta()?.schemaVersion ?? this.store.schemaVersion ?? 0),
            runtimeVersion: this.runtimeVersion,
            collections
        };

        if (includeMeta) {
            snapshot.meta = this.store.getMeta();
        }

        if (includeChecksum) {
            snapshot.checksum = this.computeChecksum(snapshot);
        }

        return snapshot;
    }

    validateSnapshot(snapshot, options = {}) {
        const { verifyChecksum = true } = options;
        const errors = [];

        if (!snapshot || typeof snapshot !== "object") {
            errors.push("Snapshot must be an object.");
            return { valid: false, errors };
        }

        if (snapshot.format !== this.format) {
            errors.push(`Snapshot format must be \"${this.format}\".`);
        }

        if (typeof snapshot.appId !== "string" || !snapshot.appId.trim()) {
            errors.push("Snapshot appId must be a non-empty string.");
        }

        if (!Number.isInteger(Number(snapshot.schemaVersion)) || Number(snapshot.schemaVersion) < 0) {
            errors.push("Snapshot schemaVersion must be an integer >= 0.");
        }

        if (!isPlainObject(snapshot.collections)) {
            errors.push("Snapshot collections must be an object.");
        } else {
            for (const [collection, records] of Object.entries(snapshot.collections)) {
                if (!Array.isArray(records)) {
                    errors.push(`Collection \"${collection}\" must be an array.`);
                    continue;
                }

                for (const record of records) {
                    if (!record || typeof record !== "object") {
                        errors.push(`Collection \"${collection}\" contains an invalid record.`);
                        continue;
                    }

                    if (typeof record.id !== "string" || !record.id.trim()) {
                        errors.push(`Collection \"${collection}\" contains a record with invalid id.`);
                    }
                }
            }
        }

        if (verifyChecksum) {
            if (typeof snapshot.checksum !== "string" || !snapshot.checksum.trim()) {
                errors.push("Snapshot checksum is required when verifyChecksum=true.");
            } else {
                const expectedChecksum = this.computeChecksum(snapshot);
                if (snapshot.checksum !== expectedChecksum) {
                    errors.push("Snapshot checksum mismatch.");
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    resolveConflictDecision(onConflict, conflictContext) {
        if (typeof onConflict === "function") {
            return onConflict(conflictContext);
        }

        if (onConflict === "incoming") {
            return "incoming";
        }

        if (onConflict === "existing") {
            return "existing";
        }

        if (onConflict === "newest" || onConflict == null) {
            return defaultConflictResolver(conflictContext);
        }

        fail("S016", `Unsupported onConflict strategy \"${onConflict}\".`, {
            context: "data.importExport.import"
        });
    }

    async importSnapshot(snapshot, options = {}) {
        const {
            mode = "merge",
            dryRun = false,
            onConflict = "newest",
            verifyChecksum = true,
            allowAppIdMismatch = false,
            allowFutureSchema = false
        } = options;

        await this.store.open();

        const validation = this.validateSnapshot(snapshot, { verifyChecksum });
        if (!validation.valid) {
            fail("S016", "Invalid snapshot payload.", {
                context: "data.importExport.import",
                errors: validation.errors
            });
        }

        if (!allowAppIdMismatch && snapshot.appId !== this.store.appId) {
            fail("S016", "Snapshot appId does not match DataStore appId.", {
                context: "data.importExport.import",
                snapshotAppId: snapshot.appId,
                storeAppId: this.store.appId
            });
        }

        if (!allowFutureSchema && Number(snapshot.schemaVersion) > Number(this.store.schemaVersion)) {
            fail("S016", "Snapshot schemaVersion is newer than the configured DataStore schemaVersion.", {
                context: "data.importExport.import",
                snapshotSchemaVersion: Number(snapshot.schemaVersion),
                storeSchemaVersion: Number(this.store.schemaVersion)
            });
        }

        if (!mode || !["merge", "replace"].includes(mode)) {
            fail("S016", "import mode must be \"merge\" or \"replace\".", {
                context: "data.importExport.import",
                mode
            });
        }

        const report = {
            mode,
            dryRun: Boolean(dryRun),
            summary: {
                incoming: 0,
                created: 0,
                updated: 0,
                skipped: 0,
                deleted: 0,
                conflicts: 0
            },
            conflicts: []
        };

        if (mode === "replace") {
            const existingRecords = await this.store.listRecords();
            report.summary.deleted = existingRecords.length;

            if (!dryRun) {
                await this.store.clearAllRecords();
            }
        }

        const collectionEntries = Object.entries(snapshot.collections || {});
        for (const [collection, records] of collectionEntries) {
            for (const record of records) {
                const incomingRecord = this.normalizeRecord(collection, record);
                report.summary.incoming += 1;

                const existingRecord = await this.store.readRecord(collection, incomingRecord.id);
                if (!existingRecord) {
                    report.summary.created += 1;
                    if (!dryRun) {
                        await this.store.writeRecord(incomingRecord);
                    }
                    continue;
                }

                report.summary.conflicts += 1;
                const conflictContext = {
                    collection,
                    id: incomingRecord.id,
                    existingRecord,
                    incomingRecord
                };

                const decision = this.resolveConflictDecision(onConflict, conflictContext);
                if (decision === "existing") {
                    report.summary.skipped += 1;
                    report.conflicts.push({
                        collection,
                        id: incomingRecord.id,
                        decision: "existing"
                    });
                    continue;
                }

                if (decision === "incoming") {
                    report.summary.updated += 1;
                    report.conflicts.push({
                        collection,
                        id: incomingRecord.id,
                        decision: "incoming"
                    });
                    if (!dryRun) {
                        await this.store.writeRecord(incomingRecord);
                    }
                    continue;
                }

                if (isPlainObject(decision)) {
                    const patchedRecord = {
                        ...incomingRecord,
                        payload: decision,
                        createdAt: existingRecord.createdAt,
                        updatedAt: new Date().toISOString()
                    };

                    report.summary.updated += 1;
                    report.conflicts.push({
                        collection,
                        id: incomingRecord.id,
                        decision: "custom"
                    });

                    if (!dryRun) {
                        await this.store.writeRecord(patchedRecord);
                    }
                    continue;
                }

                fail("S016", "Conflict resolver must return \"incoming\", \"existing\", or an object payload.", {
                    context: "data.importExport.import",
                    collection,
                    id: incomingRecord.id
                });
            }
        }

        const snapshotSchemaVersion = Number(snapshot.schemaVersion) || 0;
        if (!dryRun && snapshotSchemaVersion > Number(this.store.getMeta()?.schemaVersion || 0)) {
            await this.store.migrate(snapshotSchemaVersion);
        }

        return report;
    }
}
