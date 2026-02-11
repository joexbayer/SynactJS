export function isPrimitiveVNode(vnode) {
    return typeof vnode === "string" || typeof vnode === "number";
}

export function isIgnoredVNode(vnode) {
    return vnode == null || typeof vnode === "boolean";
}

export function isContextProviderType(type) {
    return Boolean(type && type.__synactProvider === true && type.__context);
}

export function isContextProviderVNode(vnode) {
    return Boolean(vnode && typeof vnode === "object" && isContextProviderType(vnode.__type));
}

export function isFunctionVNode(vnode) {
    return Boolean(vnode && typeof vnode === "object" && typeof vnode.__type === "function" && !isContextProviderVNode(vnode));
}

export function isElementVNode(vnode) {
    return Boolean(vnode && typeof vnode === "object" && typeof vnode.__type === "string");
}

function normalizeChildren(inputChildren) {
    const normalized = [];

    const pushChild = (child) => {
        if (Array.isArray(child)) {
            for (const nestedChild of child) {
                pushChild(nestedChild);
            }
            return;
        }

        if (isIgnoredVNode(child)) {
            return;
        }

        normalized.push(child);
    };

    for (const child of inputChildren) {
        pushChild(child);
    }

    return normalized;
}

export function h(type, props = {}, ...children) {
    const vnodeProps = props || {};
    const hasPropChildren = Object.prototype.hasOwnProperty.call(vnodeProps, "children");
    const inputChildren = children.length > 0 ? children : hasPropChildren ? [vnodeProps.children] : [];

    return {
        __type: type,
        props: vnodeProps,
        children: normalizeChildren(inputChildren),
        key: vnodeProps?.key ?? null
    };
}

export function getComponentId(vnode, parentId, index) {
    let name = "Node";

    if (typeof vnode?.__type === "function") {
        name = vnode.__type.name || "Anon";
    } else if (typeof vnode?.__type === "string") {
        name = vnode.__type;
    } else if (isPrimitiveVNode(vnode)) {
        name = "Text";
    }

    const key = vnode && typeof vnode === "object" ? vnode.key ?? index : index;
    return `${parentId}/${name}:${key}`;
}

export function getProviderChild(vnode) {
    const providedChildren = vnode?.props?.children;

    if (Array.isArray(providedChildren)) {
        return providedChildren[0] ?? null;
    }

    if (providedChildren !== undefined) {
        return providedChildren;
    }

    const fallbackChildren = vnode?.children;
    if (Array.isArray(fallbackChildren)) {
        return fallbackChildren[0] ?? null;
    }

    return fallbackChildren ?? null;
}
