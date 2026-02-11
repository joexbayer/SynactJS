import { div, header, main, nav, h1, p, span } from "./runtime.js";
import { AppButton, Icon, cx } from "./ui.js";

const NAV_ITEMS = [
    { id: "home", label: "Home", icon: "house" },
    { id: "plants", label: "Plants", icon: "leaf" },
    { id: "journal", label: "Journal", icon: "notepad" },
    { id: "sync", label: "Sync", icon: "cloud" },
    { id: "settings", label: "Settings", icon: "gear-six" }
];

export function AppShell({
    title,
    subtitle,
    view,
    onNavigate,
    timeLabel,
    dayPartTip,
    status,
    children,
    accentColor = "emerald"
} = {}) {
    const accentClass = accentColor === "teal"
        ? "from-teal-700 via-emerald-600 to-cyan-500"
        : accentColor === "rose"
            ? "from-rose-700 via-orange-500 to-amber-400"
            : accentColor === "sky"
                ? "from-sky-700 via-indigo-600 to-violet-500"
                : "from-emerald-700 via-green-600 to-lime-500";

    return div(
        {
            className: "mx-auto min-h-screen w-full max-w-3xl bg-gradient-to-b from-orange-50 via-emerald-50/40 to-amber-50 pb-24 text-slate-900"
        },
        status
            ? div(
                {
                    className: "pointer-events-none fixed left-0 right-0 top-3 z-40 px-3"
                },
                div(
                    {
                        className: "mx-auto max-w-3xl rounded-[1rem] bg-emerald-700/95 px-3 py-2 text-sm text-emerald-50 shadow-lg backdrop-blur"
                    },
                    div(
                        { className: "inline-flex items-center gap-2" },
                        Icon({ name: "bell-ringing", className: "text-base" }),
                        span({}, status)
                    )
                )
            )
            : null,
        header(
            {
                className: cx(
                    "rounded-b-[2rem] bg-gradient-to-br px-4 pb-6 pt-6 text-white shadow-lg",
                    accentClass
                )
            },
            div(
                { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider" },
                Icon({ name: "sparkle", className: "text-sm" }),
                span({}, timeLabel || "Now")
            ),
            h1({ className: "mt-3 text-3xl font-black tracking-tight" }, title || "Plants"),
            p({ className: "mt-1 text-sm text-white/90" }, subtitle || "Local-first plant companion"),
            dayPartTip ? p({ className: "mt-3 text-sm text-white/85" }, dayPartTip) : null
        ),
        main(
            {
                className: "relative mx-3 -mt-3 space-y-3 rounded-[1.8rem_1.8rem_1.2rem_1.2rem] bg-[#fffdf8]/95 px-4 py-4 shadow-[0_20px_32px_-24px_rgba(15,23,42,0.35)]"
            },
            children
        ),
        nav(
            {
                className: "fixed bottom-0 left-0 right-0 z-20 px-3 py-3"
            },
            div(
                {
                    className: "mx-auto grid w-full max-w-3xl gap-2 rounded-[1.4rem] border border-amber-200/70 bg-white/85 p-2 shadow-[0_10px_30px_-20px_rgba(68,38,8,0.55)] backdrop-blur",
                    style: {
                        gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))`
                    }
                },
                ...NAV_ITEMS.map((item) => {
                    const active = item.id === view;
                    return AppButton({
                        key: `nav-${item.id}`,
                        label: item.label,
                        icon: item.icon,
                        variant: active ? "primary" : "ghost",
                        className: cx("h-11 px-2 text-xs", active ? "shadow-md" : "text-slate-700"),
                        onClick: () => onNavigate && onNavigate(item.id)
                    });
                })
            )
        )
    );
}
