import { runtime, generateContainerId } from "./state.js";
import {
    isPrimitiveVNode,
    isIgnoredVNode,
    isContextProviderVNode,
    isFunctionVNode,
    isElementVNode,
    getComponentId,
    getProviderChild
} from "./vnode.js";
import { setProps, updateProps } from "./props.js";
import { fail, report } from "./errors.js";

function getComponentDisplayName(vnode) {
    if (typeof vnode?.__type === "function") {
        return vnode.__type.name || "AnonymousComponent";
    }
    return "UnknownComponent";
}

function createErrorVNode(error, label) {
    return {
        __type: "pre",
        props: {
            className: "synact-error",
            style: "padding:10px;border:1px solid #f5c2c7;background:#fff5f6;color:#842029;white-space:pre-wrap;"
        },
        children: [`${label}\\n${error.message}`],
        key: null
    };
}

function cleanupEffects(ctx) {
    if (!ctx || !Array.isArray(ctx.hooks)) {
        return;
    }

    for (const hook of ctx.hooks) {
        if (hook && typeof hook.cleanup === "function") {
            hook.cleanup();
            hook.cleanup = undefined;
        }
    }
}

function cleanupSubtree(parentId) {
    for (const [id, ctx] of runtime.contextMap.entries()) {
        if (id === parentId || id.startsWith(`${parentId}/`)) {
            cleanupEffects(ctx);
            runtime.contextMap.delete(id);
        }
    }
}

function cleanupVNode(vnode, parentId = "", index = 0) {
    if (isIgnoredVNode(vnode) || isPrimitiveVNode(vnode)) {
        return;
    }

    if (isContextProviderVNode(vnode)) {
        cleanupVNode(getProviderChild(vnode), parentId, index);
        return;
    }

    if (isFunctionVNode(vnode)) {
        cleanupSubtree(getComponentId(vnode, parentId, index));
        return;
    }

    if (!isElementVNode(vnode)) {
        return;
    }

    const thisId = getComponentId(vnode, parentId, index);
    const children = vnode.children || [];

    for (let i = 0; i < children.length; i++) {
        cleanupVNode(children[i], thisId, i);
    }
}

function resolveVNodeForCreate(vnode, parent, index, parentId = "") {
    let currentVNode = vnode;
    let currentParentId = parentId;

    while (true) {
        if (isIgnoredVNode(currentVNode) || isPrimitiveVNode(currentVNode) || isElementVNode(currentVNode)) {
            return currentVNode;
        }

        if (isContextProviderVNode(currentVNode)) {
            const providerType = currentVNode.__type;
            const context = providerType.__context;
            const previousValue = runtime.contextValues.has(context.id) ? runtime.contextValues.get(context.id) : runtime.CONTEXT_UNSET;

            runtime.contextValues.set(context.id, currentVNode.props?.value);
            const resolved = resolveVNodeForCreate(getProviderChild(currentVNode), parent, index, currentParentId);

            if (previousValue === runtime.CONTEXT_UNSET) {
                runtime.contextValues.delete(context.id);
            } else {
                runtime.contextValues.set(context.id, previousValue);
            }

            return resolved;
        }

        if (isFunctionVNode(currentVNode)) {
            const componentId = getComponentId(currentVNode, currentParentId, index);
            currentVNode = renderComponent(currentVNode, parent, index, currentParentId);
            currentParentId = componentId;
            continue;
        }

        fail("S005", `Invalid vnode: ${JSON.stringify(currentVNode)}`, { context: "renderer.create", parentId, index });
    }
}

function scheduleEffects(ctx) {
    if (!ctx.effects || ctx.effects.length === 0) {
        return;
    }

    const toRun = ctx.effects.slice();
    ctx.effects = [];

    for (const effectRunner of toRun) {
        try {
            effectRunner();
        } catch (error) {
            report("S008", error, { context: "effects" });
        }
    }
}

