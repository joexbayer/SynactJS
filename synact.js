const SynactJSCore = (() => {
    let currentComponent = null;
    const contextMap = new Map();
    const globalContexts = new Map();

    /* Global container ID generator */
    let globalContainerId = 0;
    const containerIdMap = new WeakMap();

    function generateContainerId(container) {
        if (!containerIdMap.has(container)) {
            containerIdMap.set(container, `/Mount${globalContainerId++}`);
        }
        return containerIdMap.get(container);
    }

    function h(type, props = {}, ...children) {
        return {
            __type: type,
            props,
            children: children.flat(),
            key: props?.key ?? null
        };
    }

    function createElement(vnode, parentId = "", index = 0) {
        if (typeof vnode === "string" || typeof vnode === "number") {
            return document.createTextNode(String(vnode));
        }

        if (typeof vnode === "boolean") {
            return document.createTextNode("");
        }

        if (!vnode || typeof vnode !== "object" || !vnode.__type) {
            throw new Error("Invalid vnode: " + JSON.stringify(vnode));
        }

        if (typeof vnode.__type === "function") {
            throw new Error("createElement should not be called with functional components.");
        }

        const el = document.createElement(vnode.__type);
        setProps(el, vnode.props || {});

        const thisId = getComponentId(vnode, parentId, index);
        for (let i = 0; i < (vnode.children || []).length; i++) {
            const child = vnode.children[i];
            el.appendChild(createElement(resolveVNode(child, el, i, thisId), thisId, i));
        }

        return el;
    }

    function resolveVNode(vnode, parent, index, parentId = "") {
        while (vnode && typeof vnode.__type === "function") {
            const id = getComponentId(vnode, parentId, index);
            vnode = renderComponent(vnode, parent, index, parentId);
            /* Build a "ID tree" for the component */
            parentId = id;
        }
        return vnode;
    }

    function setProps(el, props) {
        for (const key in props) {
            if (key.startsWith("on")) {
                el[key.toLowerCase()] = props[key];
            } else {
                el.setAttribute(key, props[key]);
            }
        }
    }

    function updateProps(el, newProps, oldProps) {
        if (!el || !newProps || !oldProps) return;
        const all = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);
        for (const key of all) {
            const n = newProps[key];
            const o = oldProps[key];

            if (n === o) continue;

            /* Special case for 'value' and 'checked' attribute, as setAttribute does not update html?  */
            if (key === "value") {
                el.value = n || "";
                continue;
            }

            if (key === "checked") {
                el.checked = Boolean(n);
                continue;
            }

            if (key.startsWith("on")) {
                el[key.toLowerCase()] = n || null;
            } else if (n == null) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, n);
            }
        }
    }

    function getComponentId(vnode, parentId, index) {
        let name = 'Unknown';

        if (typeof vnode?.__type === 'function') {
            name = vnode.__type.name || 'Anon';
        } else if (typeof vnode?.__type === 'string') {
            name = vnode.__type;
        }

        const key = vnode?.key ?? index;
        return `${parentId}/${name}:${key}`;
    }

    function renderComponent(vnode, parent, index, parentId = "") {
        const id = getComponentId(vnode, parentId, index);
        let ctx = contextMap.get(id);

        const prev = currentComponent;

        if (!ctx) {
            ctx = {
                hooks: [],
                hookIndex: 0,
                effects: [],
                vnode,
                parent,
                index,
                render: null,
                renderedVNode: null,
            };

            contextMap.set(id, ctx);

            ctx.render = () => {
                ctx.hookIndex = 0;
                ctx.effects = [];
                currentComponent = ctx;
                const outputVNode = ctx.vnode.__type(ctx.vnode.props);
                const childId = getComponentId(ctx.vnode, parentId, ctx.index);

                patch(ctx.parent, outputVNode, ctx.renderedVNode, ctx.index, childId);
                ctx.renderedVNode = outputVNode;
                currentComponent = null;
                ctx.effects.forEach(fn => fn());
            };
        }

        currentComponent = ctx;
        ctx.hookIndex = 0;
        ctx.effects = [];
        ctx.vnode = vnode;
        ctx.parent = parent;
        ctx.index = index;

        const output = vnode.__type(vnode.props);
        ctx.renderedVNode = output;

        currentComponent = prev;
        ctx.effects.forEach(fn => fn());

        return ctx.renderedVNode;
    }

    function patch(parent, newVNode, oldVNode, index = 0, parentId = "") {
        const existing = parent.childNodes[index];

        const currentId = getComponentId(newVNode, parentId, index);
        cleanupSubtree(currentId);

        if (!newVNode) {
            if (existing) parent.removeChild(existing);
            return;
        }

        if (typeof newVNode?.__type === "function") {
            const newChild = renderComponent(newVNode, parent, index, parentId);
            const oldChildCtx = contextMap.get(getComponentId(oldVNode, parentId, index));
            const oldChild = oldChildCtx?.renderedVNode;
            patch(parent, newChild, oldChild, index, parentId);
            return;
        }

        /* Handle different types or mismatched element types */
        if (
            typeof newVNode !== typeof oldVNode ||
            newVNode?.__type !== oldVNode?.__type ||
            JSON.stringify({ ...newVNode.props, value: undefined }) !== JSON.stringify({ ...oldVNode.props, value: undefined })
        ) {
            const vnode = resolveVNode(newVNode, parent, index, parentId);
            const el = createElement(vnode, parentId, index);
            if (existing) {
                parent.replaceChild(el, existing);

            } else {
                parent.appendChild(el);
            }
            return;
        }

        updateProps(existing, newVNode?.props || {}, oldVNode?.props || {});
        const newChildren = newVNode?.children || [];
        const oldChildren = oldVNode?.children || [];

        if ((typeof newVNode === "string" || typeof newVNode === "number") && (typeof oldVNode === "string" || typeof oldVNode === "number")) {
            const newText = String(newVNode);
            if (existing.textContent !== newText) {
                existing.textContent = newText;
            }
            return;
        }

        while (existing.childNodes.length > newChildren.length) {
            existing.removeChild(existing.lastChild);
        }

        const maxLen = Math.max(newChildren.length, oldChildren.length);
        for (let i = 0; i < maxLen; i++) {
            patch(existing, newChildren[i], oldChildren[i], i, currentId);
        }
    }

    function useState(initialValue) {
        const ctx = currentComponent;
        const i = ctx.hookIndex++;
        let scheduled = false;

        if (!ctx.hooks[i]) {
            ctx.hooks[i] = {
                value: initialValue,
                set: (newVal) => {
                    ctx.hooks[i].value = newVal;

                    if (!scheduled) {
                        scheduled = true;
                        queueMicrotask(() => {
                            scheduled = false;
                            if (ctx.render) ctx.render();
                        });
                    }
                }
            };
        }

        return [ctx.hooks[i].value, ctx.hooks[i].set];
    }

    function cleanupSubtree(parentId) {
        for (const [id, ctx] of contextMap.entries()) {
            if (id.startsWith(parentId)) {
                cleanupEffects(ctx);
                contextMap.delete(id);
            }
        }
    }

    /* Helper function for useEffect to clean up effects */
    function cleanupEffects(ctx) {
        if (ctx && Array.isArray(ctx.hooks)) {
            for (const hook of ctx.hooks) {
                if (hook && typeof hook.cleanup === "function") {
                    hook.cleanup();
                }
            }
        }
    }

    function useEffect(effectFn, deps) {
        const ctx = currentComponent;
        const i = ctx.hookIndex++;
        const prev = ctx.hooks[i];
        const changed = !prev || !deps || deps.some((dep, j) => !Object.is(dep, prev.deps?.[j]));

        if (changed) {
            /* Call old cleanup before overwriting it */
            if (prev && typeof prev.cleanup === "function") {
                //prev.cleanup();
            }

            ctx.hooks[i] = { deps };
            ctx.effects.push(() => {
                const cleanup = effectFn();
                if (typeof cleanup === "function") {
                    ctx.hooks[i].cleanup = cleanup;
                }
            });
        } else {
            /* Even if not changed, carry forward the cleanup function */
            ctx.hooks[i] = prev;
        }
    }

    function createContext(defaultValue) {
        const id = Symbol("context");
        const context = {
            id,
            defaultValue,
            Provider: ({ value, children }) => {
                globalContexts.set(id, value);
                return Array.isArray(children) ? h(Fragment, {}, ...children) : children;
            }
        };
        return context;
    }

    function useContext(context) {
        if (globalContexts.has(context.id)) {
            return globalContexts.get(context.id);
        }
        return context.defaultValue;
    }

    function renderApp(componentFn, container) {
        if (!container.__SynactJSCtx) {
            container.__SynactJSCtx = {
                hooks: [],
                hookIndex: 0,
                effects: [],
                vnode: null,
                render: null,
                renderedVNode: null,
                parent: container,
                index: 0,
                render: null,
                hooks: [],
                effects: []
            };
        }
        const ctx = container.__SynactJSCtx;

        ctx.render = () => {
            ctx.hookIndex = 0;
            ctx.effects = [];
            currentComponent = ctx;

            /* Create initial component / node */
            const newVNode = componentFn()
            patch(container, newVNode, ctx.vnode, 0, generateContainerId(container));
            ctx.vnode = newVNode;
            currentComponent = null;
            ctx.effects.forEach(fn => fn());
        };

        ctx.render();
    }

    /* Bit hacky useRouter implementation */
    function useRouter(url_prefix = '') {

        const path = window.location.pathname;
        const [route, setRoute] = useState(url_prefix && path.startsWith(url_prefix) ? path.slice(url_prefix.length) || "/" : path);

        useEffect(() => {
            const onPop = () => {
                const path = window.location.pathname;
                setRoute(url_prefix && path.startsWith(url_prefix) ? path.slice(url_prefix.length) || "/" : path);
            };

            window.addEventListener("popstate", onPop);

            const onClick = (e) => {
                const t = e.target.closest("a");
                if (t && t.href && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && t.origin === location.origin) {
                    let path = t.pathname;

                    /* Handle relative paths */
                    if (url_prefix && path.startsWith(url_prefix)) {
                        path = path.slice(url_prefix.length) || "/";
                    }

                    e.preventDefault();
                    history.pushState({}, '', url_prefix + path);
                    setRoute(path);
                }
            };
            window.addEventListener("click", onClick);

            return () => {
                window.removeEventListener("popstate", onPop);
                window.removeEventListener("click", onClick);
            };
        }, [url_prefix]);

        const push = (path) => {
            if (!path.startsWith("/")) path = "/" + path;
            if (url_prefix && path.startsWith(url_prefix)) {
                path = path.slice(url_prefix.length) || "/";
            }
            if (path !== route) {
                history.pushState({}, '', url_prefix + path);
                setRoute(path);
            }
        };

        return [route, push];
    }

    function Fragment(props) {
        return props.children;
    }

    function RouteView({ routes, prefix = '' }) {
        const [route] = useRouter(prefix);
        const match = routes[route] || routes['*'];
        return div({}, match ? match() : null);
    }

    function useMemo(factory, deps) {
        const ctx = currentComponent;
        const i = ctx.hookIndex++;
        let prev = ctx.hooks[i];

        if (!prev || !deps || deps.some((dep, j) => !Object.is(dep, prev.deps?.[j]))) {
            const value = factory();
            ctx.hooks[i] = { value, deps };
            return value;
        }
        return prev.value;
    }

    function useCallback(callback, deps) {
        const ctx = currentComponent;
        const i = ctx.hookIndex++;
        let prev = ctx.hooks[i];
        if (!prev || !deps || deps.some((dep, j) => !Object.is(dep, prev.deps?.[j]))) {
            ctx.hooks[i] = { value: callback, deps };
            return callback;
        }
        return typeof prev.value === "function" ? prev.value : callback;
    }

    function mountComponents() {
        document.querySelectorAll("[data-component]").forEach(el => {
            const name = el.getAttribute("data-component")?.trim();
            const comp = window.SynactJS.components.find(c => c.name === name) || window[name];

            /* Parse data-prop attribute as JSON */
            let props = {};
            const dataProp = el.getAttribute("data-prop");
            if (dataProp) {
                try {
                    props = JSON.parse(dataProp);
                } catch (e) {
                    console.warn(`[SynactJS] Invalid JSON in data - prop for component ${name}: `, e);
                }
            }

            if (typeof comp === "function") {
                renderApp(
                    () => h(comp, props),
                    el
                );
            }
        });
    }

    /* Helper function to create tags, almost... JSX */
    const tag = (t) => (p, ...c) => h(t, p, ...c);
    const div = tag('div');
    const h1 = tag('h1');
    const h2 = tag('h2');
    const h3 = tag('h3');
    const h4 = tag('h4');
    const h5 = tag('h5');
    const p = tag('p');
    const button = tag('button');
    const strong = tag('strong');
    const span = tag('span');
    const ul = tag('ul');
    const li = tag('li');
    const input = tag('input');
    const form = tag('form');
    const label = tag('label');
    const a = tag('a');
    const nav = tag('nav');
    const hr = tag('hr');
    const i = tag('i');
    const section = tag('section');
    const pre = tag('pre');
    const code = tag('code');
    const img = tag('img');
    const table = tag('table');
    const thead = tag('thead');
    const tbody = tag('tbody');
    const tr = tag('tr');
    const td = tag('td');
    const th = tag('th');
    const footer = tag('footer');
    const header = tag('header');
    const main = tag('main');
    const textarea = tag('textarea');
    const select = tag('select');
    const option = tag('option');
    const svg = tag('svg');
    const br = tag('br');
    const small = tag('small');
    const ol = tag('ol');
    const dl = tag('dl');
    const dt = tag('dt');
    const dd = tag('dd');
    const fieldset = tag('fieldset');

    return {
        h,
        useState,
        useEffect,
        useContext,
        useMemo,
        useCallback,
        createContext,
        renderApp,
        RouteView,
        Fragment,
        contextMap,
        mountComponents,
        useRouter,
        div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input,
        form, label, a, nav, hr, i, section, pre, code, img, table, thead, tbody, tr, td, th,
        footer, header, main, textarea, select, option, svg, br, small,
        ol, dl, dt, dd, fieldset,
        createElement,
        setProps,
        updateProps,
        patch
    };

})();

