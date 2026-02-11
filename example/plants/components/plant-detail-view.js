import { useEffect, useForm, div, h3, p, img } from "./runtime.js";
import {
    SectionCard,
    SectionDivider,
    InputField,
    TextAreaField,
    SelectField,
    AppButton,
    Badge,
    EmptyState
} from "./ui.js";

function createDraft(plant, myPlantRecord) {
    return {
        id: myPlantRecord?.id || "",
        nickname: myPlantRecord?.payload?.nickname || plant?.commonName || "",
        room: myPlantRecord?.payload?.room || "",
        wateringCadence: myPlantRecord?.payload?.wateringCadence || plant?.water || "",
        notes: myPlantRecord?.payload?.notes || ""
    };
}

function difficultyTone(difficulty) {
    if (difficulty === "easy") return "safe";
    if (difficulty === "hard") return "danger";
    return "warning";
}

export function PlantDetailView({
    plant,
    myPlantRecord,
    imagePayload,
    onBack,
    onSave,
    onMarkWatered,
    onRemove,
    onUploadImage
} = {}) {
    const form = useForm({
        initialValues: createDraft(plant, myPlantRecord)
    });

    useEffect(() => {
        form.reset(createDraft(plant, myPlantRecord));
    }, [plant?.id, myPlantRecord?.id]);

    if (!plant) {
        return EmptyState({
            title: "No plant selected",
            text: "Open the Plants view and choose a plant to inspect details."
        });
    }

    const tracked = Boolean(myPlantRecord?.id);
    const displayImage = imagePayload?.dataUrl || plant.image;
    const lastWatered = myPlantRecord?.payload?.lastWateredAt
        ? new Date(myPlantRecord.payload.lastWateredAt).toLocaleString()
        : "Not tracked yet";

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: plant.commonName,
            subtitle: plant.latinName,
            icon: "plant",
            actions: AppButton({ label: "Back", icon: "arrow-left", onClick: onBack }),
            className: "surface-card overflow-hidden p-0",
            children: div(
                { className: "space-y-4" },
                img({
                    src: displayImage,
                    alt: plant.commonName,
                    className: "h-56 w-full object-cover"
                }),
                div(
                    { className: "space-y-3 px-4 pb-4" },
                    p({ className: "text-sm text-slate-600" }, plant.description),
                    div(
                        { className: "flex flex-wrap gap-2" },
                        Badge({ label: `Light: ${plant.light}` }),
                        Badge({ label: `Water: ${plant.water}` }),
                        Badge({ label: `Difficulty: ${plant.difficulty}`, tone: difficultyTone(plant.difficulty) }),
                        Badge({
                            label: plant.petSafety,
                            tone: plant.petSafety === "pet-safe" ? "safe" : "danger"
                        })
                    ),
                    div(
                        { className: "grid grid-cols-2 gap-2" },
                        AppButton({
                            label: tracked ? "Save changes" : "Add to my plants",
                            icon: tracked ? "floppy-disk" : "plus-circle",
                            variant: "primary",
                            onClick: () => onSave && onSave({ ...form.values, catalogPlantId: plant.id })
                        }),
                        tracked
                            ? AppButton({
                                label: "Watered now",
                                icon: "drop-half-bottom",
                                onClick: () => onMarkWatered && onMarkWatered(myPlantRecord.id)
                            })
                            : AppButton({
                                label: "Track first",
                                icon: "lock",
                                disabled: true
                            })
                    ),
                    tracked
                        ? AppButton({
                            label: "Remove from my plants",
                            icon: "trash",
                            variant: "danger",
                            className: "w-full",
                            onClick: () => onRemove && onRemove(myPlantRecord.id)
                        })
                        : null
                )
            )
        }),
        SectionDivider({ label: "Personalization" }),
        SectionCard({
            title: "Personal Notes",
            subtitle: `Last watered: ${lastWatered}`,
            icon: "note-pencil",
            children: div(
                { className: "grid gap-3 sm:grid-cols-2" },
                InputField({
                    label: "Display name",
                    icon: "text-aa",
                    value: form.values.nickname,
                    placeholder: "My living room pothos",
                    onInput: form.bind("nickname").onInput
                }),
                InputField({
                    label: "Room",
                    icon: "house-line",
                    value: form.values.room,
                    placeholder: "Living room",
                    onInput: form.bind("room").onInput
                }),
                SelectField({
                    label: "Watering cadence",
                    icon: "timer",
                    value: form.values.wateringCadence,
                    options: [
                        { value: "every-4-6-days", label: "Every 4-6 days" },
                        { value: "every-5-7-days", label: "Every 5-7 days" },
                        { value: "every-1-week", label: "Weekly" },
                        { value: "every-1-2-weeks", label: "Every 1-2 weeks" },
                        { value: "every-2-3-weeks", label: "Every 2-3 weeks" },
                        { value: "every-2-4-weeks", label: "Every 2-4 weeks" }
                    ],
                    onInput: form.bind("wateringCadence").onInput
                }),
                InputField({
                    label: "Photo",
                    icon: "image",
                    type: "file",
                    helper: "Stored locally as a data URL (best with IndexedDB).",
                    onInput: (event) => {
                        const file = event?.target?.files?.[0];
                        if (file && onUploadImage && tracked) {
                            onUploadImage(myPlantRecord.id, file);
                        }
                    }
                }),
                TextAreaField({
                    label: "Care notes",
                    icon: "notepad",
                    value: form.values.notes,
                    rows: 5,
                    className: "sm:col-span-2",
                    placeholder: "Notes about light response, pests, leaf changes, etc.",
                    onInput: form.bind("notes").onInput
                })
            )
        }),
        SectionDivider({ label: "Reference" }),
        SectionCard({
            title: "Care Reference",
            subtitle: plant.summary,
            icon: "books",
            children: div(
                { className: "grid gap-3 sm:grid-cols-2" },
                div(
                    { className: "space-y-2 rounded-[1rem] bg-white/65 p-3 ring-1 ring-slate-200/70" },
                    h3({ className: "text-sm font-bold text-slate-800" }, "Routine"),
                    p({ className: "text-sm text-slate-600" }, `Soil: ${plant.care.soil}`),
                    p({ className: "text-sm text-slate-600" }, `Feed: ${plant.care.fertilizer}`),
                    p({ className: "text-sm text-slate-600" }, `Repot: ${plant.care.repotting}`),
                    p({ className: "text-sm text-slate-600" }, `Prune: ${plant.care.pruning}`)
                ),
                div(
                    { className: "space-y-2 rounded-[1rem] bg-white/65 p-3 ring-1 ring-slate-200/70" },
                    h3({ className: "text-sm font-bold text-slate-800" }, "Troubleshooting"),
                    p({ className: "text-sm text-slate-600" }, `Underwatered: ${plant.signs.underwatered}`),
                    p({ className: "text-sm text-slate-600" }, `Overwatered: ${plant.signs.overwatered}`),
                    p({ className: "text-sm text-slate-600" }, `Low light: ${plant.signs.lowLight}`),
                    p({ className: "pt-1 text-xs text-slate-500" }, `Fun fact: ${plant.funFact}`)
                )
            )
        })
    );
}
