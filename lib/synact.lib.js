// Generated from lib/src/index.js. Optional Synact component library.
(() => {
  // lib/src/index.js
  (function() {
    const STYLE_ID = "synact-lib-styles";
    const CSS = `
:root {
  --synact-bg: #f8fafc;
  --synact-bg-soft: #eef2f7;
  --synact-surface: #ffffff;
  --synact-text: #0f172a;
  --synact-text-muted: #64748b;
  --synact-border: #dbe3ef;
  --synact-primary: #2563eb;
  --synact-primary-contrast: #ffffff;
  --synact-success-bg: #dcfce7;
  --synact-success-text: #166534;
  --synact-danger-bg: #fee2e2;
  --synact-danger-text: #991b1b;
  --synact-neutral-bg: #e2e8f0;
  --synact-neutral-text: #334155;
}
html.synact-theme-dark, body.synact-theme-dark {
  --synact-bg: #0b1220;
  --synact-bg-soft: #131c2f;
  --synact-surface: #0f172a;
  --synact-text: #e2e8f0;
  --synact-text-muted: #94a3b8;
  --synact-border: #1f2a44;
  --synact-primary: #60a5fa;
  --synact-primary-contrast: #0b1220;
  --synact-success-bg: #164e2c;
  --synact-success-text: #bbf7d0;
  --synact-danger-bg: #5f1d1d;
  --synact-danger-text: #fecaca;
  --synact-neutral-bg: #1e293b;
  --synact-neutral-text: #cbd5e1;
  color-scheme: dark;
}
.synact-shell {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  color: var(--synact-text);
  background: var(--synact-bg);
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
}
.synact-shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.synact-shell-title { margin: 0; font-size: 28px; line-height: 1.2; }
.synact-shell-subtitle { margin: 6px 0 0; color: var(--synact-text-muted); font-size: 14px; }
.synact-toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.synact-stack { display: flex; flex-direction: column; gap: 10px; }
.synact-btn {
  border: 1px solid var(--synact-border);
  background: var(--synact-surface);
  color: var(--synact-text);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.1s ease, background 0.2s ease;
}
.synact-btn:hover { background: var(--synact-bg-soft); }
.synact-btn:active { transform: translateY(1px); }
.synact-btn-primary {
  background: var(--synact-primary);
  color: var(--synact-primary-contrast);
  border-color: var(--synact-primary);
}
.synact-btn-ghost { background: transparent; }
.synact-btn-danger { background: #dc2626; border-color: #dc2626; color: #fff; }
.synact-input,
.synact-textarea,
.synact-select {
  width: 100%;
  border: 1px solid var(--synact-border);
  border-radius: 10px;
  padding: 9px 10px;
  box-sizing: border-box;
  background: var(--synact-surface);
  color: var(--synact-text);
  font-size: 14px;
}
.synact-textarea { min-height: 96px; resize: vertical; }
.synact-input-row { display: flex; flex-direction: column; gap: 6px; }
.synact-label { font-size: 13px; color: var(--synact-text-muted); }
.synact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.synact-card {
  background: var(--synact-surface);
  border: 1px solid var(--synact-border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}
.synact-card-title { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--synact-text); }
.synact-stat-value { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.1; }
.synact-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.synact-muted { color: var(--synact-text-muted); font-size: 13px; }
.synact-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.synact-badge-positive { background: var(--synact-success-bg); color: var(--synact-success-text); }
.synact-badge-negative { background: var(--synact-danger-bg); color: var(--synact-danger-text); }
.synact-badge-neutral { background: var(--synact-neutral-bg); color: var(--synact-neutral-text); }
.synact-table-wrap { width: 100%; overflow: auto; }
.synact-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.synact-table th {
  text-align: left;
  color: var(--synact-text-muted);
  border-bottom: 1px solid var(--synact-border);
  padding: 8px;
  white-space: nowrap;
}
.synact-table td {
  border-bottom: 1px solid var(--synact-bg-soft);
  padding: 8px;
  white-space: nowrap;
}
.synact-empty {
  padding: 24px;
  text-align: center;
  color: var(--synact-text-muted);
  border: 1px dashed var(--synact-border);
  border-radius: 12px;
  background: var(--synact-surface);
}
.synact-bars { display: flex; align-items: flex-end; gap: 6px; height: 72px; margin-top: 10px; }
.synact-bar {
  flex: 1;
  min-width: 8px;
  border-radius: 8px 8px 4px 4px;
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
}
.synact-divider { border: 0; border-top: 1px solid var(--synact-border); margin: 10px 0; }
.synact-kbd {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--synact-border);
  background: var(--synact-bg-soft);
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 12px;
  color: var(--synact-text-muted);
}
.synact-alert {
  border: 1px solid var(--synact-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--synact-bg-soft);
}
.synact-alert-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.synact-alert-info { border-color: #bfdbfe; background: #eff6ff; color: #1e3a8a; }
.synact-alert-success { border-color: #86efac; background: #f0fdf4; color: #166534; }
.synact-alert-warning { border-color: #fcd34d; background: #fffbeb; color: #92400e; }
.synact-alert-danger { border-color: #fca5a5; background: #fef2f2; color: #991b1b; }
.synact-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--synact-bg-soft);
  overflow: hidden;
}
.synact-progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.2s ease;
}
.synact-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border: 1px solid var(--synact-border);
  border-radius: 999px;
  background: var(--synact-bg-soft);
  cursor: pointer;
}
.synact-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.synact-switch-on { background: #2563eb; border-color: #2563eb; }
.synact-switch-on .synact-switch-thumb { transform: translateX(20px); }
.synact-tabs { display: flex; flex-direction: column; gap: 10px; }
.synact-tabs-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--synact-border);
  border-radius: 10px;
  background: var(--synact-bg-soft);
}
.synact-tab {
  border: 0;
  border-radius: 8px;
  padding: 7px 10px;
  background: transparent;
  color: var(--synact-text-muted);
  cursor: pointer;
}
.synact-tab-active {
  background: var(--synact-surface);
  color: var(--synact-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.synact-accordion { border: 1px solid var(--synact-border); border-radius: 12px; overflow: hidden; }
.synact-accordion-item + .synact-accordion-item { border-top: 1px solid var(--synact-border); }
.synact-accordion-trigger {
  width: 100%;
  border: 0;
  background: var(--synact-surface);
  color: var(--synact-text);
  text-align: left;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
}
.synact-accordion-panel { padding: 0 12px 12px; color: var(--synact-text-muted); }
.synact-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 6, 23, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.synact-modal {
  width: min(560px, 100%);
  background: var(--synact-surface);
  border: 1px solid var(--synact-border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 16px 40px rgba(2, 6, 23, 0.35);
}
.synact-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.synact-close {
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--synact-bg-soft);
  color: var(--synact-text-muted);
  cursor: pointer;
}
.synact-dropzone {
  border: 2px dashed var(--synact-border);
  background: var(--synact-surface);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: var(--synact-text-muted);
  cursor: pointer;
}
.synact-dropzone-active {
  border-color: var(--synact-primary);
  background: #eff6ff;
}
.synact-file-list { margin: 8px 0 0; padding-left: 18px; text-align: left; }
.synact-kv { width: 100%; display: grid; grid-template-columns: minmax(120px, 1fr) minmax(120px, 2fr); gap: 8px 12px; }
.synact-kv-key { color: var(--synact-text-muted); font-size: 13px; }
.synact-kv-value { color: var(--synact-text); font-size: 14px; word-break: break-word; }
`;
    function ensureRuntime(required = ["h", "div"]) {
      if (typeof window === "undefined") {
        throw new Error("[SynactJS:S011] SynactLib requires a browser environment.");
      }
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
    function asArray(value) {
      return Array.isArray(value) ? value : value == null ? [] : [value];
    }
    function cx(...parts) {
      return parts.filter(Boolean).join(" ");
    }
    function safeString(value, fallback = "") {
      if (value == null) return fallback;
      return String(value);
    }
    function Badge({ tone = "neutral", children }) {
      ensureStyles();
      const { span } = ensureRuntime(["span"]);
      const className = `synact-badge synact-badge-${tone}`;
      return span({ className }, ...normalizeChildren(children));
    }
    function Button({ children, variant = "default", className = "", ...props }) {
      ensureStyles();
      const { button } = ensureRuntime(["button"]);
      const variantClass = variant === "primary" ? "synact-btn-primary" : variant === "ghost" ? "synact-btn-ghost" : variant === "danger" ? "synact-btn-danger" : "";
      return button({ className: cx("synact-btn", variantClass, className), ...props }, ...normalizeChildren(children));
    }
    function Input({ label: labelText, className = "", ...props }) {
      ensureStyles();
      const { div, label, input } = ensureRuntime(["div", "label", "input"]);
      const element = input({ className: cx("synact-input", className), ...props });
      if (!labelText) return element;
      return div(
        { className: "synact-input-row" },
        label({ className: "synact-label" }, labelText),
        element
      );
    }
    function Textarea({ label: labelText, className = "", ...props }) {
      ensureStyles();
      const { div, label, textarea } = ensureRuntime(["div", "label", "textarea"]);
      const element = textarea({ className: cx("synact-textarea", className), ...props });
      if (!labelText) return element;
      return div(
        { className: "synact-input-row" },
        label({ className: "synact-label" }, labelText),
        element
      );
    }
    function SelectField({ label: labelText, options = [], className = "", ...props }) {
      ensureStyles();
      const { div, label, select, option } = ensureRuntime(["div", "label", "select", "option"]);
      const element = select(
        { className: cx("synact-select", className), ...props },
        ...options.map((item) => {
          if (typeof item === "object") {
            return option({ value: item.value }, safeString(item.label, safeString(item.value)));
          }
          return option({ value: item }, safeString(item));
        })
      );
      if (!labelText) return element;
      return div(
        { className: "synact-input-row" },
        label({ className: "synact-label" }, labelText),
        element
      );
    }
    function Switch({ checked = false, onChange, label: labelText, disabled = false }) {
      ensureStyles();
      const { button, div, span } = ensureRuntime(["button", "div", "span"]);
      const control = button({
        type: "button",
        disabled,
        role: "switch",
        "aria-checked": checked ? "true" : "false",
        className: cx("synact-switch", checked ? "synact-switch-on" : ""),
        onClick: () => {
          if (disabled) return;
          if (typeof onChange === "function") {
            onChange(!checked);
          }
        }
      }, div({ className: "synact-switch-thumb" }));
      if (!labelText) return control;
      return div(
        { className: "synact-row" },
        span({ className: "synact-muted" }, safeString(labelText)),
        control
      );
    }
    function Progress({ value = 0, max = 100, label }) {
      ensureStyles();
      const { div, span } = ensureRuntime(["div", "span"]);
      const safeMax = Math.max(1, Number(max) || 100);
      const safeValue = Math.max(0, Math.min(safeMax, Number(value) || 0));
      const pct = Math.round(safeValue / safeMax * 100);
      return div(
        { className: "synact-stack" },
        label ? div(
          { className: "synact-row" },
          span({ className: "synact-muted" }, safeString(label)),
          span({ className: "synact-muted" }, `${pct}%`)
        ) : null,
        div(
          { className: "synact-progress-track" },
          div({ className: "synact-progress-bar", style: `width:${pct}%;` })
        )
      );
    }
    function Alert({ tone = "info", title, children }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      return div(
        { className: cx("synact-alert", `synact-alert-${tone}`) },
        title ? div({ className: "synact-alert-title" }, safeString(title)) : null,
        ...normalizeChildren(children)
      );
    }
    function Divider({ className = "" }) {
      ensureStyles();
      const { hr } = ensureRuntime(["hr"]);
      return hr({ className: cx("synact-divider", className) });
    }
    function Kbd({ children }) {
      ensureStyles();
      const { span } = ensureRuntime(["span"]);
      return span({ className: "synact-kbd" }, ...normalizeChildren(children));
    }
    function Card({ title, children, footer }) {
      ensureStyles();
      const { div, h2 } = ensureRuntime(["div", "h2"]);
      return div(
        { className: "synact-card" },
        title ? h2({ className: "synact-card-title" }, safeString(title)) : null,
        ...normalizeChildren(children),
        footer ? div({ className: "synact-muted", style: "margin-top:10px;" }, ...normalizeChildren(footer)) : null
      );
    }
    function StatCard({ label, value, delta, tone = "neutral", footer }) {
      ensureStyles();
      const { div, p } = ensureRuntime(["div", "p"]);
      return Card({
        title: label,
        children: [
          p({ className: "synact-stat-value" }, safeString(value, "-")),
          delta == null ? null : div(
            { className: "synact-row", style: "margin-top:8px;" },
            Badge({ tone, children: safeString(delta) }),
            footer ? p({ className: "synact-muted" }, safeString(footer)) : null
          )
        ]
      });
    }
    function SparkBars({ values = [] }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      const safeValues = values.length > 0 ? values : [0];
      const max = Math.max(...safeValues.map((v) => Number(v) || 0), 1);
      return div(
        { className: "synact-bars" },
        ...safeValues.map((value) => {
          const height = Math.max(8, Math.round((Number(value) || 0) / max * 72));
          return div({ className: "synact-bar", style: `height:${height}px;` });
        })
      );
    }
    function DataTable({ columns = [], rows = [], emptyText = "No data yet." }) {
      ensureStyles();
      const { div, table, thead, tbody, tr, th, td } = ensureRuntime(["div", "table", "thead", "tbody", "tr", "th", "td"]);
      if (!Array.isArray(rows) || rows.length === 0) {
        return div({ className: "synact-empty" }, emptyText);
      }
      const safeColumns = columns.length > 0 ? columns : Object.keys(rows[0] || {}).map((key) => ({ key, label: key }));
      return div(
        { className: "synact-table-wrap" },
        table(
          { className: "synact-table" },
          thead({}, tr({}, ...safeColumns.map((col) => th({}, safeString(col.label || col.key))))),
          tbody(
            {},
            ...rows.map((row) => tr(
              {},
              ...safeColumns.map((col) => {
                const value = typeof col.render === "function" ? col.render(row[col.key], row) : row[col.key];
                return td({}, value == null ? "" : safeString(value));
              })
            ))
          )
        )
      );
    }
    function KeyValueList({ entries = [] }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      return div(
        { className: "synact-kv" },
        ...entries.flatMap((item) => [
          div({ className: "synact-kv-key" }, safeString(item.key)),
          div({ className: "synact-kv-value" }, safeString(item.value))
        ])
      );
    }
    function Grid({ children, min = 220 }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      return div({ className: "synact-grid", style: `grid-template-columns:repeat(auto-fit,minmax(${min}px,1fr));` }, ...normalizeChildren(children));
    }
    function Stack({ children, gap = 10, className = "" }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      return div({ className: cx("synact-stack", className), style: `gap:${Number(gap) || 10}px;` }, ...normalizeChildren(children));
    }
    function Toolbar({ children, className = "" }) {
      ensureStyles();
      const { div } = ensureRuntime(["div"]);
      return div({ className: cx("synact-toolbar", className) }, ...normalizeChildren(children));
    }
    function EmptyState({ title = "No data", description = "There is nothing to show yet.", action }) {
      ensureStyles();
      const { div, p, strong } = ensureRuntime(["div", "p", "strong"]);
      return div(
        { className: "synact-empty" },
        p({}, strong({}, safeString(title))),
        p({ className: "synact-muted", style: "margin-top:4px;" }, safeString(description)),
        action ? div({ style: "margin-top:10px;" }, action) : null
      );
    }
    function AppShell({ title, subtitle, actions, children }) {
      ensureStyles();
      const { div, h1, p } = ensureRuntime(["div", "h1", "p"]);
      return div(
        { className: "synact-shell" },
        div(
          { className: "synact-shell-header" },
          div(
            {},
            h1({ className: "synact-shell-title" }, safeString(title, "Dashboard")),
            subtitle ? p({ className: "synact-shell-subtitle" }, safeString(subtitle)) : null
          ),
          actions ? Toolbar({ children: actions }) : null
        ),
        ...normalizeChildren(children)
      );
    }
    function Tabs(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(TabsRoot, props);
    }
    function TabsRoot({ items = [], defaultValue = null, onChange, className = "" }) {
      var _a;
      ensureStyles();
      const { useState, div, button } = ensureRuntime(["useState", "div", "button"]);
      const safeItems = asArray(items).filter(Boolean);
      const initial = defaultValue != null ? defaultValue : (_a = safeItems[0]) == null ? void 0 : _a.id;
      const [active, setActive] = useState(initial);
      const activeItem = safeItems.find((item) => item.id === active) || safeItems[0] || null;
      return div(
        { className: cx("synact-tabs", className) },
        div(
          { className: "synact-tabs-list", role: "tablist" },
          ...safeItems.map((item) => button({
            type: "button",
            role: "tab",
            "aria-selected": item.id === active ? "true" : "false",
            className: cx("synact-tab", item.id === active ? "synact-tab-active" : ""),
            onClick: () => {
              setActive(item.id);
              if (typeof onChange === "function") {
                onChange(item.id, item);
              }
            }
          }, safeString(item.label || item.id)))
        ),
        div(
          { className: "synact-card" },
          activeItem ? typeof activeItem.content === "function" ? activeItem.content(activeItem) : activeItem.content : ""
        )
      );
    }
    function Accordion(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(AccordionRoot, props);
    }
    function AccordionRoot({ items = [], multiple = false, defaultOpen = [] }) {
      ensureStyles();
      const { useState, div, button } = ensureRuntime(["useState", "div", "button"]);
      const safeItems = asArray(items).filter(Boolean);
      const initialOpen = asArray(defaultOpen);
      const [openIds, setOpenIds] = useState(initialOpen);
      function toggleItem(id) {
        setOpenIds((prev) => {
          if (multiple) {
            return prev.includes(id) ? prev.filter((value) => value !== id) : prev.concat(id);
          }
          return prev.includes(id) ? [] : [id];
        });
      }
      return div(
        { className: "synact-accordion" },
        ...safeItems.map((item) => {
          const open = openIds.includes(item.id);
          return div(
            { className: "synact-accordion-item" },
            button({
              type: "button",
              className: "synact-accordion-trigger",
              "aria-expanded": open ? "true" : "false",
              onClick: () => toggleItem(item.id)
            }, `${safeString(item.title || item.id)} ${open ? "-" : "+"}`),
            open ? div(
              { className: "synact-accordion-panel" },
              typeof item.content === "function" ? item.content(item) : item.content
            ) : null
          );
        })
      );
    }
    function Modal({ open = false, title = "", children, actions, onClose }) {
      ensureStyles();
      const { div, h2, button } = ensureRuntime(["div", "h2", "button"]);
      if (!open) {
        return null;
      }
      return div(
        {
          className: "synact-modal-overlay",
          onClick: (event) => {
            if (event.target === event.currentTarget && typeof onClose === "function") {
              onClose();
            }
          }
        },
        div(
          { className: "synact-modal", role: "dialog", "aria-modal": "true" },
          div(
            { className: "synact-modal-head" },
            h2({ className: "synact-card-title", style: "margin:0;" }, safeString(title)),
            button({ type: "button", className: "synact-close", onClick: onClose }, "x")
          ),
          div({}, ...normalizeChildren(children)),
          actions ? div({ style: "margin-top:12px;" }, ...normalizeChildren(actions)) : null
        )
      );
    }
    function ClipboardButton(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(ClipboardButtonRoot, props);
    }
    function ClipboardButtonRoot({
      text = "",
      label = "Copy",
      copiedLabel = "Copied",
      errorLabel = "Copy failed",
      timeout = 1200,
      onCopy,
      onError,
      variant = "default",
      className = ""
    }) {
      ensureStyles();
      const { useState } = ensureRuntime(["useState"]);
      const [status, setStatus] = useState("idle");
      function fallbackCopy(value) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
          return true;
        } catch (_) {
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
      async function copyNow() {
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(safeString(text));
          } else {
            const copied = fallbackCopy(safeString(text));
            if (!copied) {
              throw new Error("Clipboard API unavailable");
            }
          }
          setStatus("copied");
          if (typeof onCopy === "function") {
            onCopy(text);
          }
          setTimeout(() => setStatus("idle"), Number(timeout) || 1200);
        } catch (error) {
          setStatus("error");
          if (typeof onError === "function") {
            onError(error);
          }
          setTimeout(() => setStatus("idle"), Number(timeout) || 1200);
        }
      }
      const buttonLabel = status === "copied" ? copiedLabel : status === "error" ? errorLabel : label;
      return Button({ variant, className, onClick: copyNow, children: buttonLabel });
    }
    function ShareButton(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(ShareButtonRoot, props);
    }
    function ShareButtonRoot({
      data,
      label = "Share",
      fallbackCopyText,
      copiedLabel = "Link copied",
      onShare,
      onError,
      variant = "default"
    }) {
      ensureStyles();
      const { useState } = ensureRuntime(["useState"]);
      const [stateLabel, setStateLabel] = useState(label);
      async function handleShare() {
        try {
          if (navigator.share && data) {
            await navigator.share(data);
            if (typeof onShare === "function") onShare(data);
            return;
          }
          const fallback = fallbackCopyText || (data == null ? void 0 : data.url) || (data == null ? void 0 : data.text) || "";
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(safeString(fallback));
            setStateLabel(copiedLabel);
            setTimeout(() => setStateLabel(label), 1200);
            if (typeof onShare === "function") onShare({ copied: fallback });
            return;
          }
          throw new Error("Share unavailable");
        } catch (error) {
          if (typeof onError === "function") {
            onError(error);
          }
        }
      }
      return Button({ variant, onClick: handleShare, children: stateLabel });
    }
    function NetworkStatusBadge({ onlineLabel = "Online", offlineLabel = "Offline" }) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(NetworkStatusBadgeRoot, { onlineLabel, offlineLabel });
    }
    function NetworkStatusBadgeRoot({ onlineLabel, offlineLabel }) {
      ensureStyles();
      const { useOnlineStatus } = ensureRuntime(["useOnlineStatus"]);
      const online = useOnlineStatus();
      return Badge({ tone: online ? "positive" : "negative", children: online ? onlineLabel : offlineLabel });
    }
    function ThemeToggle(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(ThemeToggleRoot, props);
    }
    function ThemeToggleRoot({
      keyName = "synact-theme",
      lightLabel = "Light",
      darkLabel = "Dark",
      buttonLabelPrefix = "Theme",
      onChange
    }) {
      ensureStyles();
      const { useState, useEffect } = ensureRuntime(["useState", "useEffect"]);
      function resolveInitialTheme() {
        const stored = localStorage.getItem(keyName);
        if (stored === "light" || stored === "dark") return stored;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return "dark";
        }
        return "light";
      }
      function applyTheme(theme2) {
        const root = document.documentElement;
        const body = document.body;
        root.classList.toggle("synact-theme-dark", theme2 === "dark");
        body.classList.toggle("synact-theme-dark", theme2 === "dark");
        root.setAttribute("data-theme", theme2);
        localStorage.setItem(keyName, theme2);
      }
      const [theme, setTheme] = useState(resolveInitialTheme);
      useEffect(() => {
        applyTheme(theme);
        if (typeof onChange === "function") {
          onChange(theme);
        }
      }, [theme]);
      return Button({
        variant: "ghost",
        onClick: () => setTheme((prev) => prev === "dark" ? "light" : "dark"),
        children: `${buttonLabelPrefix}: ${theme === "dark" ? darkLabel : lightLabel}`
      });
    }
    function FileDropzone(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(FileDropzoneRoot, props);
    }
    function FileDropzoneRoot({
      label = "Drop files here or click to browse",
      hint = "Upload files from your browser",
      accept,
      multiple = true,
      onFiles,
      showList = true
    }) {
      ensureStyles();
      const { useState, label: labelEl, input, div, p, ul, li } = ensureRuntime(["useState", "label", "input", "div", "p", "ul", "li"]);
      const [dragOver, setDragOver] = useState(false);
      const [names, setNames] = useState([]);
      function consumeFiles(fileList) {
        const files = Array.from(fileList || []);
        setNames(files.map((file) => file.name));
        if (typeof onFiles === "function") {
          onFiles(files);
        }
      }
      return labelEl(
        {
          className: cx("synact-dropzone", dragOver ? "synact-dropzone-active" : ""),
          onDragOver: (event) => {
            event.preventDefault();
            setDragOver(true);
          },
          onDragEnter: (event) => {
            event.preventDefault();
            setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (event) => {
            var _a;
            event.preventDefault();
            setDragOver(false);
            consumeFiles((_a = event.dataTransfer) == null ? void 0 : _a.files);
          }
        },
        input({
          type: "file",
          accept,
          multiple,
          style: "display:none;",
          onChange: (event) => consumeFiles(event.target.files)
        }),
        div(
          { className: "synact-stack", style: "align-items:center;" },
          p({ style: "margin:0;font-weight:600;color:var(--synact-text);" }, safeString(label)),
          p({ className: "synact-muted", style: "margin:0;" }, safeString(hint))
        ),
        showList && names.length > 0 ? ul({ className: "synact-file-list" }, ...names.map((name) => li({}, safeString(name)))) : null
      );
    }
    function GeolocationCard(props = {}) {
      ensureStyles();
      const { h } = ensureRuntime(["h"]);
      return h(GeolocationCardRoot, props);
    }
    function GeolocationCardRoot({ title = "Location", onLocate, locateLabel = "Get Location" }) {
      ensureStyles();
      const { useState, p, div } = ensureRuntime(["useState", "p", "div"]);
      const [loading, setLoading] = useState(false);
      const [coords, setCoords] = useState(null);
      const [error, setError] = useState("");
      function requestLocation() {
        if (!navigator.geolocation) {
          setError("Geolocation is not available in this browser.");
          return;
        }
        setLoading(true);
        setError("");
        navigator.geolocation.getCurrentPosition((position) => {
          const nextCoords = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy)
          };
          setCoords(nextCoords);
          setLoading(false);
          if (typeof onLocate === "function") {
            onLocate(nextCoords, position);
          }
        }, (err) => {
          setLoading(false);
          setError((err == null ? void 0 : err.message) || "Location request failed.");
        }, {
          enableHighAccuracy: false,
          timeout: 1e4
        });
      }
      return Card({
        title,
        children: [
          Button({ variant: "primary", onClick: requestLocation, children: loading ? "Locating..." : locateLabel }),
          coords ? KeyValueList({
            entries: [
              { key: "Latitude", value: coords.latitude },
              { key: "Longitude", value: coords.longitude },
              { key: "Accuracy", value: `${coords.accuracy} m` }
            ]
          }) : p({ className: "synact-muted" }, "No location fetched yet."),
          error ? Alert({ tone: "danger", title: "Location Error", children: error }) : null
        ]
      });
    }
    const SynactLib = {
      AppShell,
      Grid,
      Stack,
      Card,
      StatCard,
      DataTable,
      KeyValueList,
      EmptyState,
      Badge,
      Button,
      Input,
      Textarea,
      SelectField,
      Switch,
      Progress,
      Alert,
      Divider,
      Kbd,
      SparkBars,
      Toolbar,
      Tabs,
      Accordion,
      Modal,
      ClipboardButton,
      ShareButton,
      NetworkStatusBadge,
      ThemeToggle,
      FileDropzone,
      GeolocationCard
    };
    window.SynactLib = SynactLib;
    if (window.SynactJS) {
      window.SynactJS.lib = SynactLib;
    }
  })();
})();
