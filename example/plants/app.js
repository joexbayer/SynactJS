import { h, useCallback, useEffect, useMemo, useState, div, h1, p } from "./components/runtime.js";
import { AppShell } from "./components/app-shell.js";
import { HomeView } from "./components/home-view.js";
import { PlantListView } from "./components/plant-list-view.js";
import { PlantDetailView } from "./components/plant-detail-view.js";
import { JournalView } from "./components/journal-view.js";
import { SyncView } from "./components/sync-view.js";
import { SettingsView } from "./components/settings-view.js";
import { PlantContextService } from "./services/plant-context.js";
import { TimeOfDayService } from "./services/time-service.js";
import { PlantsRepository } from "./services/plants-repository.js";

const VIEW_IDS = ["home", "plants", "journal", "sync", "settings"];
const EMPTY_SYNC_STATE = {
    config: null,
    configured: false,
    authenticated: false,
    user: null,
    passphraseSet: false,
    lastSyncAt: null,
    lastSyncDirection: null,
    lastError: null
};

function normalizeView(view, fallback = "home") {
    if (VIEW_IDS.includes(view)) {
        return view;
    }
    return fallback;
}

function viewFromHash(hash, fallback = "home") {
    const value = String(hash || "").replace(/^#\/?/, "").trim();
    return normalizeView(value, fallback);
}

function pushHashView(view) {
    const safeView = normalizeView(view, "home");
    const nextHash = `#/${safeView}`;

    if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
    }
}

const dataApi = window.SynactJS?.data;
const syncApi = window.SynactJS?.sync;
if (!dataApi) {
    throw new Error("SynactJS.data is unavailable. Ensure ../../framework/synact.js is loaded before example/plants/app.js.");
}

const plantContext = new PlantContextService();
const clockService = new TimeOfDayService();
const repository = new PlantsRepository({ dataApi, appId: "synact-plants-realworld" });
const initialFilterOptions = plantContext.getFilterOptions();
const defaultFilters = {
    light: "all",
    difficulty: "all",
    petSafety: "all"
};

