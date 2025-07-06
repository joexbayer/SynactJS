// === Virtual DOM & Internal State ===
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

// === h() ===
function h(type, props = {}, ...children) {
    return {
        __type: type,
        props,
        children: children.flat(),
        key: props?.key ?? null
    };
}

// === createElement ===
function createElement(vnode, parentId = "", index = 0) {
    if (typeof vnode === "string" || typeof vnode === "number") {
        return document.createTextNode(String(vnode));
    }

    if (!vnode || typeof vnode !== "object" || !vnode.__type) {
        throw new Error("Invalid vnode: " + JSON.stringify(vnode));
    }

    if (typeof vnode.__type === "function") {
        throw new Error("createElement should not be called with functional components.");
    }

    const el = document.createElement(vnode.__type);
    setProps(el, vnode.props || {});
    for (let i = 0; i < (vnode.children || []).length; i++) {
        const child = vnode.children[i];
        el.appendChild(createElement(resolveVNode(child, el, i, `${parentId}/${vnode.__type}:${vnode.key ?? index}`), parentId, i));
    }
    return el;
}

// === resolveVNode ===
function resolveVNode(vnode, parent, index, parentId = "") {
    while (vnode && typeof vnode.__type === "function") {
        vnode = renderComponent(vnode, parent, index, parentId);
    }
    return vnode;
}

// === DOM Props ===
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
    const all = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);
    for (const key of all) {
        const n = newProps[key];
        const o = oldProps[key];
        if (n !== o) {
            if (key.startsWith("on")) {
                el[key.toLowerCase()] = n || null;
            } else if (n == null) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, n);
            }
        }
    }
}

// === Component Context & Render ===
function getComponentId(vnode, parentId, index) {
    return `${parentId}/${vnode.__type.name}:${vnode.key ?? index}`;
}

/* Function creates contexts for each component and renders them */ 
function renderComponent(vnode, parent, index, parentId = "") {
    const id = getComponentId(vnode, parentId, index);
    console.log(`Rendering component: ${id}`);
    let ctx = contextMap.get(id);

    const prev = currentComponent;

    /* State is created once per component instance, then reused on next render */
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

            /* Idea is to only path the DOM from the previous renderedVNode to the new outputVNode */ 
            patch(ctx.parent, outputVNode, ctx.renderedVNode, ctx.index, id);
            ctx.renderedVNode = outputVNode;
            currentComponent = null;

            /* Run all effects after the render is complete */
            ctx.effects.forEach(fn => fn());
        };
    }

    /* Reset hook index and effects for each render */
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

// === patch() ===
function patch(parent, newVNode, oldVNode, index = 0, parentId = "") {
    const existing = parent.childNodes[index];
    console.log(`Patching node at index ${index} in parent ${parentId}`);

    if (!oldVNode) {
        const vnode = resolveVNode(newVNode, parent, index, parentId);
        const el = createElement(vnode, parentId, index);
        parent.appendChild(el);
        return;
    }

    if (!newVNode) {
        parent.removeChild(existing);
        return;
    }

    /* Replace the entire node if types differ */ 
    if (typeof newVNode !== typeof oldVNode || (typeof newVNode === "string" && newVNode !== oldVNode) || newVNode.__type !== oldVNode.__type) {
        const vnode = resolveVNode(newVNode, parent, index, parentId);
        parent.replaceChild(createElement(vnode, parentId, index), existing);
        return;
    }

    /* Handle functional components */
    if (typeof newVNode.__type === "function") {
        const newChild = renderComponent(newVNode, parent, index, parentId);

        /* If the oldVNode is a functional component, we need to patch it */
        const oldChild = contextMap.get(getComponentId(oldVNode, parentId, index))?.vnode;
        patch(parent, newChild, oldChild, index, parentId);
        return;
    }

    updateProps(existing, newVNode.props || {}, oldVNode.props || {});
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];
 
    console.log(`Patching children of ${parentId}/${newVNode.__type}:${newVNode.key ?? index}`);
    cleanupSubtree(`${parentId}/${newVNode.__type}:${newVNode.key ?? index}`);
    while (existing.childNodes.length > newChildren.length) {
        existing.removeChild(existing.lastChild);
    }

    /* Add new children */
    for (let i = 0; i < newChildren.length; i++) {
        patch(existing, newChildren[i], oldChildren[i], i, `${parentId}/${newVNode.__type}:${newVNode.key ?? index}`);
    }
}

