import { useEffect, useForm, div, p } from "./runtime.js";
import {
    SectionCard,
    InputField,
    ToggleField,
    AppButton,
    Badge,
    EmptyState,
    AccordionSection,
    cx
} from "./ui.js";

function makeAuthDraft(syncState) {
    return {
        email: syncState?.user?.email || "",
        password: "",
        passphrase: "",
        autoPull: true
    };
}

function formatSyncTime(value) {
    if (!value) {
        return "No sync yet";
    }

    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) {
        return "No sync yet";
    }

    return timestamp.toLocaleString();
}

export function SyncView({
    settings,
    syncState,
    syncSupported,
    onRegister,
    onLogin,
    onRestore,
    onLogout,
    onSetPassphrase,
    onPush,
    onPull,
    onSyncBoth
} = {}) {
    const authForm = useForm({
        initialValues: makeAuthDraft(syncState)
    });

    const unlockForm = useForm({
        initialValues: {
            passphrase: ""
        }
    });

    useEffect(() => {
        authForm.setField("email", syncState?.user?.email || "");
    }, [syncState?.user?.email]);

    if (!syncSupported) {
        return EmptyState({
            title: "Sync unavailable",
            text: "This SynactJS build does not expose the sync session helper yet. Rebuild the runtime and refresh."
        });
    }

    const isConfigured = Boolean(syncState?.configured);
    const isAuthenticated = Boolean(syncState?.configured && syncState?.authenticated);
    const hasPassphrase = Boolean(syncState?.passphraseSet);
    const canRunSync = isAuthenticated && hasPassphrase;

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: "Sync Status",
            subtitle: "Server target is configured in Settings.",
            icon: "cloud-check",
            children: div(
                { className: "space-y-3" },
                div(
                    { className: "flex flex-wrap items-center gap-2" },
                    Badge({ label: isConfigured ? "configured" : "not configured", tone: isConfigured ? "safe" : "warning" }),
                    Badge({ label: isAuthenticated ? "authenticated" : "signed out", tone: isAuthenticated ? "safe" : "warning" }),
                    Badge({ label: hasPassphrase ? "passphrase ready" : "passphrase missing", tone: hasPassphrase ? "safe" : "warning" })
                ),
                p(
                    {
                        className: cx(
                            "text-sm",
                            syncState?.lastError ? "text-rose-700" : "text-slate-600"
                        )
                    },
                    syncState?.lastError
                        ? `Last error: ${syncState.lastError}`
                        : `Last sync: ${formatSyncTime(syncState?.lastSyncAt)} (${syncState?.lastSyncDirection || "none"})`
                ),
                p(
                    { className: "text-xs text-slate-500" },
                    `Server: ${settings?.syncServerUrl || "Not configured"} · App ID: ${settings?.syncAppId || "Not configured"}`
                ),
                p(
                    { className: "text-xs text-slate-500" },
                    settings?.syncAutoEnabled
                        ? `Auto sync: every ${Number(settings?.syncAutoIntervalMinutes || 30)} min (${settings?.syncAutoDirection || "both"})`
                        : "Auto sync: disabled"
                )
            )
        }),
        AccordionSection({
            title: isAuthenticated ? "Account" : "Sign In / Register",
            subtitle: isAuthenticated
                ? `Signed in as ${syncState?.user?.email || "user"}`
                : "Use your account credentials and local encryption passphrase.",
            icon: "user-circle",
            defaultOpen: !isAuthenticated,
            children: isAuthenticated
                ? div(
                    { className: "space-y-3" },
                    p(
                        { className: "text-sm text-slate-600" },
                        "Session is active. You can keep using sync actions below, and your auth token can be restored on next launch."
                    ),
                    div(
                        { className: "grid gap-2 sm:grid-cols-2" },
                        AppButton({
                            label: "Restore saved session",
                            icon: "clock-counter-clockwise",
                            onClick: () => onRestore && onRestore()
                        }),
                        AppButton({
                            label: "Logout",
                            icon: "sign-out",
                            variant: "danger",
                            onClick: () => onLogout && onLogout()
                        })
                    )
                )
                : div(
                    { className: "space-y-3" },
                    div(
                        { className: "grid gap-3 sm:grid-cols-2" },
                        InputField({
                            label: "Email",
                            icon: "at",
                            value: authForm.values.email,
                            placeholder: "you@example.com",
                            onInput: authForm.bind("email").onInput
                        }),
                        InputField({
                            label: "Password",
                            icon: "password",
                            type: "password",
                            value: authForm.values.password,
                            onInput: authForm.bind("password").onInput
                        }),
                        InputField({
                            label: "Encryption passphrase",
                            icon: "lock-key",
                            type: "password",
                            value: authForm.values.passphrase,
                            helper: "Stored only on this device runtime. Needed for encrypted sync snapshots.",
                            onInput: authForm.bind("passphrase").onInput
                        }),
                        ToggleField({
                            label: "Pull latest data after sign-in",
                            checked: authForm.values.autoPull,
                            onInput: authForm.bind("autoPull", { type: "checkbox" }).onInput
                        })
                    ),
                    div(
                        { className: "grid gap-2 sm:grid-cols-2" },
                        AppButton({
                            label: "Login",
                            icon: "sign-in",
                            variant: "primary",
                            onClick: () => onLogin && onLogin(authForm.values)
                        }),
                        AppButton({
                            label: "Register",
                            icon: "user-plus",
                            onClick: () => onRegister && onRegister(authForm.values)
                        })
                    ),
                    AppButton({
                        label: "Restore saved session",
                        icon: "clock-counter-clockwise",
                        onClick: () => onRestore && onRestore()
                    })
                )
        }),
        isAuthenticated
            ? AccordionSection({
                title: "Sync Actions",
                subtitle: "Pull and push are unlocked once signed in.",
                icon: "arrows-clockwise",
                defaultOpen: true,
                children: div(
                    { className: "space-y-3" },
                    !hasPassphrase
                        ? div(
                            { className: "space-y-2 rounded-[1rem] bg-amber-50 px-3 py-3 ring-1 ring-amber-200" },
                            p({ className: "text-sm text-amber-800" }, "Set your encryption passphrase before sync actions."),
                            div(
                                { className: "grid gap-2 sm:grid-cols-[1fr_auto]" },
                                InputField({
                                    label: "Passphrase",
                                    icon: "lock-key",
                                    type: "password",
                                    value: unlockForm.values.passphrase,
                                    onInput: unlockForm.bind("passphrase").onInput
                                }),
                                div(
                                    { className: "self-end" },
                                    AppButton({
                                        label: "Unlock",
                                        icon: "key",
                                        variant: "primary",
                                        onClick: () => {
                                            if (onSetPassphrase) {
                                                onSetPassphrase(unlockForm.values.passphrase);
                                            }
                                        }
                                    })
                                )
                            )
                        )
                        : null,
                    div(
                        { className: "grid gap-2 sm:grid-cols-3" },
                        AppButton({
                            label: "Pull",
                            icon: "download-simple",
                            variant: "primary",
                            disabled: !canRunSync,
                            onClick: () => onPull && onPull()
                        }),
                        AppButton({
                            label: "Push",
                            icon: "upload-simple",
                            disabled: !canRunSync,
                            onClick: () => onPush && onPush()
                        }),
                        AppButton({
                            label: "Pull then Push",
                            icon: "repeat",
                            disabled: !canRunSync,
                            onClick: () => onSyncBoth && onSyncBoth()
                        })
                    )
                )
            })
            : null
    );
}
