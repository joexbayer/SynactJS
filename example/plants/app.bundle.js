(() => {
  // ../example/plants/components/runtime.js
  var core = window.SynactJSCore || (typeof window.h === "function" && typeof window.useState === "function" ? window : null);
  if (!core) {
    throw new Error("SynactJS runtime is not available. Ensure ../../framework/synact.js is loaded before app modules.");
  }
  var {
    h,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useForm,
    div,
    main,
    header,
    footer,
    section,
    nav,
    i,
    button,
    h1,
    h2,
    h3,
    p,
    span,
    strong,
    small,
    input,
    textarea,
    label,
    img,
    article,
    ul,
    li
  } = core;

  // ../example/plants/components/ui.js
  function cx(...tokens) {
    return tokens.filter(Boolean).join(" ");
  }
  function Icon({ name, className = "" } = {}) {
    return i({
      className: cx("ph leading-none", `ph-${name || "leaf"}`, className),
      "aria-hidden": "true"
    });
  }
  var BUTTON_STYLES = {
    primary: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-105",
    secondary: "bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200/80",
    danger: "bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:brightness-105",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
  };
  function AppButton({
    label: buttonLabel,
    children,
    onClick,
    type = "button",
    variant = "secondary",
    disabled = false,
    className = "",
    icon
  } = {}) {
    const content = children || div(
      { className: "inline-flex items-center gap-2" },
      icon ? Icon({ name: icon, className: "text-base" }) : null,
      span({}, buttonLabel)
    );
    return button(
      {
        type,
        disabled,
        onClick,
        className: cx(
          "inline-flex items-center justify-center rounded-[999px] px-3 py-2 text-sm font-semibold",
          "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          BUTTON_STYLES[variant] || BUTTON_STYLES.secondary,
          className
        )
      },
      content
    );
  }
  function SectionCard({ title, subtitle, actions, children, className = "", icon } = {}) {
    const isSurfaceCard = className.includes("surface-card");
    const normalizedClassName = className.replace("surface-card", "").trim();
    return div(
      {
        className: cx(
          isSurfaceCard ? "overflow-hidden rounded-[1.3rem] bg-white/80 shadow-[0_16px_24px_-20px_rgba(15,23,42,0.5)]" : "py-3",
          normalizedClassName
        )
      },
      title || subtitle || actions ? div(
        { className: cx("flex items-start justify-between gap-3", isSurfaceCard ? "p-4 pb-2" : "") },
        div(
          { className: "min-w-0" },
          title ? div(
            { className: "flex items-center gap-2" },
            icon ? div(
              {
                className: "grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700"
              },
              Icon({ name: icon, className: "text-[15px]" })
            ) : null,
            h2({ className: "text-base font-bold text-slate-900" }, title)
          ) : null,
          subtitle ? p({ className: "mt-1 text-sm text-slate-600" }, subtitle) : null
        ),
        actions ? div({ className: "shrink-0" }, actions) : null
      ) : null,
      !isSurfaceCard && (title || subtitle || actions) ? div({ className: "mt-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" }) : null,
      div(
        { className: cx(isSurfaceCard ? "p-4 pt-3" : "mt-3") },
        children
      )
    );
  }
  function StatTile({ label: tileLabel, value, hint, tone = "neutral", icon } = {}) {
    const toneClass = tone === "positive" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-slate-700";
    return div(
      {
        className: "rounded-[1rem] bg-white/65 px-3 py-2"
      },
      div(
        { className: "flex items-center justify-between" },
        p({ className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500" }, tileLabel || "Metric"),
        icon ? Icon({ name: icon, className: "text-slate-400" }) : null
      ),
      p({ className: cx("mt-1 text-2xl font-black", toneClass) }, value == null ? "-" : String(value)),
      hint ? p({ className: "mt-1 text-xs text-slate-500" }, hint) : null
    );
  }
  function InputField({
    label: fieldLabel,
    value,
    onInput,
    placeholder,
    type = "text",
    className = "",
    helper,
    icon
  } = {}) {
    const inputProps = {
      type,
      placeholder,
      onInput,
      className: cx(
        "w-full rounded-[1rem] bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-emerald-200",
        "focus:outline-none focus:ring-2 focus:ring-emerald-300"
      )
    };
    if (type !== "file") {
      inputProps.value = value ?? "";
    }
    return div(
      { className: cx("space-y-1", className) },
      fieldLabel ? label(
        { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
        icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
        fieldLabel
      ) : null,
      input(inputProps),
      helper ? p({ className: "text-xs text-slate-500" }, helper) : null
    );
  }
  function TextAreaField({
    label: fieldLabel,
    value,
    onInput,
    placeholder,
    rows = 4,
    className = "",
    helper,
    icon
  } = {}) {
    return div(
      { className: cx("space-y-1", className) },
      fieldLabel ? label(
        { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
        icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
        fieldLabel
      ) : null,
      textarea({
        value: value ?? "",
        rows,
        placeholder,
        onInput,
        className: cx(
          "w-full rounded-[1rem] bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-emerald-200",
          "focus:outline-none focus:ring-2 focus:ring-emerald-300"
        )
      }),
      helper ? p({ className: "text-xs text-slate-500" }, helper) : null
    );
  }
  function SelectField({
    label: fieldLabel,
    value,
    onInput,
    options = [],
    className = "",
    helper,
    icon,
    placeholder = "Select an option"
  } = {}) {
    const [open, setOpen] = useState(false);
    const selectId = useMemo(() => `select-${Math.random().toString(36).slice(2, 9)}`, []);
    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find((entry) => String(entry.value) === String(value)) || null;
    const selectedLabel = selectedOption ? selectedOption.label : placeholder;
    useEffect(() => {
      if (!open) return void 0;
      function onDocumentClick(event) {
        const owner = event.target?.closest?.(`[data-select-id="${selectId}"]`);
        if (!owner) {
          setOpen(false);
        }
      }
      function onDocumentKeydown(event) {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }
      document.addEventListener("click", onDocumentClick);
      document.addEventListener("keydown", onDocumentKeydown);
      return () => {
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onDocumentKeydown);
      };
    }, [open, selectId]);
    function emitSelection(nextValue) {
      if (typeof onInput === "function") {
        onInput({ target: { value: nextValue } });
      }
      setOpen(false);
    }
    return div(
      { className: cx("space-y-1", className) },
      fieldLabel ? label(
        { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
        icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
        fieldLabel
      ) : null,
      div(
        {
          className: "relative",
          "data-select-id": selectId
        },
        button(
          {
            type: "button",
            onClick: () => setOpen((prev) => !prev),
            "aria-expanded": String(open),
            className: cx(
              "flex w-full items-center justify-between rounded-[1rem] bg-white px-3 py-2 text-sm",
              "text-slate-900 ring-1 ring-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            )
          },
          span({ className: selectedOption ? "text-slate-900" : "text-slate-400" }, selectedLabel),
          Icon({ name: open ? "caret-up" : "caret-down", className: "text-slate-500" })
        ),
        open ? ul(
          {
            className: "absolute left-0 right-0 top-full z-40 mt-2 max-h-56 overflow-auto rounded-[1rem] bg-white p-1 shadow-2xl ring-1 ring-emerald-200"
          },
          ...safeOptions.map((entry) => {
            const active = selectedOption && String(entry.value) === String(selectedOption.value);
            return li(
              {
                key: `select-item-${selectId}-${entry.value}`
              },
              button(
                {
                  type: "button",
                  className: cx(
                    "flex w-full items-center justify-between rounded-[0.85rem] px-3 py-2 text-left text-sm",
                    active ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-emerald-50"
                  ),
                  onClick: () => emitSelection(entry.value)
                },
                span({}, entry.label),
                active ? Icon({ name: "check", className: "text-emerald-700" }) : null
              )
            );
          })
        ) : null
      ),
      helper ? p({ className: "text-xs text-slate-500" }, helper) : null
    );
  }
  function ToggleField({ label: fieldLabel, checked, onInput, helper } = {}) {
    return label(
      {
        className: "flex items-start gap-3 rounded-[1rem] bg-white/75 p-3 ring-1 ring-emerald-200/70"
      },
      input({
        type: "checkbox",
        checked: Boolean(checked),
        onInput,
        className: "mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-300"
      }),
      div(
        { className: "space-y-1" },
        span({ className: "block text-sm font-semibold text-slate-800" }, fieldLabel || "Enabled"),
        helper ? span({ className: "block text-xs text-slate-500" }, helper) : null
      )
    );
  }
  function Badge({ label: badgeLabel, tone = "neutral" } = {}) {
    const toneClass = tone === "safe" ? "bg-emerald-100 text-emerald-700" : tone === "danger" ? "bg-rose-100 text-rose-700" : tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700";
    return span(
      {
        className: cx("inline-flex rounded-full px-2 py-1 text-xs font-semibold", toneClass)
      },
      badgeLabel || "Label"
    );
  }
  function SectionDivider({ label: dividerLabel = "" } = {}) {
    return div(
      {
        className: "relative my-1 py-2"
      },
      div({ className: "h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" }),
      dividerLabel ? div(
        { className: "pointer-events-none absolute inset-0 grid place-items-center" },
        span(
          { className: "rounded-full bg-[#fffdf8] px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" },
          dividerLabel
        )
      ) : null
    );
  }
  function AccordionSection({
    title,
    subtitle,
    icon,
    defaultOpen = false,
    children,
    className = ""
  } = {}) {
    const [open, setOpen] = useState(Boolean(defaultOpen));
    return div(
      {
        className: cx(
          "overflow-hidden rounded-[1.2rem] bg-white/80 ring-1 ring-emerald-200/70",
          className
        )
      },
      button(
        {
          type: "button",
          onClick: () => setOpen((prev) => !prev),
          className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        },
        div(
          { className: "min-w-0" },
          div(
            { className: "inline-flex items-center gap-2" },
            icon ? Icon({
              name: icon,
              className: "text-base text-emerald-700"
            }) : null,
            h3({ className: "text-sm font-bold text-slate-900" }, title || "Section")
          ),
          subtitle ? p({ className: "mt-1 text-xs text-slate-500" }, subtitle) : null
        ),
        Icon({ name: open ? "caret-up" : "caret-down", className: "text-slate-500" })
      ),
      open ? div(
        {
          className: "border-t border-emerald-100/80 px-4 py-3"
        },
        children
      ) : null
    );
  }
  function EmptyState({ title, text, action } = {}) {
    return div(
      {
        className: "rounded-[1.2rem] bg-white/70 p-6 text-center ring-1 ring-emerald-200/60"
      },
      Icon({ name: "plant", className: "mx-auto text-3xl text-emerald-600" }),
      h3({ className: "mt-2 text-base font-semibold text-slate-800" }, title || "No data yet"),
      text ? p({ className: "mt-2 text-sm text-slate-500" }, text) : null,
      action ? div({ className: "mt-4" }, action) : null
    );
  }

  // ../example/plants/components/app-shell.js
  var NAV_ITEMS = [
    { id: "home", label: "Home", icon: "house" },
    { id: "plants", label: "Plants", icon: "leaf" },
    { id: "journal", label: "Journal", icon: "notepad" },
    { id: "sync", label: "Sync", icon: "cloud" },
    { id: "settings", label: "Settings", icon: "gear-six" }
  ];
  function AppShell({
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
    const accentClass = accentColor === "teal" ? "from-teal-700 via-emerald-600 to-cyan-500" : accentColor === "rose" ? "from-rose-700 via-orange-500 to-amber-400" : accentColor === "sky" ? "from-sky-700 via-indigo-600 to-violet-500" : "from-emerald-700 via-green-600 to-lime-500";
    return div(
      {
        className: "mx-auto min-h-screen w-full max-w-3xl bg-gradient-to-b from-orange-50 via-emerald-50/40 to-amber-50 pb-24 text-slate-900"
      },
      status ? div(
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
      ) : null,
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

  // ../example/plants/components/home-view.js
  function HomeView({
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
      return diffMs > 7 * 24 * 60 * 60 * 1e3;
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
      (myPlants || []).length === 0 ? EmptyState({
        title: "Start your collection",
        text: "Add plants from the catalog to unlock watering and journal tools.",
        action: AppButton({ label: "Browse plants", icon: "leaf", variant: "primary", onClick: onNavigatePlants })
      }) : SectionCard({
        title: "Recently Tracked",
        subtitle: "Quick jump into your saved entries",
        icon: "potted-plant",
        children: ul(
          { className: "space-y-2" },
          ...(myPlants || []).slice(0, 4).map((record) => {
            const label2 = record?.payload?.nickname || record?.catalogPlant?.commonName || "Unnamed plant";
            const room = record?.payload?.room || "No room set";
            return li(
              {
                key: `home-plant-${record.id}`,
                className: "flex items-center justify-between rounded-[1rem] bg-white/70 px-3 py-2 ring-1 ring-slate-200/70"
              },
              div(
                { className: "min-w-0 flex-1" },
                h3({ className: "truncate text-sm font-semibold text-slate-800" }, label2),
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
        children: (recentEntries || []).length === 0 ? p({ className: "text-sm text-slate-500" }, "No journal notes yet.") : ul(
          { className: "space-y-2" },
          ...(recentEntries || []).slice(0, 3).map((entry) => li(
            {
              key: `home-journal-${entry.id}`,
              className: "rounded-[1rem] bg-white/70 p-3 ring-1 ring-slate-200/70"
            },
            p(
              { className: "inline-flex items-center gap-1 text-xs text-slate-500" },
              Icon({ name: "clock", className: "text-sm" }),
              new Date(entry.payload.createdAt).toLocaleString()
            ),
            p({ className: "mt-1 text-sm text-slate-700" }, entry.payload.note)
          ))
        )
      })
    );
  }

  // ../example/plants/components/plant-list-view.js
  function difficultyTone(difficulty) {
    if (difficulty === "easy") return "safe";
    if (difficulty === "hard") return "danger";
    return "warning";
  }
  function petTone(petSafety) {
    return petSafety === "pet-safe" ? "safe" : "danger";
  }
  function PlantListView({
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
      (myPlants || []).length > 0 ? SectionCard({
        title: "Your Collection",
        subtitle: "Tap a plant to open notes, watering, and photo tools.",
        icon: "flower-lotus",
        children: ul(
          { className: "space-y-2" },
          ...(myPlants || []).map((record) => {
            const plantName = record?.payload?.nickname || record?.catalogPlant?.commonName || "Unnamed plant";
            const lastWatered = record?.payload?.lastWateredAt ? new Date(record.payload.lastWateredAt).toLocaleDateString() : "Not tracked";
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
      }) : null,
      SectionDivider({ label: "Catalog" }),
      (catalogPlants || []).length === 0 ? EmptyState({
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
      }) : div(
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

  // ../example/plants/components/plant-detail-view.js
  function createDraft(plant, myPlantRecord) {
    return {
      id: myPlantRecord?.id || "",
      nickname: myPlantRecord?.payload?.nickname || plant?.commonName || "",
      room: myPlantRecord?.payload?.room || "",
      wateringCadence: myPlantRecord?.payload?.wateringCadence || plant?.water || "",
      notes: myPlantRecord?.payload?.notes || ""
    };
  }
  function difficultyTone2(difficulty) {
    if (difficulty === "easy") return "safe";
    if (difficulty === "hard") return "danger";
    return "warning";
  }
  function PlantDetailView({
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
    const lastWatered = myPlantRecord?.payload?.lastWateredAt ? new Date(myPlantRecord.payload.lastWateredAt).toLocaleString() : "Not tracked yet";
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
              Badge({ label: `Difficulty: ${plant.difficulty}`, tone: difficultyTone2(plant.difficulty) }),
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
              tracked ? AppButton({
                label: "Watered now",
                icon: "drop-half-bottom",
                onClick: () => onMarkWatered && onMarkWatered(myPlantRecord.id)
              }) : AppButton({
                label: "Track first",
                icon: "lock",
                disabled: true
              })
            ),
            tracked ? AppButton({
              label: "Remove from my plants",
              icon: "trash",
              variant: "danger",
              className: "w-full",
              onClick: () => onRemove && onRemove(myPlantRecord.id)
            }) : null
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

  // ../example/plants/components/journal-view.js
  function moodTone(mood) {
    if (mood === "great") return "safe";
    if (mood === "struggling") return "danger";
    return "warning";
  }
  function JournalView({ entries, myPlants, onAddEntry, onDeleteEntry } = {}) {
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
      (entries || []).length === 0 ? EmptyState({
        title: "No journal entries yet",
        text: "Create an entry after your next plant care routine."
      }) : SectionCard({
        title: "Recent Entries",
        subtitle: `${entries.length} saved entries`,
        icon: "clock-counter-clockwise",
        children: ul(
          { className: "space-y-3" },
          ...(entries || []).map((entry) => {
            const createdAt = entry?.payload?.createdAt ? new Date(entry.payload.createdAt).toLocaleString() : "Unknown date";
            const plantLabel = entry?.plantRecord?.payload?.nickname || entry?.plantRecord?.catalogPlant?.commonName || "Plant";
            return li(
              {
                key: `entry-${entry.id}`,
                className: "rounded-[1rem] bg-white/70 p-3 ring-1 ring-slate-200/70"
              },
              div(
                { className: "flex items-start justify-between gap-3" },
                div(
                  { className: "space-y-1" },
                  div(
                    { className: "flex items-center gap-2" },
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

  // ../example/plants/components/sync-view.js
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
  function SyncView({
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
            syncState?.lastError ? `Last error: ${syncState.lastError}` : `Last sync: ${formatSyncTime(syncState?.lastSyncAt)} (${syncState?.lastSyncDirection || "none"})`
          ),
          p(
            { className: "text-xs text-slate-500" },
            `Server: ${settings?.syncServerUrl || "Not configured"} \xB7 App ID: ${settings?.syncAppId || "Not configured"}`
          ),
          p(
            { className: "text-xs text-slate-500" },
            settings?.syncAutoEnabled ? `Auto sync: every ${Number(settings?.syncAutoIntervalMinutes || 30)} min (${settings?.syncAutoDirection || "both"})` : "Auto sync: disabled"
          )
        )
      }),
      AccordionSection({
        title: isAuthenticated ? "Account" : "Sign In / Register",
        subtitle: isAuthenticated ? `Signed in as ${syncState?.user?.email || "user"}` : "Use your account credentials and local encryption passphrase.",
        icon: "user-circle",
        defaultOpen: !isAuthenticated,
        children: isAuthenticated ? div(
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
        ) : div(
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
      isAuthenticated ? AccordionSection({
        title: "Sync Actions",
        subtitle: "Pull and push are unlocked once signed in.",
        icon: "arrows-clockwise",
        defaultOpen: true,
        children: div(
          { className: "space-y-3" },
          !hasPassphrase ? div(
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
          ) : null,
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
      }) : null
    );
  }

  // ../example/plants/components/settings-view.js
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
  function SettingsView({ settings, onSaveSettings, onResetData, storageEngineName } = {}) {
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
              div(
                { className: "sm:col-span-2 grid gap-2" },
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

  // ../example/plants/services/plant-catalog.js
  var PLANT_CATALOG = [
    {
      id: "snake-plant",
      commonName: "Snake Plant",
      latinName: "Dracaena trifasciata",
      difficulty: "easy",
      light: "low-indirect",
      water: "every-2-4-weeks",
      humidity: "low",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=1200&q=80",
      summary: "Extremely resilient upright plant that tolerates neglect and low light.",
      description: "Snake plant stores water in its thick leaves and prefers drying out fully between waterings. It is ideal for bedrooms, offices, and beginner plant shelves.",
      care: {
        soil: "Fast-draining mix with perlite or pumice.",
        fertilizer: "Monthly in spring/summer at half-strength.",
        repotting: "Every 2-3 years when roots crowd the pot.",
        pruning: "Remove damaged leaves at soil level."
      },
      signs: {
        underwatered: "Wrinkled, folding leaves.",
        overwatered: "Soft base, yellow leaves, or mushy roots.",
        lowLight: "Slow growth but usually stable."
      },
      funFact: "Often used in low-maintenance office landscaping projects."
    },
    {
      id: "pothos",
      commonName: "Golden Pothos",
      latinName: "Epipremnum aureum",
      difficulty: "easy",
      light: "medium-indirect",
      water: "every-1-2-weeks",
      humidity: "medium",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
      summary: "Fast-growing trailing vine that adapts to many indoor conditions.",
      description: "Pothos can trail from shelves or climb supports. Its variegation is brightest in medium to bright indirect light.",
      care: {
        soil: "Standard indoor mix with extra drainage.",
        fertilizer: "Every 4-6 weeks during active growth.",
        repotting: "When roots circle the pot or growth stalls.",
        pruning: "Trim vines above a node to encourage branching."
      },
      signs: {
        underwatered: "Droopy vines and dry crispy leaf edges.",
        overwatered: "Yellowing leaves and soggy soil.",
        lowLight: "Long stems with smaller leaves."
      },
      funFact: "Cuttings root easily in water, making it great for propagation."
    },
    {
      id: "zz-plant",
      commonName: "ZZ Plant",
      latinName: "Zamioculcas zamiifolia",
      difficulty: "easy",
      light: "low-indirect",
      water: "every-2-3-weeks",
      humidity: "low",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1593691509543-c55fb32e5b14?auto=format&fit=crop&w=1200&q=80",
      summary: "Glossy architectural foliage with exceptional drought tolerance.",
      description: "ZZ plant grows from underground rhizomes that store water. It thrives with infrequent watering and stable indoor temperatures.",
      care: {
        soil: "Well-draining cactus or indoor mix.",
        fertilizer: "Every 6-8 weeks in spring/summer.",
        repotting: "Only when rhizomes push against the container.",
        pruning: "Remove yellow stalks at the base."
      },
      signs: {
        underwatered: "Curling leaves and dry stems.",
        overwatered: "Yellow stems, root rot smell.",
        lowLight: "Very slow growth but usually healthy."
      },
      funFact: "Known as one of the toughest houseplants for low-light interiors."
    },
    {
      id: "monstera-deliciosa",
      commonName: "Monstera Deliciosa",
      latinName: "Monstera deliciosa",
      difficulty: "medium",
      light: "bright-indirect",
      water: "every-1-week",
      humidity: "high",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
      summary: "Large split-leaf plant that gives a tropical look indoors.",
      description: "Monsteras appreciate bright filtered light, consistent moisture, and support poles as they mature.",
      care: {
        soil: "Chunky aroid mix with bark and perlite.",
        fertilizer: "Every 3-4 weeks during spring/summer.",
        repotting: "Annually when young, then every 2 years.",
        pruning: "Trim leggy growth and propagate stem cuttings."
      },
      signs: {
        underwatered: "Curling leaves and dry edges.",
        overwatered: "Dark spots and drooping petioles.",
        lowLight: "Fewer splits in new leaves."
      },
      funFact: "Leaf fenestrations can increase as the plant matures in proper light."
    },
    {
      id: "peace-lily",
      commonName: "Peace Lily",
      latinName: "Spathiphyllum wallisii",
      difficulty: "medium",
      light: "medium-indirect",
      water: "every-1-week",
      humidity: "medium",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1509423350716-97f2360af9f4?auto=format&fit=crop&w=1200&q=80",
      summary: "Elegant broad leaves and white blooms under steady care.",
      description: "Peace lilies prefer evenly moist soil and moderate humidity. They are expressive and will droop when thirsty.",
      care: {
        soil: "Moisture-retentive mix with perlite.",
        fertilizer: "Monthly during spring/summer.",
        repotting: "When roots emerge from drainage holes.",
        pruning: "Cut spent blooms and yellow leaves."
      },
      signs: {
        underwatered: "Dramatic drooping, recovers after watering.",
        overwatered: "Persistent yellow leaves and sour soil smell.",
        lowLight: "Less blooming."
      },
      funFact: "Great visual indicator plant for watering routines."
    },
    {
      id: "rubber-plant",
      commonName: "Rubber Plant",
      latinName: "Ficus elastica",
      difficulty: "medium",
      light: "bright-indirect",
      water: "every-1-2-weeks",
      humidity: "medium",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?auto=format&fit=crop&w=1200&q=80",
      summary: "Broad glossy foliage with bold indoor presence.",
      description: "Rubber plants enjoy bright indirect light and moderate watering. Rotate regularly for symmetrical growth.",
      care: {
        soil: "Well-draining indoor mix.",
        fertilizer: "Every month in active season.",
        repotting: "Every 1-2 years as roots fill the pot.",
        pruning: "Top prune to manage height and branch."
      },
      signs: {
        underwatered: "Leaves curl and lose turgor.",
        overwatered: "Leaf drop and soft stems.",
        lowLight: "Stretching and reduced new growth."
      },
      funFact: "Mature leaves can exceed dinner-plate size in ideal conditions."
    },
    {
      id: "calathea-orbifolia",
      commonName: "Calathea Orbifolia",
      latinName: "Goeppertia orbifolia",
      difficulty: "hard",
      light: "medium-indirect",
      water: "every-4-6-days",
      humidity: "high",
      petSafety: "pet-safe",
      image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1200&q=80",
      summary: "Large striped foliage plant that prefers stable humidity.",
      description: "Calathea orbifolia needs filtered light, distilled water if possible, and high humidity to avoid crisp edges.",
      care: {
        soil: "Moisture-holding mix with good aeration.",
        fertilizer: "Diluted monthly in spring/summer.",
        repotting: "Every 1-2 years carefully.",
        pruning: "Remove damaged leaves at base."
      },
      signs: {
        underwatered: "Edges crisp and leaves curl inward.",
        overwatered: "Yellowing and soft stems.",
        lowLight: "Dull leaf pattern and slower growth."
      },
      funFact: "Leaves can subtly move through the day due to nyctinasty."
    },
    {
      id: "spider-plant",
      commonName: "Spider Plant",
      latinName: "Chlorophytum comosum",
      difficulty: "easy",
      light: "medium-indirect",
      water: "every-1-week",
      humidity: "medium",
      petSafety: "pet-safe",
      image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80",
      summary: "Classic arching foliage plant that produces easy baby plantlets.",
      description: "Spider plants are forgiving and adapt quickly. Brown tips often signal mineral buildup from tap water.",
      care: {
        soil: "Standard potting mix.",
        fertilizer: "Every 4-6 weeks in growth season.",
        repotting: "When roots become dense and potbound.",
        pruning: "Trim brown tips and remove spent runners."
      },
      signs: {
        underwatered: "Pale, folded leaves.",
        overwatered: "Limp crown and yellowing center.",
        lowLight: "Less variegation."
      },
      funFact: "One of the best starter plants for propagation practice."
    },
    {
      id: "aloe-vera",
      commonName: "Aloe Vera",
      latinName: "Aloe barbadensis",
      difficulty: "easy",
      light: "bright-direct",
      water: "every-2-3-weeks",
      humidity: "low",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
      summary: "Sun-loving succulent with medicinal gel in mature leaves.",
      description: "Aloe prefers bright light and sparse watering. Overwatering is the most common issue indoors.",
      care: {
        soil: "Cactus or succulent mix.",
        fertilizer: "Once every 6-8 weeks in spring/summer.",
        repotting: "When offsets fill container.",
        pruning: "Remove old outer leaves at base."
      },
      signs: {
        underwatered: "Thin, curling leaves.",
        overwatered: "Soft translucent leaf tissue.",
        lowLight: "Stretching and leaning."
      },
      funFact: "Offsets ('pups') can be separated into new plants."
    },
    {
      id: "parlor-palm",
      commonName: "Parlor Palm",
      latinName: "Chamaedorea elegans",
      difficulty: "easy",
      light: "low-indirect",
      water: "every-1-2-weeks",
      humidity: "medium",
      petSafety: "pet-safe",
      image: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80",
      summary: "Soft feathery palm suited to low-light corners.",
      description: "Parlor palm tolerates average indoor light and occasional missed watering, making it ideal for living rooms.",
      care: {
        soil: "Standard mix with added perlite.",
        fertilizer: "Monthly in spring/summer.",
        repotting: "Infrequent; prefers slightly snug roots.",
        pruning: "Trim only fully brown fronds."
      },
      signs: {
        underwatered: "Leaf tip crisping and droop.",
        overwatered: "Yellowing fronds and slow decline.",
        lowLight: "Very slow but steady growth."
      },
      funFact: "Historically popular in Victorian parlors for its tolerance of indoor conditions."
    },
    {
      id: "philodendron-micans",
      commonName: "Philodendron Micans",
      latinName: "Philodendron hederaceum var. hederaceum",
      difficulty: "easy",
      light: "medium-indirect",
      water: "every-1-week",
      humidity: "medium",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
      summary: "Velvety trailing vine with bronze-green leaves.",
      description: "Micans grows quickly in warm rooms and appreciates consistent, moderate moisture.",
      care: {
        soil: "Chunky but moisture-retentive mix.",
        fertilizer: "Every 4 weeks in active growth.",
        repotting: "When roots become dense.",
        pruning: "Pinch vines for fuller growth."
      },
      signs: {
        underwatered: "Leaves feel thin and limp.",
        overwatered: "Yellowing lower leaves.",
        lowLight: "Reduced leaf size and long internodes."
      },
      funFact: "Leaf color can shift with light intensity and maturity."
    },
    {
      id: "bird-of-paradise",
      commonName: "Bird of Paradise",
      latinName: "Strelitzia nicolai",
      difficulty: "hard",
      light: "bright-direct",
      water: "every-5-7-days",
      humidity: "medium",
      petSafety: "toxic",
      image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=1200&q=80",
      summary: "Statement plant with broad leaves and strong vertical habit.",
      description: "Bird of paradise requires intense light and regular watering during growth season. It can become a centerpiece tree indoors.",
      care: {
        soil: "Rich, well-draining mix.",
        fertilizer: "Every 2-4 weeks in spring/summer.",
        repotting: "When roots fill the pot densely.",
        pruning: "Remove split or damaged leaves at base."
      },
      signs: {
        underwatered: "Leaf curling and browning edges.",
        overwatered: "Soft stems and fungal spots.",
        lowLight: "No new large leaves, weak structure."
      },
      funFact: "Leaf splitting is natural in mature plants and helps airflow."
    }
  ];
  var PLANT_REFERENCE = {
    appDescription: "A practical indoor plant companion with local-first storage, custom notes, photos, and care journaling.",
    dayParts: {
      morning: "Morning is ideal for quick plant checks, rotating pots, and topping up humidity trays.",
      afternoon: "Afternoon light reveals stretch and color changes; adjust plant placement if needed.",
      evening: "Evening is great for logging notes, planning watering, and checking soil moisture trends.",
      night: "Night mode: review care logs, queue tasks for tomorrow, and avoid over-watering late."
    },
    wateringGuide: {
      "every-4-6-days": "Frequent moisture needed. Check top inch of soil before watering.",
      "every-5-7-days": "Keep evenly moist but never soggy.",
      "every-1-week": "Consistent routine watering works best.",
      "every-1-2-weeks": "Let upper soil dry before watering deeply.",
      "every-2-3-weeks": "Allow pot to dry significantly between waterings.",
      "every-2-4-weeks": "Drought tolerant. Water sparingly."
    },
    lightGuide: {
      "low-indirect": "Near a north window or several feet back from a brighter window.",
      "medium-indirect": "Bright room with no harsh direct midday sun.",
      "bright-indirect": "Very bright room with filtered light.",
      "bright-direct": "Several hours of direct sun daily."
    },
    imageStorageNote: "Image storage works by converting photos to data URLs and saving them locally. Prefer IndexedDB for larger image libraries."
  };
  function getPlantById(plantId) {
    return PLANT_CATALOG.find((plant) => plant.id === plantId) || null;
  }
  function listPlantFilters() {
    return {
      light: ["all", "low-indirect", "medium-indirect", "bright-indirect", "bright-direct"],
      difficulty: ["all", "easy", "medium", "hard"],
      petSafety: ["all", "pet-safe", "toxic"]
    };
  }

  // ../example/plants/services/plant-context.js
  function normalizeSearch(input2) {
    return String(input2 || "").trim().toLowerCase();
  }
  function includesTerm(value, term) {
    if (!term) return true;
    return String(value || "").toLowerCase().includes(term);
  }
  var PlantContextService = class {
    constructor({ catalog = PLANT_CATALOG, reference = PLANT_REFERENCE } = {}) {
      this.catalog = Array.isArray(catalog) ? catalog.slice() : [];
      this.reference = reference || {};
      this.catalogById = new Map(this.catalog.map((plant) => [plant.id, plant]));
    }
    getReference() {
      return this.reference;
    }
    getFilterOptions() {
      return listPlantFilters();
    }
    getPlantById(plantId) {
      if (this.catalogById.has(plantId)) {
        return this.catalogById.get(plantId);
      }
      return getPlantById(plantId);
    }
    listCatalog({ search = "", filters = {} } = {}) {
      const term = normalizeSearch(search);
      return this.catalog.filter((plant) => {
        if (!plant) return false;
        if (filters.light && filters.light !== "all" && plant.light !== filters.light) {
          return false;
        }
        if (filters.difficulty && filters.difficulty !== "all" && plant.difficulty !== filters.difficulty) {
          return false;
        }
        if (filters.petSafety && filters.petSafety !== "all" && plant.petSafety !== filters.petSafety) {
          return false;
        }
        if (!term) {
          return true;
        }
        return includesTerm(plant.commonName, term) || includesTerm(plant.latinName, term) || includesTerm(plant.summary, term) || includesTerm(plant.description, term) || includesTerm(plant.light, term) || includesTerm(plant.water, term) || includesTerm(plant.difficulty, term) || includesTerm(plant.petSafety, term);
      });
    }
    getDayPartTip(dayPart) {
      return this.reference?.dayParts?.[dayPart] || this.reference?.dayParts?.morning || "Check your plants and log what changed today.";
    }
    getWateringGuide(cadenceKey) {
      return this.reference?.wateringGuide?.[cadenceKey] || "Observe soil moisture before watering.";
    }
    enrichMyPlantRecord(record) {
      if (!record) return null;
      const catalogPlantId = record?.payload?.catalogPlantId;
      const catalogPlant = catalogPlantId ? this.getPlantById(catalogPlantId) : null;
      return {
        ...record,
        catalogPlant
      };
    }
  };

  // ../example/plants/services/time-service.js
  var TimeOfDayService = class {
    getNow() {
      return /* @__PURE__ */ new Date();
    }
    getDayPart(date = this.getNow()) {
      const hour = date.getHours();
      if (hour >= 5 && hour < 12) return "morning";
      if (hour >= 12 && hour < 18) return "afternoon";
      if (hour >= 18 && hour < 22) return "evening";
      return "night";
    }
    formatClock(date = this.getNow(), locale = void 0) {
      return date.toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit"
      });
    }
    formatDate(date = this.getNow(), locale = void 0) {
      return date.toLocaleDateString(locale, {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
    }
    formatHeaderLabel(date = this.getNow(), locale = void 0) {
      const dayPart = this.getDayPart(date);
      return `${this.formatDate(date, locale)} \u2022 ${this.formatClock(date, locale)} \u2022 ${dayPart}`;
    }
    startTicker(onTick, intervalMs = 60 * 1e3) {
      if (typeof onTick !== "function") {
        return () => {
        };
      }
      onTick(this.getNow());
      const timer = setInterval(() => {
        onTick(this.getNow());
      }, Math.max(1e3, Number(intervalMs) || 60 * 1e3));
      return () => clearInterval(timer);
    }
  };

  // ../example/plants/services/plants-repository.js
  var PlantsRepository = class {
    constructor({ dataApi: dataApi2, appId = "synact-plants-demo", schemaVersion = 1 } = {}) {
      if (!dataApi2) {
        throw new Error("PlantsRepository requires SynactJS.data API.");
      }
      this.dataApi = dataApi2;
      this.appId = appId;
      this.schemaVersion = schemaVersion;
      this.ready = false;
      this.collections = {
        plants: "plants",
        journal: "journal",
        settings: "settings",
        images: "images"
      };
      this.settingsId = "app-settings";
    }
    async init() {
      await this.dataApi.close().catch(() => {
      });
      await this.dataApi.init({
        appId: this.appId,
        engine: "auto",
        schemaVersion: this.schemaVersion,
        migrations: []
      });
      this.ready = true;
      await this.ensureSettings();
      return this;
    }
    ensureReady(context = "plants.repository") {
      if (!this.ready) {
        throw new Error(`Repository not initialized (${context}).`);
      }
    }
    createId(prefix) {
      const time = Date.now().toString(36);
      const random = Math.random().toString(36).slice(2, 8);
      return `${prefix}-${time}-${random}`;
    }
    defaultSettings() {
      return {
        ownerName: "Plant Keeper",
        preferredStartView: "home",
        accentColor: "emerald",
        compactMode: false,
        showOnlyPetSafe: false,
        showScientificNames: true,
        syncServerUrl: "http://localhost:8787",
        syncAppId: this.appId,
        syncEmail: "",
        syncRememberAuth: true,
        syncAutoEnabled: false,
        syncAutoIntervalMinutes: 30,
        syncAutoDirection: "both"
      };
    }
    async ensureSettings() {
      this.ensureReady("ensureSettings");
      const existing = await this.dataApi.read(this.collections.settings, this.settingsId);
      if (existing) {
        return existing;
      }
      const defaults = this.defaultSettings();
      await this.dataApi.write(this.collections.settings, this.settingsId, defaults);
      return defaults;
    }
    async getSettings() {
      this.ensureReady("getSettings");
      return this.ensureSettings();
    }
    async updateSettings(patch) {
      this.ensureReady("updateSettings");
      const current = await this.ensureSettings();
      const next = { ...current, ...patch || {} };
      await this.dataApi.write(this.collections.settings, this.settingsId, next);
      return next;
    }
    async listMyPlants() {
      this.ensureReady("listMyPlants");
      return this.dataApi.query(this.collections.plants, {
        withMeta: true,
        sortBy: "updatedAt",
        sortDirection: "desc"
      });
    }
    async upsertMyPlant(input2 = {}) {
      this.ensureReady("upsertMyPlant");
      if (!input2.catalogPlantId) {
        throw new Error("catalogPlantId is required to save a plant.");
      }
      const id = input2.id || this.createId("plant");
      const existing = input2.id ? await this.dataApi.read(this.collections.plants, input2.id) : null;
      const payload = {
        catalogPlantId: input2.catalogPlantId,
        nickname: String(input2.nickname || existing?.nickname || "").trim(),
        room: String(input2.room || existing?.room || "").trim(),
        notes: String(input2.notes || existing?.notes || "").trim(),
        wateringCadence: input2.wateringCadence || existing?.wateringCadence || "every-1-week",
        imageId: input2.imageId || existing?.imageId || null,
        lastWateredAt: input2.lastWateredAt || existing?.lastWateredAt || null,
        wateringCount: Number(input2.wateringCount ?? existing?.wateringCount ?? 0)
      };
      await this.dataApi.write(this.collections.plants, id, payload);
      return { id, payload };
    }
    async removeMyPlant(plantRecordId) {
      this.ensureReady("removeMyPlant");
      const existing = await this.dataApi.read(this.collections.plants, plantRecordId);
      if (existing?.imageId) {
        await this.dataApi.delete(this.collections.images, existing.imageId);
      }
      await this.dataApi.delete(this.collections.plants, plantRecordId);
    }
    async markPlantWatered(plantRecordId, wateredAt = (/* @__PURE__ */ new Date()).toISOString()) {
      this.ensureReady("markPlantWatered");
      await this.dataApi.update(this.collections.plants, plantRecordId, (payload = {}) => ({
        ...payload,
        lastWateredAt: wateredAt,
        wateringCount: Number(payload.wateringCount || 0) + 1
      }));
    }
    async writePlantImage(plantRecordId, fileOrDataUrl) {
      this.ensureReady("writePlantImage");
      if (!plantRecordId) {
        throw new Error("plantRecordId is required for image upload.");
      }
      const imageId = this.createId("image");
      await this.dataApi.writeImage(this.collections.images, imageId, fileOrDataUrl, {
        alt: "Plant photo",
        meta: { plantRecordId }
      });
      await this.dataApi.update(this.collections.plants, plantRecordId, (payload = {}) => ({
        ...payload,
        imageId
      }));
      return imageId;
    }
    async readPlantImage(imageId) {
      this.ensureReady("readPlantImage");
      if (!imageId) {
        return null;
      }
      return this.dataApi.readImage(this.collections.images, imageId);
    }
    async listJournalEntries() {
      this.ensureReady("listJournalEntries");
      return this.dataApi.query(this.collections.journal, {
        withMeta: true,
        sortBy: "updatedAt",
        sortDirection: "desc"
      });
    }
    async addJournalEntry(entry = {}) {
      this.ensureReady("addJournalEntry");
      if (!entry.plantId) {
        throw new Error("plantId is required for journal entry.");
      }
      const id = this.createId("journal");
      const payload = {
        plantId: entry.plantId,
        mood: entry.mood || "steady",
        note: String(entry.note || "").trim(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.dataApi.write(this.collections.journal, id, payload);
      return { id, payload };
    }
    async deleteJournalEntry(entryId) {
      this.ensureReady("deleteJournalEntry");
      await this.dataApi.delete(this.collections.journal, entryId);
    }
    async seedStarterData(catalogIds = []) {
      this.ensureReady("seedStarterData");
      const existingPlants = await this.listMyPlants();
      if (existingPlants.length > 0) {
        return;
      }
      const seedIds = catalogIds.slice(0, 2);
      for (const catalogPlantId of seedIds) {
        await this.upsertMyPlant({
          catalogPlantId,
          nickname: "",
          room: "",
          notes: "",
          wateringCadence: "every-1-week"
        });
      }
    }
    async exportSnapshot() {
      this.ensureReady("exportSnapshot");
      return this.dataApi.export();
    }
    validateSnapshot(snapshot) {
      this.ensureReady("validateSnapshot");
      return this.dataApi.validateSnapshot(snapshot, { verifyChecksum: true });
    }
    async importSnapshot(snapshot, { mode = "merge", dryRun = false } = {}) {
      this.ensureReady("importSnapshot");
      return this.dataApi.import(snapshot, {
        mode,
        dryRun,
        onConflict: "newest"
      });
    }
    async clearAllData() {
      this.ensureReady("clearAllData");
      await this.dataApi.clearCollection(this.collections.journal);
      await this.dataApi.clearCollection(this.collections.plants);
      await this.dataApi.clearCollection(this.collections.images);
      await this.dataApi.clearCollection(this.collections.settings);
      await this.ensureSettings();
    }
    getStorageEngineName() {
      return this.dataApi?.store?.engine?.name || "unknown";
    }
    async close() {
      this.ready = false;
      await this.dataApi.close();
    }
  };

  // ../example/plants/app.js
  var VIEW_IDS = ["home", "plants", "journal", "sync", "settings"];
  var EMPTY_SYNC_STATE = {
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
  var dataApi = window.SynactJS?.data;
  var syncApi = window.SynactJS?.sync;
  if (!dataApi) {
    throw new Error("SynactJS.data is unavailable. Ensure ../../framework/synact.js is loaded before example/plants/app.js.");
  }
  var plantContext = new PlantContextService();
  var clockService = new TimeOfDayService();
  var repository = new PlantsRepository({ dataApi, appId: "synact-plants-realworld" });
  var initialFilterOptions = plantContext.getFilterOptions();
  var defaultFilters = {
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
          pushedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          onError: (error2) => {
            refreshSyncState();
            setStatus(`Auto sync failed: ${error2?.message || String(error2)}`);
          }
        });
        refreshSyncState();
        return result;
      } catch (error2) {
        refreshSyncState();
        setStatus(`Auto sync setup failed: ${error2?.message || String(error2)}`);
        return null;
      }
    }, [refreshSyncState, syncFeature]);
    useEffect(() => {
      return clockService.startTicker(setNow, 30 * 1e3);
    }, []);
    useEffect(() => {
      if (!status) {
        return void 0;
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
        repository.close().catch(() => {
        });
      };
    }, [configureAutoSync, refreshSyncState, syncFeature]);
    const enrichedPlants = useMemo(() => {
      return (myPlants || []).map((record) => plantContext.enrichMyPlantRecord(record)).filter(Boolean);
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
      viewContent = plantsMode === "detail" ? h(PlantDetailView, {
        plant: selectedPlant,
        myPlantRecord: selectedMyPlant,
        imagePayload: selectedImagePayload,
        onBack: () => setPlantsMode("list"),
        onSave: handleSavePlant,
        onMarkWatered: handleMarkWatered,
        onRemove: handleRemovePlant,
        onUploadImage: handleUploadImage
      }) : h(PlantListView, {
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
    container.innerHTML = `<pre style="padding:12px;border:1px solid #fecaca;background:#fff1f2;color:#9f1239;white-space:pre-wrap;">Failed to start app
${bootstrapError?.message || String(bootstrapError)}</pre>`;
  });
})();