const {
    h,
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
    createContext,
    renderApp,
    RouteView,
    Fragment,
    useRouter,
    contextMap,
    mountComponents,
    div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav, hr, i, section, pre, code, img, table, thead, tbody, tr, td, th,
    footer, header, main, textarea, select, option, svg, br, small,
    ol, dl, dt, dd, fieldset,
    createElement,
    setProps,
    updateProps,
    patch
} = SynactJSCore;

/* SynactJS global object to hold components */
const SynactJS = {
    components: [],
    register: function (component) {
        console.log(`[SynactJS] Registering component: ${component.name} `);
        this.components.push(component);
        mountComponents();
    }
};

/* Auto-register components from global scope if we are in web */
if (typeof window !== "undefined") {

    /* Object assignt to make SynactJS available globally */
    Object.assign(window, {
        h,
        useState,
        useEffect,
        useContext,
        useMemo,
        useCallback,
        createContext,
        renderApp,
        RouteView,
        Fragment,
        useRouter,
        div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav,
        hr, i, section, pre, code, img, table, thead, tbody, tr, td, th,
        footer, header, main, textarea, select, option, svg, br, small,
        ol, dl, dt, dd, fieldset,
        createElement, setProps,
        updateProps,
        patch,

        SynactJS
    });
    window.SynactJS = SynactJS;
    Object.assign(window, { SynactJS })

    /* Auto-attach components to elements with data-component attribute on DOMContentLoaded */
    document.addEventListener("DOMContentLoaded", () => {
        mountComponents();
    });

    /* Cleanup on beforeunload */
    window.addEventListener("beforeunload", () => {
        for (const ctx of contextMap.values()) {
            cleanupEffects(ctx);
        }
        contextMap.clear();
    });

    SynactJS.define = function define(tagName, Component) {
        if (customElements.get(tagName)) return;

        class SynactElement extends HTMLElement {
            static get observedAttributes() {
                return [];
            }

            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                this._props = {};
            }

            connectedCallback() {
                this._updatePropsFromAttributes();
                renderApp(() => h(Component, this._props), this.shadowRoot);
            }

            attributeChangedCallback(name, oldVal, newVal) {
                if (oldVal === newVal) return;
                this._props[name] = tryJSON(newVal);
                renderApp(() => h(Component, this._props), this.shadowRoot);
            }

            /* public: programmatic prop updates */
            setProps(obj) {
                Object.assign(this._props, obj);
                renderApp(() => h(Component, this._props), this.shadowRoot);
            }

            /* ---- helpers ---- */
            _updatePropsFromAttributes() {
                for (const attr of this.attributes) {
                    this._props[attr.name] = tryJSON(attr.value);
                }
            }
        }

        customElements.define(tagName, SynactElement);
    };

    function tryJSON(v) {
        try { return JSON.parse(v); } catch { return v; }
    }
}

/* Export for Jest testing */
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        h,
        useState,
        useEffect,
        useContext,
        useMemo,
        useCallback,
        createContext,
        renderApp,
        RouteView,
        Fragment,
        useRouter,
        div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav,

        createElement,
        setProps,
        updateProps,
        patch,

        SynactJS
    };
}