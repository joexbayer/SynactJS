import {
    useState,
    useEffect,
    useMemo,
    div,
    h2,
    h3,
    p,
    span,
    button,
    label,
    input,
    textarea,
    ul,
    li,
    i
} from "./runtime.js";

export function cx(...tokens) {
    return tokens.filter(Boolean).join(" ");
}

export function Icon({ name, className = "" } = {}) {
    return i({
        className: cx("ph leading-none", `ph-${name || "leaf"}`, className),
        "aria-hidden": "true"
    });
}

const BUTTON_STYLES = {
    primary: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-105",
    secondary: "bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200/80",
    danger: "bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:brightness-105",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
};

export function AppButton({
    label: buttonLabel,
    children,
    onClick,
    type = "button",
    variant = "secondary",
    disabled = false,
    className = "",
    icon
} = {}) {
    const content = children
        || div(
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

export function SectionCard({ title, subtitle, actions, children, className = "", icon } = {}) {
    const isSurfaceCard = className.includes("surface-card");
    const normalizedClassName = className.replace("surface-card", "").trim();

    return div(
        {
            className: cx(
                isSurfaceCard
                    ? "overflow-hidden rounded-[1.3rem] bg-white/80 shadow-[0_16px_24px_-20px_rgba(15,23,42,0.5)]"
                    : "py-3",
                normalizedClassName
            )
        },
        title || subtitle || actions
            ? div(
                { className: cx("flex items-start justify-between gap-3", isSurfaceCard ? "p-4 pb-2" : "") },
                div(
                    { className: "min-w-0" },
                    title
                        ? div(
                            { className: "flex items-center gap-2" },
                            icon
                                ? div(
                                    {
                                        className: "grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700"
                                    },
                                    Icon({ name: icon, className: "text-[15px]" })
                                )
                                : null,
                            h2({ className: "text-base font-bold text-slate-900" }, title)
                        )
                        : null,
                    subtitle ? p({ className: "mt-1 text-sm text-slate-600" }, subtitle) : null
                ),
                actions ? div({ className: "shrink-0" }, actions) : null
            )
            : null,
        !isSurfaceCard && (title || subtitle || actions)
            ? div({ className: "mt-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" })
            : null,
        div(
            { className: cx(isSurfaceCard ? "p-4 pt-3" : "mt-3") },
            children
        )
    );
}

export function StatTile({ label: tileLabel, value, hint, tone = "neutral", icon } = {}) {
    const toneClass = tone === "positive"
        ? "text-emerald-700"
        : tone === "warning"
            ? "text-amber-700"
            : "text-slate-700";

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

export function InputField({
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
        fieldLabel
            ? label(
                { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
                icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
                fieldLabel
            )
            : null,
        input(inputProps),
        helper ? p({ className: "text-xs text-slate-500" }, helper) : null
    );
}

export function TextAreaField({
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
        fieldLabel
            ? label(
                { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
                icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
                fieldLabel
            )
            : null,
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

export function SelectField({
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
        if (!open) return undefined;

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
        fieldLabel
            ? label(
                { className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
                icon ? Icon({ name: icon, className: "text-slate-500" }) : null,
                fieldLabel
            )
            : null,
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
            open
                ? ul(
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
                )
                : null
        ),
        helper ? p({ className: "text-xs text-slate-500" }, helper) : null
    );
}

export function ToggleField({ label: fieldLabel, checked, onInput, helper } = {}) {
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

export function Badge({ label: badgeLabel, tone = "neutral" } = {}) {
    const toneClass = tone === "safe"
        ? "bg-emerald-100 text-emerald-700"
        : tone === "danger"
            ? "bg-rose-100 text-rose-700"
            : tone === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700";

    return span(
        {
            className: cx("inline-flex rounded-full px-2 py-1 text-xs font-semibold", toneClass)
        },
        badgeLabel || "Label"
    );
}

export function SectionDivider({ label: dividerLabel = "" } = {}) {
    return div(
        {
            className: "relative my-1 py-2"
        },
        div({ className: "h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" }),
        dividerLabel
            ? div(
                { className: "pointer-events-none absolute inset-0 grid place-items-center" },
                span(
                    { className: "rounded-full bg-[#fffdf8] px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" },
                    dividerLabel
                )
            )
            : null
    );
}

export function AccordionSection({
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
                    icon
                        ? Icon({
                            name: icon,
                            className: "text-base text-emerald-700"
                        })
                        : null,
                    h3({ className: "text-sm font-bold text-slate-900" }, title || "Section")
                ),
                subtitle ? p({ className: "mt-1 text-xs text-slate-500" }, subtitle) : null
            ),
            Icon({ name: open ? "caret-up" : "caret-down", className: "text-slate-500" })
        ),
        open
            ? div(
                {
                    className: "border-t border-emerald-100/80 px-4 py-3"
                },
                children
            )
            : null
    );
}

export function EmptyState({ title, text, action } = {}) {
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
