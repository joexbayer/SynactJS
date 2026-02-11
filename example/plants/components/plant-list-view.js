import { div, h3, p, img, ul, li } from "./runtime.js";
import {
    SectionCard,
    SectionDivider,
    StatTile,
    InputField,
    SelectField,
    AppButton,
    Badge,
    EmptyState
} from "./ui.js";

function difficultyTone(difficulty) {
    if (difficulty === "easy") return "safe";
    if (difficulty === "hard") return "danger";
    return "warning";
}

function petTone(petSafety) {
    return petSafety === "pet-safe" ? "safe" : "danger";
}

export function PlantListView({
    search,
    filters,
    filterOptions,
    catalogPlants,
    myPlants,
    onSearchChange,
    onFilterChange,
    onSelectPlant,
    onOpenMyPlant,
    onAddPlant
} = {}) {
    const trackedByCatalogId = new Set(
        (myPlants || []).map((record) => record?.payload?.catalogPlantId).filter(Boolean)
    );

    return div(
        { className: "space-y-4" },
        SectionCard({
            title: "My Plant Space",
            subtitle: "Track your collection while browsing the full reference catalog.",
            icon: "plant",
            children: div(
                { className: "grid grid-cols-2 gap-3" },
                StatTile({
                    label: "Tracked plants",
                    value: String((myPlants || []).length),
                    hint: "Saved locally",
                    tone: "positive",
                    icon: "potted-plant"
                }),
                StatTile({
                    label: "Catalog size",
                    value: String((catalogPlants || []).length),
                    hint: "Filtered results",
                    icon: "stack"
                })
            )
        }),
        SectionDivider({ label: "Discover" }),
        SectionCard({
            title: "Find a Plant",
            subtitle: "Filter by care constraints to shortlist good fits.",
            icon: "magnifying-glass",
            children: div(
                { className: "grid gap-3 sm:grid-cols-2" },
                InputField({
                    label: "Search",
                    icon: "magnifying-glass",
                    value: search,
                    placeholder: "Snake, monstera, pet safe...",
                    onInput: (event) => onSearchChange && onSearchChange(event.target.value)
                }),
                SelectField({
                    label: "Light",
                    icon: "sun",
                    value: filters?.light || "all",
                    options: (filterOptions?.light || []).map((value) => ({
                        value,
                        label: value === "all" ? "All light levels" : value
                    })),
                    onInput: (event) => onFilterChange && onFilterChange("light", event.target.value)
                }),
                SelectField({
                    label: "Difficulty",
                    icon: "stairs",
                    value: filters?.difficulty || "all",
                    options: (filterOptions?.difficulty || []).map((value) => ({
                        value,
                        label: value === "all" ? "All difficulties" : value
                    })),
                    onInput: (event) => onFilterChange && onFilterChange("difficulty", event.target.value)
                }),
                SelectField({
                    label: "Pet safety",
                    icon: "paw-print",
                    value: filters?.petSafety || "all",
                    options: (filterOptions?.petSafety || []).map((value) => ({
                        value,
                        label: value === "all" ? "All safety levels" : value
                    })),
                    onInput: (event) => onFilterChange && onFilterChange("petSafety", event.target.value)
                })
            )
        }),
        (myPlants || []).length > 0 ? SectionDivider({ label: "My Plants" }) : null,
        (myPlants || []).length > 0
            ? SectionCard({
                title: "Your Collection",
                subtitle: "Tap a plant to open notes, watering, and photo tools.",
                icon: "flower-lotus",
                children: ul(
                    { className: "space-y-2" },
                    ...(myPlants || []).map((record) => {
                        const plantName = record?.payload?.nickname
                            || record?.catalogPlant?.commonName
                            || "Unnamed plant";
                        const lastWatered = record?.payload?.lastWateredAt
                            ? new Date(record.payload.lastWateredAt).toLocaleDateString()
                            : "Not tracked";

                        return li(
                            {
                                key: `mine-${record.id}`,
                                className: "rounded-[1rem] bg-white/70 p-3 ring-1 ring-slate-200/70"
                            },
                            div(
                                { className: "flex items-center justify-between gap-3" },
                                div(
                                    { className: "min-w-0" },
                                    h3({ className: "truncate text-sm font-semibold text-slate-900" }, plantName),
                                    p({ className: "text-xs text-slate-500" }, `Last watered: ${lastWatered}`)
                                ),
                                AppButton({
                                    label: "Open",
                                    icon: "arrow-square-out",
                                    variant: "secondary",
                                    className: "h-9",
                                    onClick: () => onOpenMyPlant && onOpenMyPlant(record)
                                })
                            )
                        );
                    })
                )
            })
            : null,
        SectionDivider({ label: "Catalog" }),
        (catalogPlants || []).length === 0
            ? EmptyState({
                title: "No plants matched",
                text: "Try clearing one filter or broadening your search.",
                action: AppButton({
                    label: "Reset filters",
                    icon: "arrow-counter-clockwise",
                    onClick: () => {
                        onSearchChange && onSearchChange("");
                        onFilterChange && onFilterChange("light", "all");
                        onFilterChange && onFilterChange("difficulty", "all");
                        onFilterChange && onFilterChange("petSafety", "all");
                    }
                })
            })
            : div(
                { className: "grid gap-3" },
                ...(catalogPlants || []).map((plant) => {
                    const isTracked = trackedByCatalogId.has(plant.id);

                    return SectionCard({
                        key: `catalog-${plant.id}`,
                        className: "surface-card overflow-hidden p-0",
                        children: div(
                            { className: "sm:flex" },
                            img({
                                src: plant.image,
                                alt: plant.commonName,
                                className: "h-40 w-full object-cover sm:h-auto sm:w-40"
                            }),
                            div(
                                { className: "flex-1 space-y-3 p-4" },
                                div(
                                    { className: "space-y-1" },
                                    h3({ className: "text-lg font-bold text-slate-900" }, plant.commonName),
                                    p({ className: "text-sm italic text-slate-500" }, plant.latinName),
                                    p({ className: "text-sm text-slate-600" }, plant.summary)
                                ),
                                div(
                                    { className: "flex flex-wrap gap-2" },
                                    Badge({ label: plant.difficulty, tone: difficultyTone(plant.difficulty) }),
                                    Badge({ label: plant.petSafety, tone: petTone(plant.petSafety) }),
                                    Badge({ label: plant.light })
                                ),
                                div(
                                    { className: "grid grid-cols-2 gap-2" },
                                    AppButton({
                                        label: "Details",
                                        icon: "info",
                                        variant: "secondary",
                                        onClick: () => onSelectPlant && onSelectPlant(plant.id)
                                    }),
                                    AppButton({
                                        label: isTracked ? "Open my entry" : "Add to mine",
                                        icon: isTracked ? "arrow-square-out" : "plus-circle",
                                        variant: isTracked ? "secondary" : "primary",
                                        onClick: () => {
                                            if (isTracked) {
                                                onSelectPlant && onSelectPlant(plant.id);
                                                return;
                                            }
                                            onAddPlant && onAddPlant(plant.id);
                                        }
                                    })
                                )
                            )
                        )
                    });
                })
            )
    );
}
