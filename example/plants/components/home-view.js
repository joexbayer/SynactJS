import { div, h3, p, ul, li } from "./runtime.js";
import { SectionCard, StatTile, Badge, EmptyState, AppButton, Icon, SectionDivider } from "./ui.js";

export function HomeView({
    ownerName,
    dayPart,
    dayPartTip,
    todayMessage,
    myPlants,
    recentEntries,
    onOpenPlant,
    onNavigatePlants
} = {}) {
    const needsWaterCount = (myPlants || []).filter((record) => {
        const wateredAt = record?.payload?.lastWateredAt;
        if (!wateredAt) return true;
        const diffMs = Date.now() - new Date(wateredAt).getTime();
        return diffMs > 7 * 24 * 60 * 60 * 1000;
    }).length;

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: `Hi ${ownerName || "Plant Keeper"}`,
            subtitle: todayMessage,
            icon: "coffee",
            children: div(
                { className: "grid grid-cols-2 gap-3" },
                StatTile({ label: "Plants tracked", value: (myPlants || []).length, hint: "Local-only", icon: "plant" }),
                StatTile({
                    label: "Needs attention",
                    value: needsWaterCount,
                    hint: "No watering in 7+ days",
                    tone: needsWaterCount > 0 ? "warning" : "positive",
                    icon: "drop-half-bottom"
                })
            )
        }),
        SectionDivider({ label: "Today" }),
        SectionCard({
            title: "Time of Day Guidance",
            subtitle: `Current phase: ${dayPart}`,
            icon: "sun-dim",
            children: div(
                { className: "space-y-2" },
                p({ className: "text-sm text-slate-600" }, dayPartTip),
                Badge({ label: dayPart, tone: dayPart === "night" ? "warning" : "safe" })
            )
        }),
        SectionDivider({ label: "Collection" }),
        (myPlants || []).length === 0
            ? EmptyState({
                title: "Start your collection",
                text: "Add plants from the catalog to unlock watering and journal tools.",
                action: AppButton({ label: "Browse plants", icon: "leaf", variant: "primary", onClick: onNavigatePlants })
            })
            : SectionCard({
                title: "Recently Tracked",
                subtitle: "Quick jump into your saved entries",
                icon: "potted-plant",
                children: ul(
                    { className: "space-y-2" },
                    ...(myPlants || []).slice(0, 4).map((record) => {
                        const label = record?.payload?.nickname
                            || record?.catalogPlant?.commonName
                            || "Unnamed plant";
                        const room = record?.payload?.room || "No room set";

                        return li(
                            {
                                key: `home-plant-${record.id}`,
                                className: "flex items-center justify-between rounded-[1rem] bg-white/70 px-3 py-2 ring-1 ring-slate-200/70"
                            },
                            div(
                                { className: "min-w-0 flex-1" },
                                h3({ className: "truncate text-sm font-semibold text-slate-800" }, label),
                                p({ className: "text-xs text-slate-500" }, room)
                            ),
                            AppButton({ label: "Open", icon: "arrow-right", onClick: () => onOpenPlant && onOpenPlant(record) })
                        );
                    })
                )
            }),
        SectionDivider({ label: "Log" }),
        SectionCard({
            title: "Journal Pulse",
            subtitle: "Latest care observations",
            icon: "notepad",
            children: (recentEntries || []).length === 0
                ? p({ className: "text-sm text-slate-500" }, "No journal notes yet.")
                : ul(
                    { className: "space-y-2" },
                    ...(recentEntries || []).slice(0, 3).map((entry) => li(
                        {
                            key: `home-journal-${entry.id}`,
                            className: "rounded-[1rem] bg-white/70 p-3 ring-1 ring-slate-200/70"
                        },
                        p({ className: "inline-flex items-center gap-1 text-xs text-slate-500" },
                            Icon({ name: "clock", className: "text-sm" }),
                            new Date(entry.payload.createdAt).toLocaleString()
                        ),
                        p({ className: "mt-1 text-sm text-slate-700" }, entry.payload.note)
                    ))
                )
        })
    );
}