function App() {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    const [view, setView] = useState(() => viewFromHash(window.location.hash, "home"));
    const [plantsMode, setPlantsMode] = useState("list");
    const [now, setNow] = useState(() => clockService.getNow());

    const [settings, setSettings] = useState(null);
    const [myPlants, setMyPlants] = useState([]);
    const [entries, setEntries] = useState([]);
    const [syncState, setSyncState] = useState(() => ({ ...EMPTY_SYNC_STATE }));
    const [syncEnabled] = useState(() => Boolean(syncApi?.createFeatureService));

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [selectedCatalogId, setSelectedCatalogId] = useState("");
    const [selectedImagePayload, setSelectedImagePayload] = useState(null);

    const refreshAfterSyncPull = useCallback(async () => {
        const [nextSettings, nextPlants, nextEntries] = await Promise.all([
            repository.getSettings(),
            repository.listMyPlants(),
            repository.listJournalEntries()
        ]);

        setSettings(nextSettings);
        setMyPlants(nextPlants);
        setEntries(nextEntries);
    }, []);

    const syncFeature = useMemo(() => {
        if (!syncApi?.createFeatureService) {
            return null;
        }

        return syncApi.createFeatureService({
            dataApi,
            defaults: {
                baseUrl: "http://localhost:8787",
                appId: repository.appId,
                email: "",
                rememberAuth: true
            },
            configStorageKey: "synact-plants-sync-config",
            sessionStorageKey: "synact-plants-sync-session",
            readSettings: () => repository.getSettings(),
            writeSettings: (patch) => repository.updateSettings(patch),
            persistAuthEmail: false,
            afterPull: refreshAfterSyncPull,
            pushMetadataFactory: () => ({
                app: "plants",
                source: "plants-sync-view",
                pushedAt: new Date().toISOString()
            })
        });
    }, [refreshAfterSyncPull]);

    const refreshSyncState = useCallback(() => {
        if (!syncFeature) {
            setSyncState({ ...EMPTY_SYNC_STATE });
            return;
        }

        setSyncState(syncFeature.getSyncState());
    }, [syncFeature]);

    const configureAutoSync = useCallback(async ({ immediate = false } = {}) => {
        if (!syncFeature) {
            return null;
        }

        try {
            const result = await syncFeature.startAutoSync({
                immediate,
                onTick: () => {
                    refreshSyncState();
                },
                onError: (error) => {
                    refreshSyncState();
                    setStatus(`Auto sync failed: ${error?.message || String(error)}`);
                }
            });

            refreshSyncState();
            return result;
        } catch (error) {
            refreshSyncState();
            setStatus(`Auto sync setup failed: ${error?.message || String(error)}`);
            return null;
        }
    }, [refreshSyncState, syncFeature]);

    useEffect(() => {
        return clockService.startTicker(setNow, 30 * 1000);
    }, []);

    useEffect(() => {
        if (!status) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setStatus("");
        }, 3500);

        return () => clearTimeout(timer);
    }, [status]);

    useEffect(() => {
        const onHashChange = () => {
            setView((prev) => viewFromHash(window.location.hash, prev));
        };

        window.addEventListener("hashchange", onHashChange);
        onHashChange();

        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, []);

    const refreshPlants = useCallback(async () => {
        const records = await repository.listMyPlants();
        setMyPlants(records);
        return records;
    }, []);

    const refreshEntries = useCallback(async () => {
        const rows = await repository.listJournalEntries();
        setEntries(rows);
        return rows;
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function initialize() {
            try {
                await repository.init();

                const fullCatalog = plantContext.listCatalog({ search: "", filters: defaultFilters });
                await repository.seedStarterData(fullCatalog.map((plant) => plant.id));

                const [loadedSettings, loadedPlants, loadedEntries] = await Promise.all([
                    repository.getSettings(),
                    repository.listMyPlants(),
                    repository.listJournalEntries()
                ]);

                if (cancelled) return;

                setSettings(loadedSettings);
                setMyPlants(loadedPlants);
                setEntries(loadedEntries);

                const fallbackView = normalizeView(loadedSettings.preferredStartView || "home", "home");
                const initialView = viewFromHash(window.location.hash, fallbackView);
                setView(initialView);

                if (!window.location.hash) {
                    pushHashView(initialView);
                }

                if (loadedSettings.showOnlyPetSafe) {
                    setFilters((prev) => ({ ...prev, petSafety: "pet-safe" }));
                }

                if (fullCatalog[0]) {
                    const firstTracked = loadedPlants[0]?.payload?.catalogPlantId;
                    setSelectedCatalogId(firstTracked || fullCatalog[0].id);
                }

                if (syncFeature) {
                    await syncFeature.bootstrap({
                        restoreAuth: true,
                        refresh: true,
                        silent: true
                    });

                    if (cancelled) return;
                    refreshSyncState();
                    await configureAutoSync({ immediate: false });
                }

                setReady(true);
                setStatus("Plants app ready. Data is local-first and sync-enabled.");
            } catch (initError) {
                if (cancelled) return;
                setError(initError?.message || "Failed to initialize plants app.");
            }
        }

        initialize();

        return () => {
            cancelled = true;
            if (syncFeature) {
                syncFeature.stopAutoSync();
            }
            repository.close().catch(() => {});
        };
    }, [configureAutoSync, refreshSyncState, syncFeature]);

    const enrichedPlants = useMemo(() => {
        return (myPlants || [])
            .map((record) => plantContext.enrichMyPlantRecord(record))
            .filter(Boolean);
    }, [myPlants]);

    const entriesWithPlant = useMemo(() => {
        return (entries || []).map((entry) => ({
            ...entry,
            plantRecord: enrichedPlants.find((plantRecord) => plantRecord.id === entry?.payload?.plantId) || null
        }));
    }, [entries, enrichedPlants]);

    const effectiveFilters = useMemo(() => {
        const next = { ...filters };
        if (settings?.showOnlyPetSafe) {
            next.petSafety = "pet-safe";
        }
        return next;
    }, [filters, settings?.showOnlyPetSafe]);

    const catalogPlants = useMemo(() => {
        return plantContext.listCatalog({
            search,
            filters: effectiveFilters
        });
    }, [search, effectiveFilters.light, effectiveFilters.difficulty, effectiveFilters.petSafety]);

    const selectedPlant = useMemo(() => {
        if (selectedCatalogId) {
            return plantContext.getPlantById(selectedCatalogId);
        }
        return catalogPlants[0] || null;
    }, [selectedCatalogId, catalogPlants]);

    const selectedMyPlant = useMemo(() => {
        if (!selectedPlant) return null;
        return enrichedPlants.find((record) => record?.payload?.catalogPlantId === selectedPlant.id) || null;
    }, [enrichedPlants, selectedPlant]);

    useEffect(() => {
        let cancelled = false;

        async function loadImage() {
            if (!selectedMyPlant?.payload?.imageId) {
                setSelectedImagePayload(null);
                return;
            }

            try {
                const image = await repository.readPlantImage(selectedMyPlant.payload.imageId);
                if (!cancelled) {
                    setSelectedImagePayload(image);
                }
            } catch (_) {
                if (!cancelled) {
                    setSelectedImagePayload(null);
                }
            }
        }

        loadImage();

        return () => {
            cancelled = true;
        };
    }, [selectedMyPlant?.payload?.imageId]);

    const navigate = useCallback((nextView) => {
        const safeView = normalizeView(nextView, view);
        setView(safeView);
        pushHashView(safeView);
    }, [view]);

    async function handleAddPlant(catalogPlantId) {
        try {
            const existing = enrichedPlants.find((record) => record?.payload?.catalogPlantId === catalogPlantId);
            if (existing) {
                setSelectedCatalogId(catalogPlantId);
                setPlantsMode("detail");
                return;
            }

            await repository.upsertMyPlant({
                catalogPlantId,
                nickname: "",
                room: "",
                notes: "",
                wateringCadence: plantContext.getPlantById(catalogPlantId)?.water || "every-1-week"
            });

            await refreshPlants();
            setSelectedCatalogId(catalogPlantId);
            setPlantsMode("detail");
            setStatus("Plant added to your local collection.");
        } catch (actionError) {
            setStatus(actionError?.message || "Unable to add plant.");
        }
    }

    async function handleSavePlant(draft) {
        try {
            const payload = {
                id: draft.id || selectedMyPlant?.id,
                catalogPlantId: draft.catalogPlantId || selectedPlant?.id,
                nickname: draft.nickname,
                room: draft.room,
                notes: draft.notes,
                wateringCadence: draft.wateringCadence,
                imageId: selectedMyPlant?.payload?.imageId || null,
                lastWateredAt: selectedMyPlant?.payload?.lastWateredAt || null,
                wateringCount: selectedMyPlant?.payload?.wateringCount || 0
            };

            await repository.upsertMyPlant(payload);
            await refreshPlants();
            setStatus("Plant details saved.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to save plant details.");
        }
    }

    async function handleMarkWatered(plantId) {
        try {
            await repository.markPlantWatered(plantId);
            await refreshPlants();
            setStatus("Watering log updated.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to mark watering.");
        }
    }

    async function handleRemovePlant(plantId) {
        if (!window.confirm("Remove this plant from your local collection?")) {
            return;
        }

        try {
            await repository.removeMyPlant(plantId);
            const plants = await refreshPlants();
            const fallbackCatalogId = plants[0]?.payload?.catalogPlantId || catalogPlants[0]?.id || "";
            setSelectedCatalogId(fallbackCatalogId);
            setPlantsMode("list");
            setStatus("Plant removed.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to remove plant.");
        }
    }

    async function handleUploadImage(plantId, file) {
        try {
            await repository.writePlantImage(plantId, file);
            await refreshPlants();
            setStatus("Image stored in local app data.");
        } catch (actionError) {
            setStatus(actionError?.message || "Unable to store image.");
        }
    }

    async function handleAddJournalEntry(entry) {
        try {
            await repository.addJournalEntry(entry);
            await refreshEntries();
            setStatus("Journal entry saved.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to save journal entry.");
        }
    }

    async function handleDeleteJournalEntry(entryId) {
        try {
            await repository.deleteJournalEntry(entryId);
            await refreshEntries();
            setStatus("Journal entry deleted.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to delete journal entry.");
        }
    }

    async function handleSaveSettings(nextSettings) {
        try {
            const saved = await repository.updateSettings(nextSettings);
            setSettings(saved);

            if (syncFeature) {
                await syncFeature.bootstrap({ restoreAuth: false });
                refreshSyncState();
                await configureAutoSync({ immediate: false });
            }

            setStatus("Settings saved.");
        } catch (actionError) {
            setStatus(actionError?.message || "Failed to save settings.");
        }
    }

    async function handleSyncAuth(mode, values = {}) {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            const result = await syncFeature.authenticate(mode, values, {
                autoPull: Boolean(values.autoPull),
                importOptions: { mode: "merge", onConflict: "newest" }
            });

            if (result?.settings) {
                setSettings(result.settings);
            }

            refreshSyncState();
            await configureAutoSync({ immediate: false });
            setStatus(mode === "register" ? "Registered and synced session initialized." : "Logged in and sync session ready.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Authentication failed.");
        }
    }

    async function handleRestoreSyncSession() {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            const result = await syncFeature.restoreAuth({ refresh: true, silent: true });
            refreshSyncState();

            if (result.restored) {
                await configureAutoSync({ immediate: false });
            } else {
                syncFeature.stopAutoSync();
            }

            setStatus(result.restored ? "Restored saved sync session." : "No saved sync session found.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Failed to restore sync session.");
        }
    }

    async function handleSyncPush() {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            await syncFeature.pushData();
            refreshSyncState();
            setStatus("Pushed local snapshot to sync server.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Push failed.");
        }
    }

    async function handleSyncPull() {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            const pulled = await syncFeature.pullData({
                importOptions: { mode: "merge", onConflict: "newest" }
            });

            if (pulled?.result?.snapshot) {
                setStatus("Pulled and merged remote snapshot.");
            } else {
                setStatus("No remote snapshot available yet for this appId.");
            }

            refreshSyncState();
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Pull failed.");
        }
    }

    async function handleSyncBoth() {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            await syncFeature.sync({
                direction: "both",
                pullOptions: {
                    importOptions: { mode: "merge", onConflict: "newest" }
                }
            });

            refreshSyncState();
            setStatus("Completed pull + push sync cycle.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Full sync failed.");
        }
    }

    async function handleSyncLogout() {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            await syncFeature.logout({ clearStorage: true });
            syncFeature.stopAutoSync();
            refreshSyncState();
            setStatus("Sync session logged out.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Logout failed.");
        }
    }

    async function handleSyncSetPassphrase(passphrase) {
        if (!syncFeature) {
            setStatus("Sync feature service is unavailable in this runtime build.");
            return;
        }

        try {
            syncFeature.setPassphrase(passphrase);
            refreshSyncState();
            await configureAutoSync({ immediate: false });
            setStatus("Encryption passphrase set for this device session.");
        } catch (actionError) {
            refreshSyncState();
            setStatus(actionError?.message || "Unable to set passphrase.");
        }
    }

    async function handleResetData() {
        if (!window.confirm("Reset all local data for this plants app?")) {
            return;
        }

        try {
            await repository.clearAllData();
            await repository.seedStarterData(plantContext.listCatalog({ search: "", filters: defaultFilters }).map((plant) => plant.id));

            const [resetSettings, resetPlants, resetEntries] = await Promise.all([
                repository.getSettings(),
                repository.listMyPlants(),
                repository.listJournalEntries()
            ]);

            setSettings(resetSettings);
            setMyPlants(resetPlants);
            setEntries(resetEntries);
            setSelectedCatalogId(resetPlants[0]?.payload?.catalogPlantId || "");

            if (syncFeature) {
                await syncFeature.bootstrap({
                    restoreAuth: false
                });
                syncFeature.stopAutoSync();
                refreshSyncState();
            }

            setStatus("Local data reset complete.");
        } catch (actionError) {
            setStatus(actionError?.message || "Reset failed.");
        }
    }

    const dayPart = clockService.getDayPart(now);
    const dayPartTip = plantContext.getDayPartTip(dayPart);
    const timeLabel = clockService.formatHeaderLabel(now);
    const todayMessage = `${clockService.formatDate(now)} routine: ${dayPartTip}`;

    if (error) {
        return div(
            {
                className: "m-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
            },
            h1({ className: "text-lg font-bold" }, "Plants app failed to load"),
            p({ className: "mt-2 text-sm" }, error)
        );
    }

    if (!ready) {
        return div(
            {
                className: "m-6 rounded-xl border border-slate-200 bg-white p-4"
            },
            h1({ className: "text-lg font-bold text-slate-800" }, "Loading app data..."),
            p({ className: "mt-2 text-sm text-slate-600" }, "Initializing local storage, settings, and starter data.")
        );
    }

    let viewContent = null;

    if (view === "home") {
        viewContent = h(HomeView, {
            ownerName: settings?.ownerName,
            dayPart,
            dayPartTip,
            todayMessage,
            myPlants: enrichedPlants,
            recentEntries: entriesWithPlant,
            onOpenPlant: (record) => {
                setSelectedCatalogId(record?.payload?.catalogPlantId || "");
                setPlantsMode("detail");
                navigate("plants");
            },
            onNavigatePlants: () => navigate("plants")
        });
    }

    if (view === "plants") {
        viewContent = plantsMode === "detail"
            ? h(PlantDetailView, {
                plant: selectedPlant,
                myPlantRecord: selectedMyPlant,
                imagePayload: selectedImagePayload,
                onBack: () => setPlantsMode("list"),
                onSave: handleSavePlant,
                onMarkWatered: handleMarkWatered,
                onRemove: handleRemovePlant,
                onUploadImage: handleUploadImage
            })
            : h(PlantListView, {
                search,
                filters: effectiveFilters,
                filterOptions: initialFilterOptions,
                catalogPlants,
                myPlants: enrichedPlants,
                onSearchChange: setSearch,
                onFilterChange: (field, value) => {
                    setFilters((prev) => ({ ...prev, [field]: value }));
                },
                onSelectPlant: (catalogPlantId) => {
                    setSelectedCatalogId(catalogPlantId);
                    setPlantsMode("detail");
                },
                onOpenMyPlant: (record) => {
                    setSelectedCatalogId(record?.payload?.catalogPlantId || "");
                    setPlantsMode("detail");
                },
                onAddPlant: handleAddPlant
            });
    }

    if (view === "journal") {
        viewContent = h(JournalView, {
            entries: entriesWithPlant,
            myPlants: enrichedPlants,
            onAddEntry: handleAddJournalEntry,
            onDeleteEntry: handleDeleteJournalEntry
        });
    }

    if (view === "sync") {
        viewContent = h(SyncView, {
            settings,
            syncSupported: syncEnabled,
            syncState,
            onRegister: (values) => handleSyncAuth("register", values),
            onLogin: (values) => handleSyncAuth("login", values),
            onRestore: handleRestoreSyncSession,
            onLogout: handleSyncLogout,
            onSetPassphrase: handleSyncSetPassphrase,
            onPush: handleSyncPush,
            onPull: handleSyncPull,
            onSyncBoth: handleSyncBoth
        });
    }

    if (view === "settings") {
        viewContent = h(SettingsView, {
            settings,
            onSaveSettings: handleSaveSettings,
            onResetData: handleResetData,
            storageEngineName: repository.getStorageEngineName()
        });
    }

    return h(AppShell, {
        title: "Plants Local",
        subtitle: "Mobile-first static PWA app powered by SynactJS",
        view,
        onNavigate: navigate,
        timeLabel,
        dayPartTip,
        status,
        accentColor: settings?.accentColor,
        children: viewContent
    });
}

window.SynactJS.start({
    app: App,
    container: "#app",
    waitForDom: true,
    once: true
}).catch((bootstrapError) => {
    const container = document.querySelector("#app");
    if (!container) return;

    container.innerHTML = `<pre style="padding:12px;border:1px solid #fecaca;background:#fff1f2;color:#9f1239;white-space:pre-wrap;">Failed to start app\n${bootstrapError?.message || String(bootstrapError)}</pre>`;
});
