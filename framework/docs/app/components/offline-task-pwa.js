function createTaskId() {
    const time = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `task-${time}-${random}`;
}

function summarizeImport(report, prefix) {
    const summary = report?.summary || {};
    return [
        prefix,
        `incoming=${summary.incoming || 0}`,
        `created=${summary.created || 0}`,
        `updated=${summary.updated || 0}`,
        `skipped=${summary.skipped || 0}`,
        `deleted=${summary.deleted || 0}`,
        `conflicts=${summary.conflicts || 0}`
    ].join(" | ");
}

export function OfflineTaskPwaExample() {
    const online = useOnlineStatus();

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [draft, setDraft] = useState("");
    const [filter, setFilter] = useState("all");

    const [initError, setInitError] = useState("");
    const [dataMessage, setDataMessage] = useState("");
    const [importExportError, setImportExportError] = useState("");
    const [importExportMessage, setImportExportMessage] = useState("");

    const [exportText, setExportText] = useState("");
    const [importText, setImportText] = useState("");
    const [importMode, setImportMode] = useState("merge");

    const [pwaStatus, setPwaStatus] = useState(() => {
        try {
            return SynactJS.pwa.getStatus();
        } catch (_) {
            return null;
        }
    });

    const [installState, setInstallState] = useState(() => {
        try {
            return SynactJS.pwa.getInstallState();
        } catch (_) {
            return { canPrompt: false, installed: false };
        }
    });

    const [installMessage, setInstallMessage] = useState("");

    async function refreshTasks() {
        if (!SynactJS.data.store) {
            setTasks([]);
            return;
        }

        const records = await SynactJS.data.store.listRecords("tasks");
        const ordered = [...records].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        setTasks(ordered);
    }

    useEffect(() => {
        let active = true;

        async function bootstrap() {
            setLoading(true);
            setInitError("");

            try {
                try {
                    await SynactJS.data.close();
                } catch (_) {
                    // Ignore close failures during bootstrapping.
                }

                await SynactJS.data.init({
                    appId: "synact-docs-offline-task-app",
                    engine: "auto",
                    schemaVersion: 1,
                    migrations: []
                });

                if (!active) return;

                const existing = await SynactJS.data.store.listRecords("tasks");
                if (existing.length === 0) {
                    await SynactJS.data.store.write("tasks", createTaskId(), {
                        title: "Ship first offline task flow",
                        done: false
                    });
                    await SynactJS.data.store.write("tasks", createTaskId(), {
                        title: "Test import/export backup",
                        done: true
                    });
                }

                await refreshTasks();
                if (!active) return;

                setReady(true);
                setDataMessage("Data store initialized.");
            } catch (error) {
                if (!active) return;
                setInitError(error?.message || "Failed to initialize local data store.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        function syncPwaState() {
            try {
                setPwaStatus(SynactJS.pwa.getStatus());
                setInstallState(SynactJS.pwa.getInstallState());
            } catch (_) {
                // Ignore unsupported environments.
            }
        }

        bootstrap();
        syncPwaState();

        const unsubscribers = [];
        try {
            unsubscribers.push(SynactJS.pwa.on("statusChange", syncPwaState));
            unsubscribers.push(SynactJS.pwa.on("installPromptAvailable", syncPwaState));
            unsubscribers.push(SynactJS.pwa.on("appInstalled", syncPwaState));
        } catch (_) {
            // Ignore unsupported environments.
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

    async function onAddTask(event) {
        event.preventDefault();
        if (!ready || busy) return;

        const title = draft.trim();
        if (!title) return;

        setBusy(true);
        setImportExportError("");
        setImportExportMessage("");
        setDataMessage("");

        try {
            await SynactJS.data.store.write("tasks", createTaskId(), {
                title,
                done: false
            });
            setDraft("");
            await refreshTasks();
            setDataMessage("Task added.");
        } catch (error) {
            setInitError(error?.message || "Failed to add task.");
        } finally {
            setBusy(false);
        }
    }

    async function onToggleTask(record) {
        if (!ready || busy || !record?.id) return;

        setBusy(true);
        setInitError("");

        try {
            await SynactJS.data.store.update("tasks", record.id, (payload = {}) => ({
                ...payload,
                done: !payload.done
            }));
            await refreshTasks();
        } catch (error) {
            setInitError(error?.message || "Failed to update task.");
        } finally {
            setBusy(false);
        }
    }

    async function onDeleteTask(record) {
        if (!ready || busy || !record?.id) return;

        setBusy(true);
        setInitError("");

        try {
            await SynactJS.data.store.delete("tasks", record.id);
            await refreshTasks();
        } catch (error) {
            setInitError(error?.message || "Failed to delete task.");
        } finally {
            setBusy(false);
        }
    }

    async function onExportSnapshot() {
        if (!ready) return;

        setImportExportError("");
        setImportExportMessage("");

        try {
            const snapshot = await SynactJS.data.export();
            const jsonText = JSON.stringify(snapshot, null, 2);
            setExportText(jsonText);
            setImportText(jsonText);

            const blob = new Blob([jsonText], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "synact-offline-task-backup.json";
            link.click();
            URL.revokeObjectURL(url);

            setImportExportMessage("Snapshot exported and downloaded.");
        } catch (error) {
            setImportExportError(error?.message || "Snapshot export failed.");
        }
    }

    async function runImport(dryRun) {
        if (!ready) return;

        setImportExportError("");
        setImportExportMessage("");

        let snapshot;
        try {
            snapshot = JSON.parse(importText || "");
        } catch (_) {
            setImportExportError("Import JSON is invalid.");
            return;
        }

        const validation = SynactJS.data.validateSnapshot(snapshot, { verifyChecksum: true });
        if (!validation.valid) {
            setImportExportError(validation.errors.join(" "));
            return;
        }

        try {
            const report = await SynactJS.data.import(snapshot, {
                mode: importMode,
                dryRun,
                onConflict: "newest"
            });

            setImportExportMessage(summarizeImport(report, dryRun ? "Dry run complete" : "Import applied"));
            if (!dryRun) {
                await refreshTasks();
            }
        } catch (error) {
            setImportExportError(error?.message || "Import failed.");
        }
    }

    async function onImportFile(event) {
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setImportText(text);
            setImportExportError("");
        } catch (error) {
            setImportExportError(error?.message || "Failed to read file.");
        }
    }

    async function onPromptInstall() {
        setInstallMessage("");
        try {
            const result = await SynactJS.pwa.promptInstall();
            setInstallMessage(`Install result: ${result?.outcome || "unavailable"}`);
            setInstallState(SynactJS.pwa.getInstallState());
        } catch (error) {
            setInstallMessage(error?.message || "Install prompt failed.");
        }
    }

    const filtered = tasks.filter((record) => {
        const done = Boolean(record?.payload?.done);
        if (filter === "open") return !done;
        if (filter === "done") return done;
        return true;
    });

    const totalCount = tasks.length;
    const doneCount = tasks.filter((record) => Boolean(record?.payload?.done)).length;
    const openCount = totalCount - doneCount;

    const statusLabel = online ? "Online" : "Offline";
    const statusClass = online
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

    return div({ class: "bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm mb-8" },
        div({ class: "flex flex-wrap items-center gap-2 mb-3" },
            h4({ class: "text-base sm:text-lg font-semibold text-slate-900" }, "Offline Task App (End-to-End Demo)"),
            span({ class: `inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${statusClass}` }, statusLabel),
            pwaStatus?.supported ? span({ class: "inline-flex items-center px-2 py-1 rounded-full border text-xs text-slate-600 bg-slate-50 border-slate-200" }, "PWA API ready") : null
        ),
        p({ class: "text-sm text-slate-600 mb-4" }, "Uses SynactJS.data for persistence + import/export, and SynactJS.pwa for install state."),
        loading ? p({ class: "text-sm text-slate-600 mb-3" }, "Loading local data...") : null,
        initError ? p({ class: "text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-2 mb-3" }, initError) : null,
        dataMessage ? p({ class: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 mb-3" }, dataMessage) : null,

        form({ onsubmit: onAddTask, class: "flex flex-col sm:flex-row gap-2 mb-3" },
            input({
                class: "flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm",
                placeholder: "Add a task",
                value: draft,
                oninput: (event) => setDraft(event.target.value),
                disabled: !ready || busy
            }),
            button({
                type: "submit",
                class: "px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white disabled:opacity-50",
                disabled: !ready || busy
            }, busy ? "Saving..." : "Add")
        ),

        div({ class: "flex flex-wrap items-center gap-2 mb-3" },
            button({
                type: "button",
                onclick: () => setFilter("all"),
                class: `px-2.5 py-1.5 rounded border text-xs sm:text-sm ${filter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`
            }, `All (${totalCount})`),
            button({
                type: "button",
                onclick: () => setFilter("open"),
                class: `px-2.5 py-1.5 rounded border text-xs sm:text-sm ${filter === "open" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`
            }, `Open (${openCount})`),
            button({
                type: "button",
                onclick: () => setFilter("done"),
                class: `px-2.5 py-1.5 rounded border text-xs sm:text-sm ${filter === "done" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`
            }, `Done (${doneCount})`)
        ),

        filtered.length === 0
            ? div({ class: "text-sm text-slate-500 border border-dashed border-slate-300 rounded p-3 mb-4" }, "No tasks for this filter.")
            : ul({ class: "space-y-2 mb-4" },
                ...filtered.map((record) => {
                    const done = Boolean(record?.payload?.done);
                    return li({
                        class: "flex items-center gap-2 border border-slate-200 rounded p-2"
                    },
                    input({
                        type: "checkbox",
                        checked: done,
                        onchange: () => onToggleTask(record),
                        disabled: busy
                    }),
                    span({
                        class: `flex-1 text-sm ${done ? "line-through text-slate-400" : "text-slate-700"}`
                    }, String(record?.payload?.title || "")),
                    button({
                        type: "button",
                        onclick: () => onDeleteTask(record),
                        class: "px-2 py-1 rounded border border-rose-300 text-rose-700 text-xs",
                        disabled: busy
                    }, "Delete")
                    );
                })
            ),

        div({ class: "grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3" },
            div({ class: "border border-slate-200 rounded p-3" },
                p({ class: "text-sm font-semibold text-slate-800 mb-2" }, "Snapshot Export"),
                p({ class: "text-xs text-slate-600 mb-2" }, "Creates a JSON backup from local app data."),
                button({
                    type: "button",
                    onclick: onExportSnapshot,
                    class: "px-3 py-1.5 rounded bg-slate-900 text-white text-xs sm:text-sm",
                    disabled: !ready
                }, "Export + Download"),
                textarea({
                    class: "mt-2 w-full min-h-[120px] border border-slate-300 rounded p-2 text-xs font-mono",
                    readonly: true,
                    value: exportText,
                    placeholder: "Latest snapshot JSON appears here."
                })
            ),
            div({ class: "border border-slate-200 rounded p-3" },
                p({ class: "text-sm font-semibold text-slate-800 mb-2" }, "Snapshot Import"),
                p({ class: "text-xs text-slate-600 mb-2" }, "Paste JSON or load a backup file, then dry-run or apply."),
                input({
                    type: "file",
                    accept: "application/json,.json",
                    onchange: onImportFile,
                    class: "text-xs mb-2"
                }),
                textarea({
                    class: "w-full min-h-[120px] border border-slate-300 rounded p-2 text-xs font-mono mb-2",
                    value: importText,
                    oninput: (event) => setImportText(event.target.value),
                    placeholder: "Paste snapshot JSON"
                }),
                div({ class: "flex flex-wrap items-center gap-2 mb-2" },
                    label({ class: "text-xs text-slate-600" }, "Mode"),
                    select({
                        value: importMode,
                        onchange: (event) => setImportMode(event.target.value),
                        class: "text-xs border border-slate-300 rounded px-2 py-1"
                    },
                    option({ value: "merge" }, "merge"),
                    option({ value: "replace" }, "replace")
                    ),
                    button({
                        type: "button",
                        onclick: () => runImport(true),
                        class: "px-2.5 py-1 rounded border border-slate-300 text-xs"
                    }, "Dry Run"),
                    button({
                        type: "button",
                        onclick: () => runImport(false),
                        class: "px-2.5 py-1 rounded bg-indigo-600 text-white text-xs"
                    }, "Apply Import")
                )
            )
        ),

        importExportError ? p({ class: "text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-2 mb-2" }, importExportError) : null,
        importExportMessage ? p({ class: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 mb-2" }, importExportMessage) : null,

        div({ class: "border border-slate-200 rounded p-3 mt-3" },
            p({ class: "text-sm font-semibold text-slate-800 mb-1" }, "Install Flow"),
            p({ class: "text-xs text-slate-600 mb-2" }, `canPrompt=${Boolean(installState?.canPrompt)} | installed=${Boolean(installState?.installed)}`),
            button({
                type: "button",
                onclick: onPromptInstall,
                class: "px-3 py-1.5 rounded bg-emerald-600 text-white text-xs sm:text-sm",
                disabled: !installState?.canPrompt
            }, "Prompt Install"),
            installMessage ? p({ class: "text-xs text-slate-700 mt-2" }, installMessage) : null
        )
    );
}
