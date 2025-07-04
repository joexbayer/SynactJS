// === Virtual DOM & Internal State ===
let currentComponent = null;
const contextMap = new Map();
const componentStack = [];

// === h() ===
export function h(type, props = {}, ...children) {
    return {
        __type: type,
        props,
        children: children.flat(),
        key: props?.key ?? null
    };
}

// === createElement ===
export function createElement(vnode, parentId = "", index = 0) {
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
export function setProps(el, props) {
    for (const key in props) {
        if (key.startsWith("on")) {
            el[key.toLowerCase()] = props[key];
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

export function updateProps(el, newProps, oldProps) {
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
            providedContexts: new Map(),
            parentContext: prev, // ✅ parentContext assigned on initial creation
        };

        contextMap.set(id, ctx);

        ctx.render = () => {
            ctx.hookIndex = 0;
            ctx.effects = [];
            currentComponent = ctx;
            ctx.parentContext = prev; // ✅ also assign during render() in case nesting changes
            const outputVNode = ctx.vnode.__type(ctx.vnode.props);
            patch(ctx.parent, outputVNode, ctx.renderedVNode, ctx.index, id);
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
    ctx.parentContext = prev; // ✅ FIX: always assign latest parent context

    const output = vnode.__type(vnode.props);
    ctx.renderedVNode = output;

    currentComponent = prev;
    ctx.effects.forEach(fn => fn());

    return ctx.renderedVNode;
}
// === patch() ===
export function patch(parent, newVNode, oldVNode, index = 0, parentId = "") {
    const existing = parent.childNodes[index];

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

    if (
        typeof newVNode !== typeof oldVNode ||
        (typeof newVNode === "string" && newVNode !== oldVNode) ||
        newVNode.__type !== oldVNode.__type
    ) {
        const vnode = resolveVNode(newVNode, parent, index, parentId);
        parent.replaceChild(createElement(vnode, parentId, index), existing);
        return;
    }

    if (typeof newVNode.__type === "function") {
        const newChild = renderComponent(newVNode, parent, index, parentId);
        const oldChild = contextMap.get(getComponentId(oldVNode, parentId, index))?.vnode;
        patch(parent, newChild, oldChild, index, parentId);
        return;
    }

    updateProps(existing, newVNode.props || {}, oldVNode.props || {});
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];

    while (existing.childNodes.length > newChildren.length) {
        existing.removeChild(existing.lastChild);
    }

    for (let i = 0; i < newChildren.length; i++) {
        patch(existing, newChildren[i], oldChildren[i], i, `${parentId}/${newVNode.__type}:${newVNode.key ?? index}`);
    }
}

// === Hooks ===
export function useState(initialValue) {
    const ctx = currentComponent;
    const i = ctx.hookIndex++;

    console.log(ctx)

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

export function useEffect(effectFn, deps) {
    const ctx = currentComponent;
    const i = ctx.hookIndex++;
    const prev = ctx.hooks[i];
    const changed = !prev || !deps || deps.some((dep, j) => !Object.is(dep, prev.deps?.[j]));

    if (changed) {
        ctx.hooks[i] = { deps };
        ctx.effects.push(effectFn);
    }
}

// === Context ===
export function createContext(defaultValue) {
    const id = Symbol("context");
    const context = {
        id,
        defaultValue,
        Provider: ({ value, children }) => {
            console.log(currentComponent, "Provider called with value:", value);

            const ctx = currentComponent;
            if (!ctx) throw new Error("Provider must be used inside a component");
            ctx.providedContexts.set(id, value); // changed
            return children;
        }
    };
    return context;
}

export function useContext(context) {
    let ctx = currentComponent;
    const searched = [];

    while (ctx) {
        searched.push(ctx.vnode?.__type?.name);
        if (ctx.providedContexts?.has(context.id)) {
            return ctx.providedContexts.get(context.id);
        }
        ctx = ctx.parentContext;
    }

    console.warn("⚠️ Context default used:", context.defaultValue, "after searching:", searched);
    return context.defaultValue;
}

// === App Rendering ===
export function renderApp(componentFn, container) {
    const ctx = {
        hooks: [],
        hookIndex: 0,
        effects: [],
        vnode: null,
        render: null,
        providedContexts: new Map(),
        parentContext: null
    };

    ctx.render = () => {
        ctx.hookIndex = 0;
        ctx.effects = [];
        currentComponent = ctx;
        componentStack.length = 0;
        const newVNode = h(componentFn);
        patch(container, newVNode, ctx.vnode);
        ctx.vnode = newVNode;
        currentComponent = null;
        ctx.effects.forEach(fn => fn());
    };

    ctx.render();
}

// === Shorthand Tags ===
const tag = (t) => (p, ...c) => h(t, p, ...c);
export const div = tag('div');
export const h1 = tag('h1');
export const h2 = tag('h2');
export const h3 = tag('h3');
export const h4 = tag('h4');
export const h5 = tag('h5');
export const p = tag('p');
export const button = tag('button');
export const strong = tag('strong');
export const span = tag('span');
export const ul = tag('ul');
export const li = tag('li');
export const input = tag('input');
export const form = tag('form');
export const label = tag('label');
export const a = tag('a');
export const nav = tag('nav');

// === Router ===
export function useRouter() {
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

export function Fragment(props) {
    return props.children;
}

export function RouteView({ routes }) {
    const [route] = useRouter();
    const match = routes[route] || routes['*'];
    return div({}, match ? match() : null);
}

// === Dev Exposure ===
Object.assign(window, {
    h,
    useState,
    useEffect,
    useContext,
    createContext,
    renderApp,
    RouteView,
    Fragment,
    useRouter,
    div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav
});