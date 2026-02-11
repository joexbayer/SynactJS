export class PlantsRepository {
    constructor({ dataApi, appId = "synact-plants-demo", schemaVersion = 1 } = {}) {
        if (!dataApi) {
            throw new Error("PlantsRepository requires SynactJS.data API.");
        }

        this.dataApi = dataApi;
        this.appId = appId;
        this.schemaVersion = schemaVersion;
        this.ready = false;

        this.collections = {
            plants: "plants",
            journal: "journal",
            settings: "settings",
            images: "images"
        };

        this.settingsId = "app-settings";
    }

    async init() {
        await this.dataApi.close().catch(() => {});

        await this.dataApi.init({
            appId: this.appId,
            engine: "auto",
            schemaVersion: this.schemaVersion,
            migrations: []
        });

        this.ready = true;
        await this.ensureSettings();
        return this;
    }

    ensureReady(context = "plants.repository") {
        if (!this.ready) {
            throw new Error(`Repository not initialized (${context}).`);
        }
    }

    createId(prefix) {
        const time = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 8);
        return `${prefix}-${time}-${random}`;
    }

    defaultSettings() {
        return {
            ownerName: "Plant Keeper",
            preferredStartView: "home",
            accentColor: "emerald",
            compactMode: false,
            showOnlyPetSafe: false,
            showScientificNames: true,
            syncServerUrl: "http://localhost:8787",
            syncAppId: this.appId,
            syncEmail: "",
            syncRememberAuth: true,
            syncAutoEnabled: false,
            syncAutoIntervalMinutes: 30,
            syncAutoDirection: "both"
        };
    }

    async ensureSettings() {
        this.ensureReady("ensureSettings");

        const existing = await this.dataApi.read(this.collections.settings, this.settingsId);
        if (existing) {
            return existing;
        }

        const defaults = this.defaultSettings();
        await this.dataApi.write(this.collections.settings, this.settingsId, defaults);
        return defaults;
    }

    async getSettings() {
        this.ensureReady("getSettings");
        return this.ensureSettings();
    }

    async updateSettings(patch) {
        this.ensureReady("updateSettings");
        const current = await this.ensureSettings();
        const next = { ...current, ...(patch || {}) };
        await this.dataApi.write(this.collections.settings, this.settingsId, next);
        return next;
    }

    async listMyPlants() {
        this.ensureReady("listMyPlants");
        return this.dataApi.query(this.collections.plants, {
            withMeta: true,
            sortBy: "updatedAt",
            sortDirection: "desc"
        });
    }

    async upsertMyPlant(input = {}) {
        this.ensureReady("upsertMyPlant");

        if (!input.catalogPlantId) {
            throw new Error("catalogPlantId is required to save a plant.");
        }

        const id = input.id || this.createId("plant");
        const existing = input.id
            ? await this.dataApi.read(this.collections.plants, input.id)
            : null;

        const payload = {
            catalogPlantId: input.catalogPlantId,
            nickname: String(input.nickname || existing?.nickname || "").trim(),
            room: String(input.room || existing?.room || "").trim(),
            notes: String(input.notes || existing?.notes || "").trim(),
            wateringCadence: input.wateringCadence || existing?.wateringCadence || "every-1-week",
            imageId: input.imageId || existing?.imageId || null,
            lastWateredAt: input.lastWateredAt || existing?.lastWateredAt || null,
            wateringCount: Number(input.wateringCount ?? existing?.wateringCount ?? 0)
        };

        await this.dataApi.write(this.collections.plants, id, payload);
        return { id, payload };
    }

    async removeMyPlant(plantRecordId) {
        this.ensureReady("removeMyPlant");
        const existing = await this.dataApi.read(this.collections.plants, plantRecordId);

        if (existing?.imageId) {
            await this.dataApi.delete(this.collections.images, existing.imageId);
        }

        await this.dataApi.delete(this.collections.plants, plantRecordId);
    }

    async markPlantWatered(plantRecordId, wateredAt = new Date().toISOString()) {
        this.ensureReady("markPlantWatered");

        await this.dataApi.update(this.collections.plants, plantRecordId, (payload = {}) => ({
            ...payload,
            lastWateredAt: wateredAt,
            wateringCount: Number(payload.wateringCount || 0) + 1
        }));
    }

    async writePlantImage(plantRecordId, fileOrDataUrl) {
        this.ensureReady("writePlantImage");

        if (!plantRecordId) {
            throw new Error("plantRecordId is required for image upload.");
        }

        const imageId = this.createId("image");
        await this.dataApi.writeImage(this.collections.images, imageId, fileOrDataUrl, {
            alt: "Plant photo",
            meta: { plantRecordId }
        });

        await this.dataApi.update(this.collections.plants, plantRecordId, (payload = {}) => ({
            ...payload,
            imageId
        }));

        return imageId;
    }

    async readPlantImage(imageId) {
        this.ensureReady("readPlantImage");

        if (!imageId) {
            return null;
        }

        return this.dataApi.readImage(this.collections.images, imageId);
    }

    async listJournalEntries() {
        this.ensureReady("listJournalEntries");
        return this.dataApi.query(this.collections.journal, {
            withMeta: true,
            sortBy: "updatedAt",
            sortDirection: "desc"
        });
    }

    async addJournalEntry(entry = {}) {
        this.ensureReady("addJournalEntry");

        if (!entry.plantId) {
            throw new Error("plantId is required for journal entry.");
        }

        const id = this.createId("journal");
        const payload = {
            plantId: entry.plantId,
            mood: entry.mood || "steady",
            note: String(entry.note || "").trim(),
            createdAt: new Date().toISOString()
        };

        await this.dataApi.write(this.collections.journal, id, payload);
        return { id, payload };
    }

    async deleteJournalEntry(entryId) {
        this.ensureReady("deleteJournalEntry");
        await this.dataApi.delete(this.collections.journal, entryId);
    }

    async seedStarterData(catalogIds = []) {
        this.ensureReady("seedStarterData");

        const existingPlants = await this.listMyPlants();
        if (existingPlants.length > 0) {
            return;
        }

        const seedIds = catalogIds.slice(0, 2);
        for (const catalogPlantId of seedIds) {
            await this.upsertMyPlant({
                catalogPlantId,
                nickname: "",
                room: "",
                notes: "",
                wateringCadence: "every-1-week"
            });
        }
    }

    async exportSnapshot() {
        this.ensureReady("exportSnapshot");
        return this.dataApi.export();
    }

    validateSnapshot(snapshot) {
        this.ensureReady("validateSnapshot");
        return this.dataApi.validateSnapshot(snapshot, { verifyChecksum: true });
    }

    async importSnapshot(snapshot, { mode = "merge", dryRun = false } = {}) {
        this.ensureReady("importSnapshot");
        return this.dataApi.import(snapshot, {
            mode,
            dryRun,
            onConflict: "newest"
        });
    }

    async clearAllData() {
        this.ensureReady("clearAllData");

        await this.dataApi.clearCollection(this.collections.journal);
        await this.dataApi.clearCollection(this.collections.plants);
        await this.dataApi.clearCollection(this.collections.images);
        await this.dataApi.clearCollection(this.collections.settings);
        await this.ensureSettings();
    }

    getStorageEngineName() {
        return this.dataApi?.store?.engine?.name || "unknown";
    }

    async close() {
        this.ready = false;
        await this.dataApi.close();
    }
}
