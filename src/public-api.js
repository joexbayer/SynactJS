import SynactJSCore from "./core.js";
import { runtime, cleanupHookCollection } from "./state.js";
import { configureRuntime, getRuntimeConfig, fail } from "./errors.js";
import { browserHelpers } from "./browser.js";

export const SynactJS = {
    register(component) {
        if (typeof component !== "function") {
            fail("S002", "register() expects a component function.", { context: "public-api.register" });
        }

        const componentName = component.name;
        if (!componentName) {
            fail("S003", "register() requires a named function component so data-component can resolve it.", {
                context: "public-api.register"
            });
        }

        runtime.componentRegistry.set(componentName, component);
        this.components = Array.from(runtime.componentRegistry.values());
        SynactJSCore.mountComponents();
        return component;
    },

    render(componentOrVNode, containerOrSelector, props = {}) {
        const container = SynactJSCore.resolveContainer(containerOrSelector);

        if (typeof componentOrVNode === "function") {
            return SynactJSCore.renderApp(() => SynactJSCore.h(componentOrVNode, props), container);
        }

        return SynactJSCore.renderApp(() => componentOrVNode, container);
    },

    mount(componentOrVNode, containerOrSelector, props = {}) {
        return this.render(componentOrVNode, containerOrSelector, props);
    },

    unmount(containerOrSelector) {
        const container = SynactJSCore.resolveContainer(containerOrSelector);
        SynactJSCore.unmountContainer(container);
    },

    configure(config = {}) {
        return configureRuntime(config);
    },

    getConfig() {
        return getRuntimeConfig();
    },

    helpers: browserHelpers,
    components: []
};

export function attachBrowserGlobals() {
    if (typeof window === "undefined") {
        return;
    }

    Object.assign(window, SynactJSCore, { SynactJS });
    window.SynactJS = SynactJS;

    document.addEventListener("DOMContentLoaded", () => {
        SynactJSCore.mountComponents();
    });

    window.addEventListener("beforeunload", () => {
        for (const container of runtime.mountedContainers) {
            cleanupHookCollection(container.__SynactJSCtx?.hooks);
        }

        for (const ctx of runtime.contextMap.values()) {
            cleanupHookCollection(ctx?.hooks);
        }

        runtime.contextMap.clear();
        runtime.mountedContainers.clear();
    });
}

export function attachCommonJSExports() {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            ...SynactJSCore,
            SynactJS
        };
    }
}
