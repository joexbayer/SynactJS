import { DataStore } from "./datastore.js";
import { StorageEngine } from "./storage-engine.js";
import { IndexedDBStorageEngine } from "./indexeddb-storage-engine.js";
import { LocalStorageEngine } from "./localstorage-storage-engine.js";
import { MigrationRunner } from "./migration-runner.js";
import { ImportExportManager } from "./import-export-manager.js";

export async function createDataStore(config = {}) {
    return DataStore.create(config);
}

export function createImportExportManager({ store, ...options } = {}) {
    return new ImportExportManager({ store, ...options });
}

export function createStorageEngine(options = {}) {
    const { engine = "auto" } = options;

    if (engine instanceof StorageEngine) {
        return engine;
    }

    if (engine === "indexeddb") {
        return new IndexedDBStorageEngine(options);
    }

    if (engine === "localstorage") {
        return new LocalStorageEngine(options);
    }

    if (engine === "auto") {
        if (typeof indexedDB !== "undefined") {
            return new IndexedDBStorageEngine(options);
        }
        return new LocalStorageEngine(options);
    }

    return null;
}

export const dataHelpers = {
    createDataStore,
    createImportExportManager,
    createStorageEngine,
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
};

export {
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
};