function renderComponent(vnode, parent, index, parentId = "") {
    const id = getComponentId(vnode, parentId, index);
    let ctx = runtime.contextMap.get(id);

    if (!ctx) {
        ctx = {
            hooks: [],
            hookIndex: 0,
            effects: [],
            vnode,
            parent,
            parentId,
            index,
            render: null,
            renderedVNode: null,
            renderScheduled: false,
            effectsScheduled: false
        };

        runtime.contextMap.set(id, ctx);

        ctx.render = () => {
            const prevComponent = runtime.currentComponent;

            ctx.hookIndex = 0;
            ctx.effects = [];
            runtime.currentComponent = ctx;

            let outputVNode;
            try {
                outputVNode = ctx.vnode.__type(ctx.vnode.props || {});
            } catch (error) {
                const renderedError = report("S007", error, {
                    component: getComponentDisplayName(ctx.vnode),
                    context: "component.render"
                });
                outputVNode = createErrorVNode(renderedError, `[SynactJS:${renderedError.code}] Render Error`);
            }
            runtime.currentComponent = prevComponent;

            const childParentId = getComponentId(ctx.vnode, ctx.parentId, ctx.index);
            patch(ctx.parent, outputVNode, ctx.renderedVNode, ctx.index, childParentId);
            ctx.renderedVNode = outputVNode;

            scheduleEffects(ctx);
        };
    }

    ctx.hookIndex = 0;
    ctx.effects = [];
    ctx.vnode = vnode;
    ctx.parent = parent;
    ctx.parentId = parentId;
    ctx.index = index;

    const prevComponent = runtime.currentComponent;
    runtime.currentComponent = ctx;
    let output;
    try {
        output = vnode.__type(vnode.props || {});
    } catch (error) {
        const renderedError = report("S007", error, {
            component: getComponentDisplayName(vnode),
            context: "component.initialRender"
        });
        output = createErrorVNode(renderedError, `[SynactJS:${renderedError.code}] Render Error`);
    }
    runtime.currentComponent = prevComponent;

    ctx.renderedVNode = output;
    scheduleEffects(ctx);

    return output;
}

export function createElement(vnode, parentId = "", index = 0, parent = null) {
    if (parent === null && isFunctionVNode(vnode)) {
        fail("S005", "createElement should not be called with functional components.", { context: "renderer.createRoot", parentId, index });
    }

    const resolvedVNode = resolveVNodeForCreate(vnode, parent, index, parentId);

    if (resolvedVNode !== vnode) {
        return createElement(resolvedVNode, parentId, index, parent);
    }

    if (isPrimitiveVNode(vnode)) {
        return document.createTextNode(String(vnode));
    }

    if (isIgnoredVNode(vnode)) {
        return document.createTextNode("");
    }

    if (!isElementVNode(vnode)) {
        fail("S005", `Invalid vnode: ${JSON.stringify(vnode)}`, { context: "renderer.createElement", parentId, index });
    }

    const el = document.createElement(vnode.__type);
    setProps(el, vnode.props || {});

    const thisId = getComponentId(vnode, parentId, index);
    const children = vnode.children || [];

    for (let i = 0; i < children.length; i++) {
        const childVNode = children[i];
        if (isIgnoredVNode(childVNode)) continue;
        el.appendChild(createElement(childVNode, thisId, i, el));
    }

    return el;
}

