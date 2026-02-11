import { useEffect, useForm, div, p } from "./runtime.js";
import {
    SectionCard,
    InputField,
    SelectField,
    ToggleField,
    AppButton,
    EmptyState,
    AccordionSection
} from "./ui.js";

function makeDraft(settings) {
    return {
        ownerName: settings?.ownerName || "",
        preferredStartView: settings?.preferredStartView || "home",
        accentColor: settings?.accentColor || "emerald",
        compactMode: Boolean(settings?.compactMode),
        showOnlyPetSafe: Boolean(settings?.showOnlyPetSafe),
        showScientificNames: settings?.showScientificNames !== false,
        syncServerUrl: settings?.syncServerUrl || "http://localhost:8787",
        syncAppId: settings?.syncAppId || "synact-plants-realworld",
        syncRememberAuth: settings?.syncRememberAuth !== false,
        syncAutoEnabled: Boolean(settings?.syncAutoEnabled),
        syncAutoIntervalMinutes: Number(settings?.syncAutoIntervalMinutes || 30),
        syncAutoDirection: settings?.syncAutoDirection || "both"
    };
}

export function SettingsView({ settings, onSaveSettings, onResetData, storageEngineName } = {}) {
    const form = useForm({
        initialValues: makeDraft(settings)
    });

    useEffect(() => {
        form.reset(makeDraft(settings));
    }, [
        settings?.ownerName,
        settings?.preferredStartView,
        settings?.accentColor,
        settings?.compactMode,
        settings?.showOnlyPetSafe,
        settings?.showScientificNames,
        settings?.syncServerUrl,
        settings?.syncAppId,
        settings?.syncRememberAuth,
        settings?.syncAutoEnabled,
        settings?.syncAutoIntervalMinutes,
        settings?.syncAutoDirection
    ]);

    if (!settings) {
        return EmptyState({
            title: "Loading settings",
            text: "Settings become editable when the local datastore is ready."
        });
    }

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: "Settings",
            subtitle: `Storage engine: ${storageEngineName || "unknown"}`,
            icon: "sliders-horizontal",
            children: div(
                { className: "space-y-3" },
                AccordionSection({
                    title: "App Preferences",
                    subtitle: "Display and behavior preferences for this device.",
                    icon: "palette",
                    defaultOpen: true,
                    children: div(
                        { className: "grid gap-3 sm:grid-cols-2" },
                        InputField({
                            label: "Display name",
                            icon: "user-circle",
                            value: form.values.ownerName,
                            placeholder: "Plant Keeper",
                            onInput: form.bind("ownerName").onInput
                        }),
                        SelectField({
                            label: "Start view",
                            icon: "compass",
                            value: form.values.preferredStartView,
                            options: [
                                { value: "home", label: "Home" },
                                { value: "plants", label: "Plants" },
                                { value: "journal", label: "Journal" },
                                { value: "sync", label: "Sync" },
                                { value: "settings", label: "Settings" }
                            ],
                            onInput: form.bind("preferredStartView").onInput
                        }),
                        SelectField({
                            label: "Accent color",
                            icon: "palette",
                            value: form.values.accentColor,
                            options: [
                                { value: "emerald", label: "Emerald" },
                                { value: "teal", label: "Teal" },
                                { value: "sky", label: "Sky" },
                                { value: "rose", label: "Rose" }
                            ],
                            onInput: form.bind("accentColor").onInput
                        }),
                        div({ className: "sm:col-span-2 grid gap-2" },
                            ToggleField({
                                label: "Compact list mode",
                                checked: form.values.compactMode,
                                helper: "Reduce card density for more items on screen.",
                                onInput: form.bind("compactMode", { type: "checkbox" }).onInput
                            }),
                            ToggleField({
                                label: "Filter to pet-safe plants by default",
                                checked: form.values.showOnlyPetSafe,
                                onInput: form.bind("showOnlyPetSafe", { type: "checkbox" }).onInput
                            }),
                            ToggleField({
                                label: "Show scientific names",
                                checked: form.values.showScientificNames,
                                onInput: form.bind("showScientificNames", { type: "checkbox" }).onInput
                            })
                        )
                    )
                }),
                AccordionSection({
                    title: "Sync Connection",
                    subtitle: "Target server and app namespace for cloud sync.",
                    icon: "cloud",
                    defaultOpen: false,
                    children: div(
                        { className: "grid gap-3 sm:grid-cols-2" },
                        InputField({
                            label: "Sync server URL",
                            icon: "link",
                            value: form.values.syncServerUrl,
                            placeholder: "https://sync.example.com",
                            onInput: form.bind("syncServerUrl").onInput
                        }),
                        InputField({
                            label: "Sync app ID",
                            icon: "app-window",
                            value: form.values.syncAppId,
                            placeholder: "plants-local",
                            onInput: form.bind("syncAppId").onInput
                        }),
                        div(
                            { className: "sm:col-span-2" },
                            ToggleField({
                                label: "Remember sync session token",
                                helper: "Keeps user logged in across app restarts.",
                                checked: form.values.syncRememberAuth,
                                onInput: form.bind("syncRememberAuth", { type: "checkbox" }).onInput
                            })
                        ),
                        div(
                            { className: "sm:col-span-2" },
                            ToggleField({
                                label: "Enable auto sync",
                                helper: "Runs automatically while signed in and passphrase is unlocked.",
                                checked: form.values.syncAutoEnabled,
                                onInput: form.bind("syncAutoEnabled", { type: "checkbox" }).onInput
                            })
                        ),
                        SelectField({
                            label: "Auto sync interval",
                            icon: "timer",
                            value: String(form.values.syncAutoIntervalMinutes || 30),
                            options: [
                                { value: "15", label: "Every 15 minutes" },
                                { value: "30", label: "Every 30 minutes" },
                                { value: "60", label: "Every 60 minutes" },
                                { value: "120", label: "Every 2 hours" }
                            ],
                            onInput: (event) => {
                                form.setField("syncAutoIntervalMinutes", Number(event?.target?.value || 30));
                            }
                        }),
                        SelectField({
                            label: "Auto sync mode",
                            icon: "arrows-clockwise",
                            value: form.values.syncAutoDirection,
                            options: [
                                { value: "both", label: "Pull then Push" },
                                { value: "pull", label: "Pull only" },
                                { value: "push", label: "Push only" }
                            ],
                            onInput: form.bind("syncAutoDirection").onInput
                        })
                    )
                }),
                AccordionSection({
                    title: "Data Ownership",
                    subtitle: "Local-first by default. Keep your sync settings under your control.",
                    icon: "hard-drives",
                    defaultOpen: false,
                    children: p(
                        { className: "text-sm text-slate-600" },
                        "All data stays in your browser storage unless you explicitly sync."
                    )
                }),
                div(
                    { className: "grid gap-2 sm:grid-cols-2" },
                    AppButton({
                        label: "Save settings",
                        icon: "floppy-disk",
                        variant: "primary",
                        onClick: () => onSaveSettings && onSaveSettings(form.values)
                    }),
                    AppButton({
                        label: "Reset all local data",
                        icon: "trash",
                        variant: "danger",
                        onClick: () => onResetData && onResetData()
                    })
                )
            )
        })
    );
}
