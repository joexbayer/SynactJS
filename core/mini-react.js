// === Virtual DOM ===
export function h(type, props = {}, ...children) {
    return { type, props, children: children.flat() };
}

export function createElement(vnode) {
    if (typeof vnode === "string" || typeof vnode === "number") {
        return document.createTextNode(String(vnode));
    }

    const el = document.createElement(vnode.type);
    setProps(el, vnode.props || {});
    for (const child of vnode.children) {
        el.appendChild(createElement(child));
    }
    return el;
}

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
    const allProps = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);
    for (const key of allProps) {
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

export function patch(parent, newVNode, oldVNode, index = 0) {
    const existing = parent.childNodes[index];

    if (!oldVNode) {
        parent.appendChild(createElement(newVNode));
    } else if (!newVNode) {
        parent.removeChild(existing);
    } else if (typeof newVNode !== typeof oldVNode ||
        (typeof newVNode === "string" && newVNode !== oldVNode) ||
        newVNode.type !== oldVNode.type) {
        parent.replaceChild(createElement(newVNode), existing);
    } else if (typeof newVNode !== "string") {
        updateProps(existing, newVNode.props || {}, oldVNode.props || {});

        // Remove extra old children
        while (existing.childNodes.length > newVNode.children.length) {
            existing.removeChild(existing.lastChild);
        }

        // Patch children
        for (let i = 0; i < newVNode.children.length; i++) {
            patch(existing, newVNode.children[i], oldVNode.children[i], i);
        }
    }
}

// === Hooks and Runtime ===
let currentComponent = null;

export function useState(initialValue) {
    const ctx = currentComponent;
    const i = ctx.hookIndex++;

    if (!ctx.hooks[i]) {
        ctx.hooks[i] = {
            value: initialValue,
            set: (newVal) => {
                // Always ensure array state stays an array
                ctx.hooks[i].value = (initialValue instanceof Array && newVal == null) ? [] : newVal;
                ctx.render();
            }
        };
    }

    // Always return an array if initialValue is array and value is falsy
    let value = ctx.hooks[i].value;
    if (initialValue instanceof Array && !Array.isArray(value)) {
        value = [];
        ctx.hooks[i].value = value;
    }

    return [value, ctx.hooks[i].set];
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

export function renderApp(componentFn, container) {
    // Store context per container to persist hooks across renders
    if (!container._miniReactCtx) {
        container._miniReactCtx = {
            hooks: [],
            hookIndex: 0,
            effects: [],
            vnode: null,
            render: null
        };
    }
    const ctx = container._miniReactCtx;
    ctx.render = () => {
        ctx.hookIndex = 0;
        ctx.effects = [];
        currentComponent = ctx;
        const newVNode = componentFn();
        patch(container, newVNode, ctx.vnode);
        ctx.vnode = newVNode;
        for (const fn of ctx.effects) fn();
    };
    ctx.render();
}

// === Shorthand Tag Functions ===
export const div = (props, ...children) => h('div', props, ...children);
export const h1 = (props, ...children) => h('h1', props, ...children);
export const h2 = (props, ...children) => h('h2', props, ...children);
export const h3 = (props, ...children) => h('h3', props, ...children);
export const h4 = (props, ...children) => h('h4', props, ...children);
export const h5 = (props, ...children) => h('h5', props, ...children);
export const p = (props, ...children) => h('p', props, ...children);
export const button = (props, ...children) => h('button', props, ...children);
export const strong = (props, ...children) => h('strong', props, ...children);
export const span = (props, ...children) => h('span', props, ...children);
export const ul = (props, ...children) => h('ul', props, ...children);
export const li = (props, ...children) => h('li', props, ...children);
export const input = (props, ...children) => h('input', props, ...children);
export const form = (props, ...children) => h('form', props, ...children);
export const label = (props, ...children) => h('label', props, ...children);
export const a = (props, ...children) => h('a', props, ...children);
export const nav = (props, ...children) => h('nav', props, ...children);


const tags = {
    div, h1, h2, h3, h4, h5, p, button, strong, span, ul, li, input, form, label, a, nav
};

export function useRouter() {
    const [route, setRoute] = useState(window.location.pathname);

    useEffect(() => {
        const onPopState = () => setRoute(window.location.pathname);
        window.addEventListener('popstate', onPopState);

        // Handle clicks on <a> elements
        const onClick = (e) => {
            if (
                e.target.tagName === 'A' &&
                e.target.href &&
                e.button === 0 &&
                !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
                e.target.origin === window.location.origin
            ) {
                e.preventDefault();
                const path = e.target.pathname;
                if (path !== route) {
                    window.history.pushState({}, '', path);
                    setRoute(path);
                }
            }
        };
        window.addEventListener('click', onClick);

        return () => {
            window.removeEventListener('popstate', onPopState);
            window.removeEventListener('click', onClick);
        };
    }, [route]);

    const push = (path) => {
        if (path !== route) {
            window.history.pushState({}, '', path);
            setRoute(path);
        }
    };

    return [route, push];
}

export function Router({ routes, route }) {
    const match = routes[route] || routes['*'];
    return match ? match() : null;
}

Object.assign(window, {
    h,
    useState,
    useEffect,
    renderApp,
    Router,
    useRouter,
    ...tags
});