export function patch(parent, newVNode, oldVNode, index = 0, parentId = "") {
    const existing = parent.childNodes[index];

    if (isIgnoredVNode(newVNode)) {
        cleanupVNode(oldVNode, parentId, index);
        if (existing) {
            parent.removeChild(existing);
        }
        return;
    }

    if (isContextProviderVNode(newVNode)) {
        const providerType = newVNode.__type;
        const context = providerType.__context;
        const previousValue = runtime.contextValues.has(context.id) ? runtime.contextValues.get(context.id) : runtime.CONTEXT_UNSET;

        runtime.contextValues.set(context.id, newVNode.props?.value);

        const newChild = getProviderChild(newVNode);
        const oldChild = isContextProviderVNode(oldVNode) ? getProviderChild(oldVNode) : oldVNode;
        patch(parent, newChild, oldChild, index, parentId);

        if (previousValue === runtime.CONTEXT_UNSET) {
            runtime.contextValues.delete(context.id);
        } else {
            runtime.contextValues.set(context.id, previousValue);
        }
        return;
    }

    if (isFunctionVNode(newVNode)) {
        const componentId = getComponentId(newVNode, parentId, index);
        let oldChild = oldVNode;

        if (isFunctionVNode(oldVNode)) {
            const oldComponentId = getComponentId(oldVNode, parentId, index);
            oldChild = runtime.contextMap.get(oldComponentId)?.renderedVNode;
            if (oldComponentId !== componentId || oldVNode.__type !== newVNode.__type) {
                cleanupSubtree(oldComponentId);
            }
        } else if (isContextProviderVNode(oldVNode)) {
            oldChild = getProviderChild(oldVNode);
            cleanupVNode(oldChild, parentId, index);
        }

        const newChild = renderComponent(newVNode, parent, index, parentId);
        patch(parent, newChild, oldChild, index, componentId);
        return;
    }

    if (isFunctionVNode(oldVNode)) {
        const oldComponentId = getComponentId(oldVNode, parentId, index);
        oldVNode = runtime.contextMap.get(oldComponentId)?.renderedVNode;
        cleanupSubtree(oldComponentId);
    }

    if (isContextProviderVNode(oldVNode)) {
        oldVNode = getProviderChild(oldVNode);
        cleanupVNode(oldVNode, parentId, index);
    }

    if (isPrimitiveVNode(newVNode)) {
        const newText = String(newVNode);

        if (!existing || existing.nodeType !== 3 || !isPrimitiveVNode(oldVNode)) {
            cleanupVNode(oldVNode, parentId, index);
            const textNode = document.createTextNode(newText);
            if (existing) {
                parent.replaceChild(textNode, existing);
            } else {
                parent.appendChild(textNode);
            }
        } else if (existing.textContent !== newText) {
            existing.textContent = newText;
        }

        return;
    }

    if (!isElementVNode(newVNode)) {
        fail("S005", `Invalid vnode in patch(): ${JSON.stringify(newVNode)}`, { context: "renderer.patch", parentId, index });
    }

    const shouldReplace = !existing || !isElementVNode(oldVNode) || oldVNode.__type !== newVNode.__type;

    if (shouldReplace) {
        cleanupVNode(oldVNode, parentId, index);
        const el = createElement(newVNode, parentId, index, parent);
        if (existing) {
            parent.replaceChild(el, existing);
        } else {
            parent.appendChild(el);
        }
        return;
    }

    updateProps(existing, newVNode.props || {}, oldVNode.props || {});

    const currentId = getComponentId(newVNode, parentId, index);
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];

    const sharedLength = Math.min(newChildren.length, oldChildren.length);
    for (let i = 0; i < sharedLength; i++) {
        patch(existing, newChildren[i], oldChildren[i], i, currentId);
    }

    for (let i = sharedLength; i < newChildren.length; i++) {
        patch(existing, newChildren[i], undefined, i, currentId);
    }

    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        patch(existing, undefined, oldChildren[i], i, currentId);
    }
}

export function unmountContainer(container) {
    const ctx = container.__SynactJSCtx;
    if (!ctx) {
        return;
    }

    try {
        patch(container, null, ctx.vnode, 0, generateContainerId(container));
    } catch (error) {
        report("S009", error, { context: "renderer.unmount" });
    }
    cleanupEffects(ctx);
    delete container.__SynactJSCtx;
    runtime.mountedSignatures.delete(container);
    runtime.mountedContainers.delete(container);
}

export function renderApp(componentFn, container) {
    if (!container) {
        throw new Error("[SynactJS] renderApp requires a container element.");
    }

    if (!container.__SynactJSCtx) {
        container.__SynactJSCtx = {
            hooks: [],
            hookIndex: 0,
            effects: [],
            vnode: null,
            render: null,
            renderScheduled: false,
            effectsScheduled: false,
            componentFn
        };
    }

    const ctx = container.__SynactJSCtx;
    ctx.componentFn = componentFn;
    runtime.mountedContainers.add(container);

    ctx.render = () => {
        const previousComponent = runtime.currentComponent;

        ctx.hookIndex = 0;
        ctx.effects = [];
        runtime.currentComponent = ctx;

        let newVNode;
        try {
            newVNode = ctx.componentFn();
            patch(container, newVNode, ctx.vnode, 0, generateContainerId(container));
        } catch (error) {
            const runtimeError = report("S009", error, { context: "renderer.renderApp" });
            newVNode = createErrorVNode(runtimeError, `[SynactJS:${runtimeError.code}] Runtime Error`);
            patch(container, newVNode, ctx.vnode, 0, generateContainerId(container));
        }

        ctx.vnode = newVNode;
        runtime.currentComponent = previousComponent;

        scheduleEffects(ctx);
    };

    ctx.render();
    return () => unmountContainer(container);
}
