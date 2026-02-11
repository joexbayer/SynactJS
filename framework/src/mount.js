import { runtime } from "./state.js";
import { h } from "./vnode.js";
import { renderApp } from "./renderer.js";
import { fail, report } from "./errors.js";

export function resolveContainer(target) {
    if (typeof target === "string") {
        const normalized = target.startsWith("#") ? target.slice(1) : target;
        const byId = document.getElementById(normalized);
        if (byId) return byId;

        const bySelector = document.querySelector(target);
        if (bySelector) return bySelector;

        fail("S001", `Unable to find container for selector \"${target}\".`, { selector: target, context: "mount" });
    }

    if (target && typeof target === "object" && target.nodeType === 1) {
        return target;
    }

    fail("S001", "Expected a DOM element or selector string for container.", { targetType: typeof target, context: "mount" });
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
                report("S006", error, { component: name, rawProps, context: "mount" });
            }
        }

        renderApp(() => h(component, props), el);
        runtime.mountedSignatures.set(el, signature);
    });
}
