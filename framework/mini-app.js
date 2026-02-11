(function () {
    const APP_CONFIG = {
        appId: "synact-root-mini-app",
        collection: "tasks",
        title: "Synact Mini App",
        subtitle: "PWA-first local app starter"
    };
    const UI_SETTINGS_KEY = "synact-mini-ui-settings";

    const VIEWS = {
        tasks: "tasks",
        backup: "backup",
        settings: "settings"
    };

    const DEFAULT_TASKS = [
        { title: "Create your first task", done: false },
        { title: "Open Backup view and export a snapshot", done: false }
    ];

    class TaskDataClient {
        constructor({ dataApi, appId, collection }) {
            this.dataApi = dataApi;
            this.appId = appId;
            this.collection = collection;
            this.ready = false;
        }

        async init() {
            try {
                await this.dataApi.close();
            } catch (_) {
                // Ignore stale close errors before init.
            }

            await this.dataApi.init({
                appId: this.appId,
                // localStorage is the most reliable default when opening this file directly.
                engine: "localstorage",
                schemaVersion: 1,
                migrations: []
            });

            this.ready = true;
            return this;
        }

        ensureReady() {
            if (!this.ready || !this.dataApi.store) {
                throw new Error("Data store is not initialized.");
            }
        }

        async seedIfEmpty(defaultTasks) {
            this.ensureReady();
            const records = await this.list();
            if (records.length > 0) return;

            for (const task of defaultTasks) {
                await this.add(task.title, Boolean(task.done));
            }
        }

        async list() {
            this.ensureReady();
            const records = await this.dataApi.store.listRecords(this.collection);
            return [...records].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        }

        async add(title, done = false) {
            this.ensureReady();
            const safeTitle = String(title || "").trim();
            if (!safeTitle) {
                throw new Error("Task title is required.");
            }

            await this.dataApi.store.write(this.collection, this.createTaskId(), {
                title: safeTitle,
                done: Boolean(done)
            });
        }

        async toggle(id) {
            this.ensureReady();
            await this.dataApi.store.update(this.collection, id, (payload = {}) => ({
                ...payload,
                done: !payload.done
            }));
        }

        async remove(id) {
            this.ensureReady();
            await this.dataApi.store.delete(this.collection, id);
        }

        async clear() {
            this.ensureReady();
            await this.dataApi.store.clearCollection(this.collection);
        }

        async exportSnapshot() {
            this.ensureReady();
            return this.dataApi.export();
        }

        validateSnapshot(snapshot) {
            this.ensureReady();
            return this.dataApi.validateSnapshot(snapshot, { verifyChecksum: true });
        }

        async importSnapshot(snapshot, { mode = "merge", dryRun = false, onConflict = "newest" } = {}) {
            this.ensureReady();
            return this.dataApi.import(snapshot, { mode, dryRun, onConflict });
        }

        createTaskId() {
            const time = Date.now().toString(36);
            const random = Math.random().toString(36).slice(2, 8);
            return `task-${time}-${random}`;
        }
    }

    function parseSnapshot(text) {
        try {
            return JSON.parse(text || "");
        } catch (_) {
            throw new Error("Snapshot JSON is invalid.");
        }
    }

    function downloadJson(filename, text) {
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function summarizeImport(report, prefix) {
        const summary = report?.summary || {};
        return [
            prefix,
            `incoming=${summary.incoming || 0}`,
            `created=${summary.created || 0}`,
            `updated=${summary.updated || 0}`,
            `skipped=${summary.skipped || 0}`,
            `deleted=${summary.deleted || 0}`
        ].join(" | ");
    }

    function countDone(tasks) {
        return tasks.filter((record) => Boolean(record?.payload?.done)).length;
    }

    function readUiSettings() {
        try {
            const parsed = JSON.parse(localStorage.getItem(UI_SETTINGS_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function writeUiSettings(settings) {
        try {
            localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
        } catch (_) {
            // Ignore storage failures for non-critical UI settings.
        }
    }

    function AppButton({ variant = "default", className = "", type = "button", ...props }) {
        return SynactLib.Button({
            variant,
            type,
            className: `mini-action-btn ${className}`.trim(),
            ...props
        });
    }

    function ActionGrid(children) {
        return div({ className: "mini-action-grid" }, ...children);
    }

    function MiniSelect({
        label: labelText,
        value,
        options = [],
        onChange,
        disabled = false
    }) {
        const [open, setOpen] = useState(false);
        const selectId = useMemo(() => `mini-select-${Math.random().toString(36).slice(2, 9)}`, []);
        const safeOptions = Array.isArray(options) ? options : [];
        const selected = safeOptions.find((item) => String(item.value) === String(value)) || safeOptions[0] || null;

        useEffect(() => {
            if (!open) return undefined;

            function onDocumentClick(event) {
                const container = event.target?.closest?.(`[data-mini-select-id="${selectId}"]`);
                if (!container) {
                    setOpen(false);
                }
            }

            function onDocumentKeyDown(event) {
                if (event.key === "Escape") {
                    setOpen(false);
                }
            }

            document.addEventListener("click", onDocumentClick);
            document.addEventListener("keydown", onDocumentKeyDown);
            return () => {
                document.removeEventListener("click", onDocumentClick);
                document.removeEventListener("keydown", onDocumentKeyDown);
            };
        }, [open, selectId]);

        return div({ className: "mini-select-field" },
            labelText ? label({ className: "synact-label" }, labelText) : null,
            div({ className: "mini-select-wrap", "data-mini-select-id": selectId },
                button({
                    type: "button",
                    className: `mini-select-trigger ${open ? "mini-select-trigger-open" : ""}`,
                    onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!disabled) {
                            setOpen((prev) => !prev);
                        }
                    },
                    disabled
                },
                span({ className: "mini-select-value" }, selected ? selected.label : "Select"),
                span({ className: "mini-select-caret" }, open ? "\u25B2" : "\u25BC")
                ),
                open ? div({ className: "mini-select-menu" },
                    ...safeOptions.map((item) => button({
                        type: "button",
                        className: `mini-select-option ${String(item.value) === String(value) ? "mini-select-option-active" : ""}`,
                        onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpen(false);
                            if (typeof onChange === "function") {
                                onChange(item.value, item);
                            }
                        }
                    }, String(item.label)))
                ) : null
            )
        );
    }

    function MiniApp() {
        const client = useMemo(() => new TaskDataClient({
            dataApi: SynactJS.data,
            appId: APP_CONFIG.appId,
            collection: APP_CONFIG.collection
        }), []);

        const online = useOnlineStatus();

        const [view, setView] = useState(VIEWS.tasks);
        const [loading, setLoading] = useState(true);
        const [ready, setReady] = useState(false);
        const [busy, setBusy] = useState(false);

        const [tasks, setTasks] = useState([]);
        const [filter, setFilter] = useState("all");

        const [snapshotText, setSnapshotText] = useState("");
        const [importMode, setImportMode] = useState("merge");

        const [notice, setNotice] = useState("");
        const [error, setError] = useState("");
        const [appTitle, setAppTitle] = useState(APP_CONFIG.title);
        const [appSubtitle, setAppSubtitle] = useState(APP_CONFIG.subtitle);
        const [primaryColor, setPrimaryColor] = useState("#2563eb");
        const [surfaceColor, setSurfaceColor] = useState("#ffffff");
        const [textColor, setTextColor] = useState("#0f172a");
        const [backgroundColor, setBackgroundColor] = useState("#f8fafc");

        const [pwaStatus, setPwaStatus] = useState(() => {
            try {
                return SynactJS.pwa.getStatus();
            } catch (_) {
                return { supported: false, updateAvailable: false };
            }
        });

        const [installState, setInstallState] = useState(() => {
            try {
                return SynactJS.pwa.getInstallState();
            } catch (_) {
                return { canPrompt: false, installed: false };
            }
        });

        async function refreshTasks() {
            if (!ready) return;
            const nextTasks = await client.list();
            setTasks(nextTasks);
        }

        async function runAction(work, options = {}) {
            const {
                successMessage,
                refresh = false,
                clearNotice = true
            } = options;

            setBusy(true);
            setError("");
            if (clearNotice) {
                setNotice("");
            }

            try {
                const result = await work();
                if (refresh) {
                    await refreshTasks();
                }

                if (successMessage) {
                    setNotice(typeof successMessage === "function" ? successMessage(result) : successMessage);
                }

                return result;
            } catch (nextError) {
                setError(nextError?.message || "Operation failed.");
                return null;
            } finally {
                setBusy(false);
            }
        }

        useEffect(() => {
            let active = true;
            const ui = readUiSettings();
            if (typeof ui.title === "string") setAppTitle(ui.title);
            if (typeof ui.subtitle === "string") setAppSubtitle(ui.subtitle);
            if (typeof ui.primaryColor === "string") setPrimaryColor(ui.primaryColor);
            if (typeof ui.surfaceColor === "string") setSurfaceColor(ui.surfaceColor);
            if (typeof ui.textColor === "string") setTextColor(ui.textColor);
            if (typeof ui.backgroundColor === "string") setBackgroundColor(ui.backgroundColor);

            async function bootstrap() {
                setLoading(true);
                setError("");
                setNotice("");

                try {
                    await client.init();
                    await client.seedIfEmpty(DEFAULT_TASKS);
                    const firstTasks = await client.list();

                    if (!active) return;

                    setTasks(firstTasks);
                    setReady(true);
                    setNotice("App ready. Data is local-first and works offline.");
                } catch (nextError) {
                    if (!active) return;
                    setError(nextError?.message || "Failed to initialize app.");
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            function syncPwa() {
                try {
                    setPwaStatus(SynactJS.pwa.getStatus());
                    setInstallState(SynactJS.pwa.getInstallState());
                } catch (_) {
                    // Unsupported in this environment.
                }
            }

            bootstrap();
            syncPwa();

            const unsubscribers = [];
            try {
                unsubscribers.push(SynactJS.pwa.on("statusChange", syncPwa));
                unsubscribers.push(SynactJS.pwa.on("installPromptAvailable", syncPwa));
                unsubscribers.push(SynactJS.pwa.on("appInstalled", syncPwa));
            } catch (_) {
                // Unsupported in this environment.
            }

            return () => {
                active = false;
                for (const unsubscribe of unsubscribers) {
                    if (typeof unsubscribe === "function") {
                        unsubscribe();
                    }
                }
            };
        }, []);

        useEffect(() => {
            const root = document.documentElement;
            root.style.setProperty("--mini-primary", primaryColor);
            root.style.setProperty("--mini-surface", surfaceColor);
            root.style.setProperty("--mini-text", textColor);
            root.style.setProperty("--mini-bg", backgroundColor);

            writeUiSettings({
                title: appTitle,
                subtitle: appSubtitle,
                primaryColor,
                surfaceColor,
                textColor,
                backgroundColor
            });
        }, [appTitle, appSubtitle, primaryColor, surfaceColor, textColor, backgroundColor]);

        const visibleTasks = useMemo(() => {
            if (filter === "open") return tasks.filter((record) => !record?.payload?.done);
            if (filter === "done") return tasks.filter((record) => Boolean(record?.payload?.done));
            return tasks;
        }, [tasks, filter]);

        async function onAddTask(titleInput) {
            const title = String(titleInput || "").trim();
            if (!title || !ready) return;

            await runAction(async () => {
                await client.add(title, false);
            }, {
                successMessage: "Task added.",
                refresh: true
            });
        }

        async function onAddTaskFromEvent(event) {
            const inputEl = event?.currentTarget;
            const title = inputEl?.value || "";
            await onAddTask(title);
            if (inputEl) {
                inputEl.value = "";
                inputEl.focus();
            }
        }

        async function onToggleTask(task) {
            if (!task?.id || !ready) return;
            await runAction(() => client.toggle(task.id), { refresh: true, clearNotice: false });
        }

        async function onDeleteTask(task) {
            if (!task?.id || !ready) return;
            await runAction(() => client.remove(task.id), {
                successMessage: "Task deleted.",
                refresh: true
            });
        }

        async function onExportSnapshot() {
            if (!ready) return;

            await runAction(async () => {
                const snapshot = await client.exportSnapshot();
                const jsonText = JSON.stringify(snapshot, null, 2);
                setSnapshotText(jsonText);
                downloadJson("synact-mini-app-backup.json", jsonText);
            }, {
                successMessage: "Snapshot exported and downloaded."
            });
        }

        async function runImport(dryRun) {
            if (!ready) return;

            await runAction(async () => {
                const snapshot = parseSnapshot(snapshotText);
                const validation = client.validateSnapshot(snapshot);
                if (!validation.valid) {
                    throw new Error(validation.errors.join(" "));
                }

                return client.importSnapshot(snapshot, {
                    mode: importMode,
                    dryRun,
                    onConflict: "newest"
                });
            }, {
                successMessage: (report) => summarizeImport(report, dryRun ? "Dry run complete" : "Import applied"),
                refresh: !dryRun
            });
        }

        async function onImportFile(event) {
            const file = event?.target?.files?.[0];
            if (!file) return;

            await runAction(async () => {
                const text = await file.text();
                setSnapshotText(text);
            }, {
                successMessage: "Snapshot file loaded."
            });
        }

        async function onClearTasks() {
            if (!ready) return;
            if (!window.confirm("Delete all local tasks?")) return;

            await runAction(() => client.clear(), {
                successMessage: "All tasks deleted.",
                refresh: true
            });
        }

        async function onPromptInstall() {
            await runAction(async () => {
                const result = await SynactJS.pwa.promptInstall();
                setInstallState(SynactJS.pwa.getInstallState());
                return result;
            }, {
                successMessage: (result) => `Install result: ${result?.outcome || "unavailable"}`
            });
        }

        async function onCheckForUpdate() {
            await runAction(async () => {
                const available = await SynactJS.pwa.checkForUpdate();
                return available;
            }, {
                successMessage: (available) => available ? "Update available." : "No update available."
            });
        }

        async function onActivateUpdate() {
            await runAction(async () => {
                const activated = await SynactJS.pwa.activateUpdate();
                return activated;
            }, {
                successMessage: (activated) => activated ? "Update activation requested." : "No waiting update to activate."
            });
        }

        function renderTasksView() {
            const done = countDone(tasks);
            const open = tasks.length - done;

            return SynactLib.Stack({
                gap: 12,
                children: [
                    SynactLib.Card({
                        title: "Tasks",
                        children: [
                            div({ className: "mini-task-form" },
                                SynactLib.Input({
                                    label: "New Task",
                                    placeholder: "What do you need to do?",
                                    onKeyDown: (event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            onAddTaskFromEvent(event);
                                        }
                                    }
                                }),
                                AppButton({
                                    variant: "primary",
                                    disabled: !ready || busy,
                                    type: "button",
                                    onClick: (event) => {
                                        const inputEl = event.currentTarget
                                            ?.closest(".mini-task-form")
                                            ?.querySelector("input");
                                        onAddTaskFromEvent({ currentTarget: inputEl });
                                    },
                                    children: busy ? "Saving..." : "Add Task"
                                })
                            ),
                            SynactLib.KeyValueList({
                                entries: [
                                    { key: "Total", value: tasks.length },
                                    { key: "Open", value: open },
                                    { key: "Done", value: done }
                                ]
                            })
                        ]
                    }),
                    SynactLib.Card({
                        title: "Task List",
                        children: [
                            h(MiniSelect, {
                                label: "Filter",
                                value: filter,
                                onChange: (nextValue) => setFilter(nextValue),
                                options: [
                                    { label: "All", value: "all" },
                                    { label: "Open", value: "open" },
                                    { label: "Done", value: "done" }
                                ]
                            }),
                            visibleTasks.length === 0
                                ? SynactLib.EmptyState({
                                    title: "No tasks",
                                    description: "Add a task or change filter."
                                })
                                : SynactLib.Stack({
                                    gap: 8,
                                    children: visibleTasks.map((task) => {
                                        const doneState = Boolean(task?.payload?.done);
                                        return div({ className: "mini-task-row" },
                                            input({
                                                type: "checkbox",
                                                checked: doneState,
                                                onChange: () => onToggleTask(task),
                                                disabled: busy
                                            }),
                                            span({ className: `mini-task-title ${doneState ? "done" : ""}` }, String(task?.payload?.title || "")),
                                            SynactLib.Button({
                                                variant: "ghost",
                                                className: "mini-row-delete",
                                                type: "button",
                                                disabled: busy,
                                                onClick: () => onDeleteTask(task),
                                                children: "Delete"
                                            })
                                        );
                                    })
                                })
                        ]
                    })
                ]
            });
        }

        function renderBackupView() {
            return SynactLib.Stack({
                gap: 12,
                children: [
                    SynactLib.Card({
                        title: "Export",
                        children: [
                            p({ className: "synact-muted" }, "Backup all local data as a snapshot JSON file."),
                            AppButton({
                                variant: "primary",
                                disabled: !ready || busy,
                                onClick: onExportSnapshot,
                                children: "Export + Download"
                            })
                        ]
                    }),
                    SynactLib.Card({
                        title: "Import",
                        children: [
                            p({ className: "synact-muted" }, "Import is separated into this view to reduce accidental data changes."),
                            input({
                                type: "file",
                                accept: "application/json,.json",
                                onChange: onImportFile,
                                className: "mini-file-input"
                            }),
                            h(MiniSelect, {
                                label: "Import Mode",
                                value: importMode,
                                onChange: (nextValue) => setImportMode(nextValue),
                                options: [
                                    { label: "Merge records", value: "merge" },
                                    { label: "Replace all records", value: "replace" }
                                ]
                            }),
                            SynactLib.Textarea({
                                label: "Snapshot JSON",
                                value: snapshotText,
                                onInput: (event) => setSnapshotText(event.target.value),
                                placeholder: "Paste snapshot JSON here"
                            }),
                            ActionGrid([
                                AppButton({
                                    variant: "ghost",
                                    disabled: !ready || busy,
                                    onClick: () => runImport(true),
                                    children: "Dry Run"
                                }),
                                AppButton({
                                    variant: "primary",
                                    disabled: !ready || busy,
                                    onClick: () => runImport(false),
                                    children: "Apply Import"
                                })
                            ])
                        ]
                    })
                ]
            });
        }

        function renderSettingsView() {
            return SynactLib.Stack({
                gap: 12,
                children: [
                    SynactLib.Card({
                        title: "App Status",
                        children: SynactLib.KeyValueList({
                            entries: [
                                { key: "Ready", value: String(ready) },
                                { key: "Online", value: String(online) },
                                { key: "Tasks", value: tasks.length },
                                { key: "PWA Supported", value: String(Boolean(pwaStatus?.supported)) },
                                { key: "Update Available", value: String(Boolean(pwaStatus?.updateAvailable)) },
                                { key: "Install Prompt", value: String(Boolean(installState?.canPrompt)) }
                            ]
                        })
                    }),
                    SynactLib.Card({
                        title: "PWA Actions",
                        children: ActionGrid([
                            AppButton({ variant: "ghost", onClick: onCheckForUpdate, children: "Check Update" }),
                            AppButton({ variant: "ghost", onClick: onActivateUpdate, children: "Activate Update" }),
                            AppButton({ variant: "primary", disabled: !installState?.canPrompt, onClick: onPromptInstall, children: "Prompt Install" })
                        ])
                    }),
                    SynactLib.Card({
                        title: "App Settings",
                        children: [
                            SynactLib.Input({
                                label: "App Title",
                                value: appTitle,
                                onChange: (event) => setAppTitle(event.target.value)
                            }),
                            SynactLib.Input({
                                label: "App Subtitle",
                                value: appSubtitle,
                                onChange: (event) => setAppSubtitle(event.target.value)
                            }),
                            div({ className: "mini-color-grid" },
                                SynactLib.Input({
                                    label: "Primary",
                                    type: "color",
                                    value: primaryColor,
                                    onChange: (event) => setPrimaryColor(event.target.value)
                                }),
                                SynactLib.Input({
                                    label: "Surface",
                                    type: "color",
                                    value: surfaceColor,
                                    onChange: (event) => setSurfaceColor(event.target.value)
                                }),
                                SynactLib.Input({
                                    label: "Text",
                                    type: "color",
                                    value: textColor,
                                    onChange: (event) => setTextColor(event.target.value)
                                }),
                                SynactLib.Input({
                                    label: "Background",
                                    type: "color",
                                    value: backgroundColor,
                                    onChange: (event) => setBackgroundColor(event.target.value)
                                })
                            ),
                            AppButton({
                                variant: "ghost",
                                onClick: () => {
                                    setAppTitle(APP_CONFIG.title);
                                    setAppSubtitle(APP_CONFIG.subtitle);
                                    setPrimaryColor("#2563eb");
                                    setSurfaceColor("#ffffff");
                                    setTextColor("#0f172a");
                                    setBackgroundColor("#f8fafc");
                                },
                                children: "Reset Theme + Labels"
                            })
                        ]
                    }),
                    SynactLib.Card({
                        title: "Styling",
                        children: [
                            p({ className: "synact-muted" }, "Override CSS variables in mini-app.html (for example: --mini-primary, --mini-surface, --mini-text) to reskin the app without changing JS.")
                        ]
                    }),
                    SynactLib.Card({
                        title: "Danger Zone",
                        children: AppButton({
                            variant: "danger",
                            disabled: !ready || busy,
                            onClick: onClearTasks,
                            children: "Delete All Tasks"
                        })
                    })
                ]
            });
        }

        function renderCurrentView() {
            if (loading) {
                return SynactLib.Card({ children: "Loading app data..." });
            }

            if (view === VIEWS.backup) return renderBackupView();
            if (view === VIEWS.settings) return renderSettingsView();
            return renderTasksView();
        }

        const bottomNav = SynactLib.BottomNav({
            activeId: view,
            onChange: (id) => setView(id || VIEWS.tasks),
            items: [
                { id: VIEWS.tasks, label: "Tasks", icon: "T" },
                { id: VIEWS.backup, label: "Backup", icon: "B" },
                { id: VIEWS.settings, label: "Settings", icon: "S" }
            ]
        });

        return div({ className: "mini-page" },
            SynactLib.MobileAppShell({
                title: appTitle || APP_CONFIG.title,
                subtitle: appSubtitle || APP_CONFIG.subtitle,
                topActions: div({ className: "mini-top-actions" },
                    SynactLib.ThemeToggle({})
                ),
                bottomNav,
                children: [
                    div({ key: "offline-slot" }, SynactLib.OfflineBanner({ hideWhenOnline: true })),
                    div({ key: "notice-slot" }, notice ? div({ className: "mini-inline-note" }, notice) : null),
                    div({ key: "error-slot" }, error ? SynactLib.Alert({ tone: "danger", title: "Error", children: error }) : null),
                    div({ key: "view-slot" }, renderCurrentView())
                ]
            })
        );
    }

    function mountMiniApp() {
        const container = document.querySelector("#app");
        if (!container || container.__synactMiniMounted) {
            return;
        }

        container.__synactMiniMounted = true;
        SynactJS.render(MiniApp, container);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountMiniApp, { once: true });
    } else {
        mountMiniApp();
    }
})();
