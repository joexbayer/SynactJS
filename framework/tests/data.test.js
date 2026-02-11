const {
    createDataStore,
    LocalStorageEngine,
    ImportExportManager,
    SynactJS
} = require("../synact.js");
const { resetDOM } = require("./helpers");

describe("data layer", () => {
    afterEach(async () => {
        try {
            await SynactJS.data.close();
        } catch (_) {
            // no-op for cleanup
        }
        localStorage.clear();
        resetDOM();
    });

    it("LocalStorageEngine supports CRUD, listing, clear, and rollback transactions", async () => {
        const engine = new LocalStorageEngine({ namespace: "synact-test-engine" });
        await engine.open();

        await engine.set("a", "1");
        await engine.set("b", "2");

        expect(await engine.get("a")).toBe("1");

        const entries = await engine.list("");
        expect(entries.find((entry) => entry.key === "a")?.value).toBe("1");
        expect(entries.find((entry) => entry.key === "b")?.value).toBe("2");

        SynactJS.configure({ logErrors: false });
        await expect(engine.transaction([
            { type: "set", key: "a", value: "3" },
            { type: "invalid", key: "b" }
        ])).rejects.toThrow();
        SynactJS.configure({ logErrors: true });

        expect(await engine.get("a")).toBe("1");

        const removed = await engine.clear("");
        expect(removed).toBe(2);
        expect(await engine.get("a")).toBeNull();

        await engine.close();
    });

    it("DataStore supports write, read, update, query, and delete", async () => {
        const store = await createDataStore({
            appId: "synact-test-crud",
            engine: "localstorage",
            schemaVersion: 1
        });

        await store.write("tasks", "task-1", { title: "Buy milk", done: false });
        expect(await store.read("tasks", "task-1")).toEqual({ title: "Buy milk", done: false });

        await store.update("tasks", "task-1", { done: true });
        expect(await store.read("tasks", "task-1")).toEqual({ title: "Buy milk", done: true });

        const results = await store.query("tasks");
        expect(results).toEqual([{ title: "Buy milk", done: true }]);

        const deleted = await store.delete("tasks", "task-1");
        expect(deleted).toBe(true);
        expect(await store.read("tasks", "task-1")).toBeNull();

        await store.close();
    });

    it("DataStore applies migrations up to target schema version", async () => {
        const initialStore = await createDataStore({
            appId: "synact-test-migrations",
            engine: "localstorage",
            schemaVersion: 1
        });
        await initialStore.close();

        const migratedStore = await createDataStore({
            appId: "synact-test-migrations",
            engine: "localstorage",
            schemaVersion: 3,
            migrations: [
                {
                    version: 2,
                    up: async ({ store }) => {
                        const value = (await store.read("meta", "counter")) || 0;
                        await store.write("meta", "counter", value + 1);
                    }
                },
                {
                    version: 3,
                    up: async ({ store }) => {
                        const value = (await store.read("meta", "counter")) || 0;
                        await store.write("meta", "counter", value + 1);
                    }
                }
            ]
        });

        expect(await migratedStore.read("meta", "counter")).toBe(2);
        expect(migratedStore.getMeta().schemaVersion).toBe(3);

        await migratedStore.close();
    });

    it("SynactJS.data init stores active DataStore instance", async () => {
        const store = await SynactJS.data.init({
            appId: "synact-test-api",
            engine: "localstorage",
            schemaVersion: 1
        });

        expect(SynactJS.data.store).toBe(store);
        await SynactJS.data.close();
        expect(SynactJS.data.store).toBeNull();
    });

    it("exports snapshot and imports into another store", async () => {
        const sourceStore = await createDataStore({
            appId: "synact-test-transfer",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-transfer-source"
        });
        await sourceStore.write("tasks", "a", { title: "Alpha", done: false });
        await sourceStore.write("tasks", "b", { title: "Beta", done: true });
        await sourceStore.write("profile", "me", { name: "Synact" });

        const exporter = new ImportExportManager({ store: sourceStore, runtimeVersion: "test" });
        const snapshot = await exporter.exportSnapshot();
        expect(snapshot.format).toBe("synact.snapshot.v1");
        expect(snapshot.checksum).toMatch(/^fnv1a32:/);
        expect(snapshot.collections.tasks.length).toBe(2);

        const targetStore = await createDataStore({
            appId: "synact-test-transfer",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-transfer-target"
        });
        const importer = new ImportExportManager({ store: targetStore, runtimeVersion: "test" });
        const report = await importer.importSnapshot(snapshot, { mode: "replace" });

        expect(report.summary.incoming).toBe(3);
        expect(report.summary.created).toBe(3);
        expect(await targetStore.read("tasks", "a")).toEqual({ title: "Alpha", done: false });
        expect(await targetStore.read("profile", "me")).toEqual({ name: "Synact" });

        await sourceStore.close();
        await targetStore.close();
    });

    it("supports dry-run import with conflict reporting and no writes", async () => {
        const store = await createDataStore({
            appId: "synact-test-dryrun",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-dryrun"
        });
        await store.write("tasks", "a", { title: "Current", done: true });

        const manager = new ImportExportManager({ store });
        const snapshot = await manager.exportSnapshot();
        snapshot.collections.tasks[0].payload = { title: "Incoming", done: false };
        snapshot.checksum = manager.computeChecksum(snapshot);

        const dryRunReport = await manager.importSnapshot(snapshot, { dryRun: true, onConflict: "incoming" });
        expect(dryRunReport.summary.updated).toBe(1);
        expect((await store.read("tasks", "a")).done).toBe(true);

        await store.close();
    });

    it("validates snapshot checksum and rejects tampered payload", async () => {
        const store = await createDataStore({
            appId: "synact-test-checksum",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-checksum"
        });
        await store.write("items", "x", { value: 1 });

        const manager = new ImportExportManager({ store });
        const snapshot = await manager.exportSnapshot();

        const tampered = {
            ...snapshot,
            collections: {
                ...snapshot.collections,
                items: [{ ...snapshot.collections.items[0], payload: { value: 99 } }]
            }
        };

        const validation = manager.validateSnapshot(tampered, { verifyChecksum: true });
        expect(validation.valid).toBe(false);
        expect(validation.errors.join(" ")).toContain("checksum");
        SynactJS.configure({ logErrors: false });
        await expect(manager.importSnapshot(tampered)).rejects.toThrow();
        SynactJS.configure({ logErrors: true });

        await store.close();
    });

    it("SynactJS.data export/import APIs work after init", async () => {
        await SynactJS.data.init({
            appId: "synact-test-public-import-export",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-public-a"
        });
        await SynactJS.data.store.write("notes", "n1", { body: "hello" });
        const snapshot = await SynactJS.data.export();

        await SynactJS.data.close();
        await SynactJS.data.init({
            appId: "synact-test-public-import-export",
            engine: "localstorage",
            schemaVersion: 1,
            namespace: "synact-public-b"
        });

        const report = await SynactJS.data.import(snapshot, { mode: "replace" });
        expect(report.summary.created).toBe(1);
        expect(await SynactJS.data.store.read("notes", "n1")).toEqual({ body: "hello" });
    });
});
