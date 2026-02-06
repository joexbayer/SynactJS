import { runtime } from "./state.js";
import { h } from "./vnode.js";
import { renderApp } from "./renderer.js";

export function resolveContainer(target) {
    if (typeof target === "string") {
        const normalized = target.startsWith("#") ? target.slice(1) : target;
        const byId = document.getElementById(normalized);
        if (byId) return byId;

        const bySelector = document.querySelector(target);
        if (bySelector) return bySelector;

        throw new Error(`[SynactJS] Unable to find container for selector \"${target}\".`);
    }

    if (target && typeof target === "object" && target.nodeType === 1) {
        return target;
    }

    throw new Error("[SynactJS] Expected a DOM element or selector string for container.");
}

export function mountComponents(root = document) {
    root.querySelectorAll("[data-component]").forEach((el) => {
        const name = el.getAttribute("data-component")?.trim();
        if (!name) return;

        const globalWindow = typeof window !== "undefined" ? window : undefined;
        const component = runtime.componentRegistry.get(name) || globalWindow?.[name];
        if (typeof component !== "function") return;

        const rawProps = el.getAttribute("data-prop") || "";
        const signature = `${name}|${rawProps}`;

        if (runtime.mountedSignatures.get(el) === signature) {
            return;
        }

        let props = {};
        if (rawProps) {
            try {
                props = JSON.parse(rawProps);
            } catch (error) {
                console.warn(`[SynactJS] Invalid JSON in data-prop for component ${name}:`, error);
            }
        }

        renderApp(() => h(component, props), el);
        runtime.mountedSignatures.set(el, signature);
    });
}