// === Hooks ===
function useState(initialValue) {
    const ctx = currentComponent;
    const i = ctx.hookIndex++;

    if (!ctx.hooks[i]) {
        ctx.hooks[i] = {
            value: initialValue,
            set: (newVal) => {
                ctx.hooks[i].value = newVal;
                if (ctx.render) ctx.render();
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

// === Context ===

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

// === App Rendering ===
function renderApp(componentFn, container) {
    // Try to reuse the same context for this container
    if (!container.__miniReactCtx) {
        container.__miniReactCtx = {
            hooks: [],
            hookIndex: 0,
            effects: [],
            vnode: null,
            render: null,
        };
    }
    const ctx = container.__miniReactCtx;

    ctx.render = () => {
        ctx.hookIndex = 0;
        ctx.effects = [];
        currentComponent = ctx;

        /* Create initial component / node */
        const newVNode = h(componentFn);
        patch(container, newVNode, ctx.vnode, 0, generateContainerId(container));
        ctx.vnode = newVNode;
        currentComponent = null;
        ctx.effects.forEach(fn => fn());
    };

    ctx.render();
}

// === Shorthand Tags ===
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

// === Router ===
function useRouter() {
    const [route, setRoute] = useState(window.location.pathname);

    useEffect(() => {
        const onPop = () => setRoute(window.location.pathname);
        window.addEventListener("popstate", onPop);

        const onClick = (e) => {
            const t = e.target.closest("a");
            if (t && t.href && !e.defaultPrevented && e.button === 0 &&
                !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
                t.origin === location.origin) {
                e.preventDefault();
                const path = t.pathname;
                if (path !== route) {
                    history.pushState({}, '', path);
                    setRoute(path);
                }
            }
        };
        window.addEventListener("click", onClick);

        return () => {
            window.removeEventListener("popstate", onPop);
            window.removeEventListener("click", onClick);
        };
    }, [route]);

    const push = (path) => {
        if (path !== route) {
            history.pushState({}, '', path);
            setRoute(path);
        }
    };

    return [route, push];
}

function Fragment(props) {
    return props.children;
}

function RouteView({ routes }) {
    const [route] = useRouter();
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

const MiniReact = {
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

    components: [],
    register: function(component) {
        console.log(`Registering component: ${component.name}`);
        this.components.push(component);
    }
};

if (typeof window !== "undefined") {
    // === Dev Exposure ===
    Object.assign(window, {
        h,
        useState,
        useEffect,
        useContext,
        useMemo,
        useCallback,
        createContext,
        RouteView,
        Fragment,
        useRouter,
        div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav
    });

    window.miniReact = MiniReact;
    Object.assign(window, { MiniReact})

    /* Auto-attach components to elements with data-component attribute on DOMContentLoaded */
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-component]").forEach(el => {
            const name = el.getAttribute("data-component")?.trim();
            const comp = window.miniReact.components.find(c => c.name === name) || window[name];

            /* Parse data-prop attribute as JSON */
            let props = {};
            const dataProp = el.getAttribute("data-prop");
            if (dataProp) {
                try {
                    props = JSON.parse(dataProp);
                } catch (e) {
                    console.warn(`Invalid JSON in data-prop for component ${name}:`, e);
                }
            }

            if (typeof comp === "function") {
                window.miniReact.renderApp(
                    () => h(comp, props),
                    el
                );
            }
        });
    });

    window.addEventListener("beforeunload", () => {
        for (const ctx of contextMap.values()) {
            cleanupEffects(ctx);
        }
        contextMap.clear();
    });
}

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

        MiniReact
    };
}