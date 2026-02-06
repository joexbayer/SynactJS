(function () {
    const STYLE_ID = "synact-lib-styles";

    const CSS = `
.synact-shell { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #f8fafc; min-height: 100vh; padding: 24px; box-sizing: border-box; }
.synact-shell-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:20px; }
.synact-shell-title { margin:0; font-size:28px; line-height:1.2; }
.synact-shell-subtitle { margin:6px 0 0; color:#475569; font-size:14px; }
.synact-toolbar { display:flex; gap:10px; flex-wrap:wrap; }
.synact-btn { border:1px solid #cbd5e1; background:#fff; color:#0f172a; border-radius:10px; padding:8px 12px; cursor:pointer; font-size:14px; }
.synact-btn:hover { background:#f1f5f9; }
.synact-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.synact-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:14px; box-shadow:0 1px 2px rgba(15,23,42,0.05); }
.synact-card-title { margin:0 0 8px; font-size:14px; font-weight:600; color:#334155; }
.synact-stat-value { margin:0; font-size:28px; font-weight:700; line-height:1.1; }
.synact-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.synact-muted { color:#64748b; font-size:13px; }
.synact-badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:12px; font-weight:600; }
.synact-badge-positive { background:#dcfce7; color:#166534; }
.synact-badge-negative { background:#fee2e2; color:#991b1b; }
.synact-badge-neutral { background:#e2e8f0; color:#334155; }
.synact-table-wrap { width:100%; overflow:auto; }
.synact-table { width:100%; border-collapse:collapse; font-size:14px; }
.synact-table th { text-align:left; color:#475569; border-bottom:1px solid #e2e8f0; padding:8px; white-space:nowrap; }
.synact-table td { border-bottom:1px solid #f1f5f9; padding:8px; white-space:nowrap; }
.synact-empty { padding:24px; text-align:center; color:#64748b; border:1px dashed #cbd5e1; border-radius:12px; background:#fff; }
.synact-bars { display:flex; align-items:flex-end; gap:6px; height:72px; margin-top:10px; }
.synact-bar { flex:1; min-width:8px; border-radius:8px 8px 4px 4px; background:linear-gradient(180deg,#3b82f6,#1d4ed8); }
`;

    function ensureRuntime() {
        if (typeof window === "undefined") {
            throw new Error("[SynactJS:S011] SynactLib requires a browser environment.");
        }

        const required = ["h", "div", "h1", "h2", "p", "span", "button", "table", "thead", "tbody", "tr", "th", "td"];
        const missing = required.filter((name) => typeof window[name] !== "function");

        if (missing.length > 0) {
            throw new Error(`[SynactJS:S011] Missing SynactJS runtime globals: ${missing.join(", ")}. Load synact.js before synact.lib.js.`);
        }

        return window;
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function normalizeChildren(children) {
        if (Array.isArray(children)) return children;
        return children == null ? [] : [children];
    }

    function Badge({ tone = "neutral", children }) {
        ensureStyles();
        const { span } = ensureRuntime();
        const className = `synact-badge synact-badge-${tone}`;
        return span({ className }, ...normalizeChildren(children));
    }

    function Button({ children, className = "", ...props }) {
        ensureStyles();
        const { button } = ensureRuntime();
        return button({ className: `synact-btn ${className}`.trim(), ...props }, ...normalizeChildren(children));
    }

    function Card({ title, children, footer }) {
        ensureStyles();
        const { div, h2 } = ensureRuntime();
        return div({ className: "synact-card" },
            title ? h2({ className: "synact-card-title" }, title) : null,
            ...normalizeChildren(children),
            footer ? div({ className: "synact-muted", style: "margin-top:10px;" }, ...normalizeChildren(footer)) : null
        );
    }

    function StatCard({ label, value, delta, tone = "neutral", footer }) {
        ensureStyles();
        const { div, p } = ensureRuntime();
        return Card({
            title: label,
            children: [
                p({ className: "synact-stat-value" }, String(value ?? "-")),
                delta == null ? null : div({ className: "synact-row", style: "margin-top:8px;" },
                    Badge({ tone, children: String(delta) }),
                    footer ? p({ className: "synact-muted" }, footer) : null
                )
            ]
        });
    }

    function SparkBars({ values = [] }) {
        ensureStyles();
        const { div } = ensureRuntime();
        const safeValues = values.length > 0 ? values : [0];
        const max = Math.max(...safeValues.map((v) => Number(v) || 0), 1);

        return div({ className: "synact-bars" },
            ...safeValues.map((value) => {
                const height = Math.max(8, Math.round(((Number(value) || 0) / max) * 72));
                return div({ className: "synact-bar", style: `height:${height}px;` });
            })
        );
    }

    function DataTable({ columns = [], rows = [], emptyText = "No data yet." }) {
        ensureStyles();
        const { div, table, thead, tbody, tr, th, td } = ensureRuntime();

        if (!Array.isArray(rows) || rows.length === 0) {
            return div({ className: "synact-empty" }, emptyText);
        }

        const safeColumns = columns.length > 0
            ? columns
            : Object.keys(rows[0] || {}).map((key) => ({ key, label: key }));

        return div({ className: "synact-table-wrap" },
            table({ className: "synact-table" },
                thead({}, tr({}, ...safeColumns.map((col) => th({}, col.label || col.key)))),
                tbody({},
                    ...rows.map((row) => tr({},
                        ...safeColumns.map((col) => {
                            const value = typeof col.render === "function" ? col.render(row[col.key], row) : row[col.key];
                            return td({}, value == null ? "" : String(value));
                        })
                    ))
                )
            )
        );
    }

    function Grid({ children, min = 220 }) {
        ensureStyles();
        const { div } = ensureRuntime();
        return div({ className: "synact-grid", style: `grid-template-columns:repeat(auto-fit,minmax(${min}px,1fr));` }, ...normalizeChildren(children));
    }

    function Toolbar({ children }) {
        ensureStyles();
        const { div } = ensureRuntime();
        return div({ className: "synact-toolbar" }, ...normalizeChildren(children));
    }

    function AppShell({ title, subtitle, actions, children }) {
        ensureStyles();
        const { div, h1, p } = ensureRuntime();

        return div({ className: "synact-shell" },
            div({ className: "synact-shell-header" },
                div({},
                    h1({ className: "synact-shell-title" }, title || "Dashboard"),
                    subtitle ? p({ className: "synact-shell-subtitle" }, subtitle) : null
                ),
                actions ? Toolbar({ children: actions }) : null
            ),
            ...normalizeChildren(children)
        );
    }

    const SynactLib = {
        AppShell,
        Grid,
        Card,
        StatCard,
        DataTable,
        Badge,
        Button,
        SparkBars,
        Toolbar
    };

    window.SynactLib = SynactLib;
    if (window.SynactJS) {
        window.SynactJS.lib = SynactLib;
    }
})();
