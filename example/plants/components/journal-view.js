import { useEffect, useForm, div, h3, p, ul, li } from "./runtime.js";
import {
    SectionCard,
    SectionDivider,
    SelectField,
    TextAreaField,
    AppButton,
    EmptyState,
    Badge
} from "./ui.js";

function moodTone(mood) {
    if (mood === "great") return "safe";
    if (mood === "struggling") return "danger";
    return "warning";
}

export function JournalView({ entries, myPlants, onAddEntry, onDeleteEntry } = {}) {
    const form = useForm({
        initialValues: {
            plantId: myPlants?.[0]?.id || "",
            mood: "steady",
            note: ""
        }
    });

    useEffect(() => {
        if (!form.values.plantId && myPlants?.[0]?.id) {
            form.setField("plantId", myPlants[0].id);
        }
    }, [form.values.plantId, myPlants?.[0]?.id]);

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: "Journal Entry",
            subtitle: "Capture observations after watering, pruning, or moving plants.",
            icon: "notepad",
            children: div(
                { className: "space-y-3" },
                SelectField({
                    label: "Plant",
                    icon: "flower-lotus",
                    value: form.values.plantId,
                    options: (myPlants || []).map((record) => ({
                        value: record.id,
                        label: record.payload.nickname || record.catalogPlant?.commonName || "Unnamed plant"
                    })),
                    onInput: form.bind("plantId").onInput
                }),
                SelectField({
                    label: "Health signal",
                    icon: "heartbeat",
                    value: form.values.mood,
                    options: [
                        { value: "great", label: "Great" },
                        { value: "steady", label: "Steady" },
                        { value: "struggling", label: "Struggling" }
                    ],
                    onInput: form.bind("mood").onInput
                }),
                TextAreaField({
                    label: "Notes",
                    icon: "pencil-simple-line",
                    value: form.values.note,
                    rows: 4,
                    placeholder: "New growth, droop, pests, humidity, or watering response...",
                    onInput: form.bind("note").onInput
                }),
                AppButton({
                    label: "Save entry",
                    icon: "floppy-disk",
                    variant: "primary",
                    disabled: !form.values.plantId || !String(form.values.note || "").trim(),
                    onClick: async () => {
                        if (!form.values.plantId || !String(form.values.note || "").trim()) return;
                        await onAddEntry?.({
                            plantId: form.values.plantId,
                            mood: form.values.mood,
                            note: String(form.values.note || "").trim()
                        });
                        form.setField("note", "");
                    }
                })
            )
        }),
        SectionDivider({ label: "History" }),
        (entries || []).length === 0
            ? EmptyState({
                title: "No journal entries yet",
                text: "Create an entry after your next plant care routine."
            })
            : SectionCard({
                title: "Recent Entries",
                subtitle: `${entries.length} saved entries`,
                icon: "clock-counter-clockwise",
                children: ul(
                    { className: "space-y-3" },
                    ...(entries || []).map((entry) => {
                        const createdAt = entry?.payload?.createdAt
                            ? new Date(entry.payload.createdAt).toLocaleString()
                            : "Unknown date";
                        const plantLabel = entry?.plantRecord?.payload?.nickname
                            || entry?.plantRecord?.catalogPlant?.commonName
                            || "Plant";

                        return li(
                            {
                                key: `entry-${entry.id}`,
                                className: "rounded-[1rem] bg-white/70 p-3 ring-1 ring-slate-200/70"
                            },
                            div(
                                { className: "flex items-start justify-between gap-3" },
                                div(
                                    { className: "space-y-1" },
                                    div({ className: "flex items-center gap-2" },
                                        h3({ className: "text-sm font-semibold text-slate-800" }, plantLabel),
                                        Badge({ label: entry?.payload?.mood || "steady", tone: moodTone(entry?.payload?.mood) })
                                    ),
                                    p({ className: "text-xs text-slate-500" }, createdAt),
                                    p({ className: "text-sm text-slate-600" }, entry?.payload?.note || "")
                                ),
                                AppButton({
                                    label: "Delete",
                                    icon: "trash",
                                    variant: "ghost",
                                    onClick: () => onDeleteEntry && onDeleteEntry(entry.id)
                                })
                            )
                        );
                    })
                )
            })
    );
}
