// Generated from src/index.js. Do not edit synact.js directly.
(() => {
  // src/state.js
  var runtime = {
    currentComponent: null,
    contextMap: /* @__PURE__ */ new Map(),
    contextValues: /* @__PURE__ */ new Map(),
    componentRegistry: /* @__PURE__ */ new Map(),
    mountedSignatures: /* @__PURE__ */ new WeakMap(),
    mountedContainers: /* @__PURE__ */ new Set(),
    globalContainerId: 0,
    containerIdMap: /* @__PURE__ */ new WeakMap(),
    CONTEXT_UNSET: Symbol("context_unset")
  };
  function generateContainerId(container) {
    if (!runtime.containerIdMap.has(container)) {
      runtime.containerIdMap.set(container, `/Mount${runtime.globalContainerId++}`);
    }
    return runtime.containerIdMap.get(container);
  }
  function cleanupHookCollection(hooks) {
    if (!Array.isArray(hooks)) return;
    for (const hook of hooks) {
      if (hook && typeof hook.cleanup === "function") {
        hook.cleanup();
      }
    }
  }

  // src/vnode.js
  function isPrimitiveVNode(vnode) {
    return typeof vnode === "string" || typeof vnode === "number";
  }
  function isIgnoredVNode(vnode) {
    return vnode == null || typeof vnode === "boolean";
  }
  function isContextProviderType(type) {
    return Boolean(type && type.__synactProvider === true && type.__context);
  }
  function isContextProviderVNode(vnode) {
    return Boolean(vnode && typeof vnode === "object" && isContextProviderType(vnode.__type));
  }
  function isFunctionVNode(vnode) {
    return Boolean(vnode && typeof vnode === "object" && typeof vnode.__type === "function" && !isContextProviderVNode(vnode));
  }
  function isElementVNode(vnode) {
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
  function h(type, props = {}, ...children) {
    var _a;
    const vnodeProps = props || {};
    const hasPropChildren = Object.prototype.hasOwnProperty.call(vnodeProps, "children");
    const inputChildren = children.length > 0 ? children : hasPropChildren ? [vnodeProps.children] : [];
    return {
      __type: type,
      props: vnodeProps,
      children: normalizeChildren(inputChildren),
      key: (_a = vnodeProps == null ? void 0 : vnodeProps.key) != null ? _a : null
    };
  }
  function getComponentId(vnode, parentId, index) {
    var _a;
    let name = "Node";
    if (typeof (vnode == null ? void 0 : vnode.__type) === "function") {
      name = vnode.__type.name || "Anon";
    } else if (typeof (vnode == null ? void 0 : vnode.__type) === "string") {
      name = vnode.__type;
    } else if (isPrimitiveVNode(vnode)) {
      name = "Text";
    }
    const key = vnode && typeof vnode === "object" ? (_a = vnode.key) != null ? _a : index : index;
    return `${parentId}/${name}:${key}`;
  }
  function getProviderChild(vnode) {
    var _a, _b, _c;
    const providedChildren = (_a = vnode == null ? void 0 : vnode.props) == null ? void 0 : _a.children;
    if (Array.isArray(providedChildren)) {
      return (_b = providedChildren[0]) != null ? _b : null;
    }
    if (providedChildren !== void 0) {
      return providedChildren;
    }
    const fallbackChildren = vnode == null ? void 0 : vnode.children;
    if (Array.isArray(fallbackChildren)) {
      return (_c = fallbackChildren[0]) != null ? _c : null;
    }
    return fallbackChildren != null ? fallbackChildren : null;
  }

  // src/props.js
  function normalizeStyleKey(key) {
    return key.includes("-") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }
  function setStyle(el, styleValue) {
    if (styleValue == null || styleValue === false) {
      el.removeAttribute("style");
      return;
    }
    if (typeof styleValue === "string") {
      el.style.cssText = styleValue;
      return;
    }
    if (typeof styleValue === "object") {
      el.style.cssText = "";
      for (const [styleKey, styleEntry] of Object.entries(styleValue)) {
        if (styleEntry == null || styleEntry === false) continue;
        el.style.setProperty(normalizeStyleKey(styleKey), String(styleEntry));
      }
    }
  }
  function setProp(el, key, value) {
    if (key === "children" || key === "key") {
      return;
    }
    if (key === "className") {
      if (value == null || value === false) {
        el.removeAttribute("class");
      } else {
        el.setAttribute("class", String(value));
      }
      return;
    }
    if (key === "style") {
      setStyle(el, value);
      return;
    }
    if (key === "value") {
      el.value = value != null ? value : "";
      return;
    }
    if (key === "checked") {
      el.checked = Boolean(value);
      return;
    }
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      el[`on${eventName}`] = typeof value === "function" ? value : null;
      return;
    }
    if (value == null || value === false) {
      el.removeAttribute(key);
      return;
    }
    if (value === true) {
      el.setAttribute(key, "");
      return;
    }
    if (key in el && typeof value !== "object") {
      try {
        el[key] = value;
        return;
      } catch (error) {
      }
    }
    el.setAttribute(key, String(value));
  }
  function setProps(el, props) {
    for (const [key, value] of Object.entries(props || {})) {
      setProp(el, key, value);
    }
  }
  function updateProps(el, newProps, oldProps) {
    if (!el) return;
    const nextProps = newProps || {};
    const prevProps = oldProps || {};
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(nextProps), ...Object.keys(prevProps)]);
    for (const key of allKeys) {
      const nextValue = nextProps[key];
      const prevValue = prevProps[key];
      if (Object.is(nextValue, prevValue)) {
        continue;
      }
      setProp(el, key, nextValue);
    }
  }

  // src/hooks.js
  function assertHookContext(hookName) {
    if (!runtime.currentComponent) {
      throw new Error(`[SynactJS] ${hookName} can only be used while rendering a component.`);
    }
  }
  function enqueueRender(ctx) {
    if (ctx.renderScheduled) return;
    ctx.renderScheduled = true;
    queueMicrotask(() => {
      ctx.renderScheduled = false;
      if (ctx.render) {
        ctx.render();
      }
    });
  }
  function useState(initialValue) {
    assertHookContext("useState");
    const ctx = runtime.currentComponent;
    const hookIndex = ctx.hookIndex++;
    if (!ctx.hooks[hookIndex]) {
      const initialState = typeof initialValue === "function" ? initialValue() : initialValue;
      ctx.hooks[hookIndex] = {
        value: initialState,
        set: (nextState) => {
          const previousValue = ctx.hooks[hookIndex].value;
          const resolvedNextState = typeof nextState === "function" ? nextState(previousValue) : nextState;
          if (Object.is(previousValue, resolvedNextState)) {
            return;
          }
          ctx.hooks[hookIndex].value = resolvedNextState;
          enqueueRender(ctx);
        }
      };
    }
    return [ctx.hooks[hookIndex].value, ctx.hooks[hookIndex].set];
  }
  function useEffect(effectFn, deps) {
    assertHookContext("useEffect");
    const ctx = runtime.currentComponent;
    const hookIndex = ctx.hookIndex++;
    const prevHook = ctx.hooks[hookIndex];
    const depsChanged = !prevHook || !deps || !prevHook.deps || deps.length !== prevHook.deps.length || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));
    if (!depsChanged) {
      ctx.hooks[hookIndex] = prevHook;
      return;
    }
    ctx.hooks[hookIndex] = {
      deps,
      cleanup: prevHook == null ? void 0 : prevHook.cleanup
    };
    ctx.effects.push(() => {
      if (typeof (prevHook == null ? void 0 : prevHook.cleanup) === "function") {
        prevHook.cleanup();
      }
      const cleanup = effectFn();
      ctx.hooks[hookIndex].cleanup = typeof cleanup === "function" ? cleanup : void 0;
    });
  }
  function useMemo(factory, deps) {
    assertHookContext("useMemo");
    const ctx = runtime.currentComponent;
    const hookIndex = ctx.hookIndex++;
    const prevHook = ctx.hooks[hookIndex];
    const depsChanged = !prevHook || !deps || !prevHook.deps || deps.length !== prevHook.deps.length || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));
    if (depsChanged) {
      const value = factory();
      ctx.hooks[hookIndex] = { value, deps };
      return value;
    }
    return prevHook.value;
  }
  function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
  }
  function createContext(defaultValue) {
    const context = {
      id: Symbol("context"),
      defaultValue,
      Provider: null
    };
    function Provider(props = {}) {
      var _a;
      return (_a = props.children) != null ? _a : null;
    }
    Provider.__synactProvider = true;
    Provider.__context = context;
    context.Provider = Provider;
    return context;
  }
  function useContext(context) {
    if (runtime.contextValues.has(context.id)) {
      return runtime.contextValues.get(context.id);
    }
    return context.defaultValue;
  }

  // src/renderer.js
  function cleanupEffects(ctx) {
    if (!ctx || !Array.isArray(ctx.hooks)) {
      return;
    }
    for (const hook of ctx.hooks) {
      if (hook && typeof hook.cleanup === "function") {
        hook.cleanup();
        hook.cleanup = void 0;
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
    var _a;
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
        runtime.contextValues.set(context.id, (_a = currentVNode.props) == null ? void 0 : _a.value);
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
      throw new Error(`Invalid vnode: ${JSON.stringify(currentVNode)}`);
    }
  }
  function scheduleEffects(ctx) {
    if (!ctx.effects || ctx.effects.length === 0) {
      return;
    }
    const toRun = ctx.effects.slice();
    ctx.effects = [];
    for (const effectRunner of toRun) {
      effectRunner();
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
        const prevComponent2 = runtime.currentComponent;
        ctx.hookIndex = 0;
        ctx.effects = [];
        runtime.currentComponent = ctx;
        const outputVNode = ctx.vnode.__type(ctx.vnode.props || {});
        runtime.currentComponent = prevComponent2;
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
    const output = vnode.__type(vnode.props || {});
    runtime.currentComponent = prevComponent;
    ctx.renderedVNode = output;
    scheduleEffects(ctx);
    return output;
  }
  function createElement(vnode, parentId = "", index = 0, parent = null) {
    if (parent === null && isFunctionVNode(vnode)) {
      throw new Error("createElement should not be called with functional components.");
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
      throw new Error(`Invalid vnode: ${JSON.stringify(vnode)}`);
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
  function patch(parent, newVNode, oldVNode, index = 0, parentId = "") {
    var _a, _b, _c;
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
      runtime.contextValues.set(context.id, (_a = newVNode.props) == null ? void 0 : _a.value);
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
        oldChild = (_b = runtime.contextMap.get(oldComponentId)) == null ? void 0 : _b.renderedVNode;
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
      oldVNode = (_c = runtime.contextMap.get(oldComponentId)) == null ? void 0 : _c.renderedVNode;
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
      throw new Error(`Invalid vnode in patch(): ${JSON.stringify(newVNode)}`);
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
      patch(existing, newChildren[i], void 0, i, currentId);
    }
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      patch(existing, void 0, oldChildren[i], i, currentId);
    }
  }
  function unmountContainer(container) {
    const ctx = container.__SynactJSCtx;
    if (!ctx) {
      return;
    }
    patch(container, null, ctx.vnode, 0, generateContainerId(container));
    cleanupEffects(ctx);
    delete container.__SynactJSCtx;
    runtime.mountedSignatures.delete(container);
    runtime.mountedContainers.delete(container);
  }
  function renderApp(componentFn, container) {
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
      const newVNode = ctx.componentFn();
      patch(container, newVNode, ctx.vnode, 0, generateContainerId(container));
      ctx.vnode = newVNode;
      runtime.currentComponent = previousComponent;
      scheduleEffects(ctx);
    };
    ctx.render();
    return () => unmountContainer(container);
  }

  // src/mount.js
  function resolveContainer(target) {
    if (typeof target === "string") {
      const normalized = target.startsWith("#") ? target.slice(1) : target;
      const byId = document.getElementById(normalized);
      if (byId) return byId;
      const bySelector = document.querySelector(target);
      if (bySelector) return bySelector;
      throw new Error(`[SynactJS] Unable to find container for selector "${target}".`);
    }
    if (target && typeof target === "object" && target.nodeType === 1) {
      return target;
    }
    throw new Error("[SynactJS] Expected a DOM element or selector string for container.");
  }
  function mountComponents(root = document) {
    root.querySelectorAll("[data-component]").forEach((el) => {
      var _a;
      const name = (_a = el.getAttribute("data-component")) == null ? void 0 : _a.trim();
      if (!name) return;
      const globalWindow = typeof window !== "undefined" ? window : void 0;
      const component = runtime.componentRegistry.get(name) || (globalWindow == null ? void 0 : globalWindow[name]);
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

  // src/router.js
  function useRouter(urlPrefix = "") {
    const getPath = () => {
      const pathname = window.location.pathname;
      if (urlPrefix && pathname.startsWith(urlPrefix)) {
        return pathname.slice(urlPrefix.length) || "/";
      }
      return pathname;
    };
    const [route, setRoute] = useState(getPath);
    useEffect(() => {
      const onPopState = () => {
        setRoute(getPath());
      };
      const onClick = (event) => {
        const link = event.target.closest("a");
        if (!link || !link.href) return;
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target && link.target !== "_self") return;
        if (link.origin !== window.location.origin) return;
        let nextPath = link.pathname;
        if (urlPrefix && nextPath.startsWith(urlPrefix)) {
          nextPath = nextPath.slice(urlPrefix.length) || "/";
        }
        event.preventDefault();
        history.pushState({}, "", urlPrefix + nextPath);
        setRoute(nextPath);
      };
      window.addEventListener("popstate", onPopState);
      window.addEventListener("click", onClick);
      return () => {
        window.removeEventListener("popstate", onPopState);
        window.removeEventListener("click", onClick);
      };
    }, [urlPrefix]);
    const push = (path) => {
      let nextPath = path || "/";
      if (!nextPath.startsWith("/")) {
        nextPath = `/${nextPath}`;
      }
      if (urlPrefix && nextPath.startsWith(urlPrefix)) {
        nextPath = nextPath.slice(urlPrefix.length) || "/";
      }
      if (nextPath === route) return;
      history.pushState({}, "", urlPrefix + nextPath);
      setRoute(nextPath);
    };
    return [route, push];
  }
  function Fragment(props = {}) {
    var _a;
    return (_a = props.children) != null ? _a : null;
  }
  function RouteView({ routes, prefix = "" }) {
    const [route] = useRouter(prefix);
    const match = (routes == null ? void 0 : routes[route]) || (routes == null ? void 0 : routes["*"]);
    return h("div", {}, typeof match === "function" ? match() : null);
  }

  // src/tags.js
  var tag = (name) => (props, ...children) => h(name, props || {}, ...children);
  var tagNames = [
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "p",
    "button",
    "strong",
    "span",
    "ul",
    "li",
    "input",
    "form",
    "label",
    "a",
    "nav",
    "hr",
    "i",
    "section",
    "pre",
    "code",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "footer",
    "header",
    "main",
    "textarea",
    "select",
    "option",
    "svg",
    "br",
    "small",
    "ol",
    "dl",
    "dt",
    "dd",
    "fieldset",
    "article"
  ];
  var tagHelpers = Object.fromEntries(tagNames.map((tagName) => [tagName, tag(tagName)]));

  // src/core.js
  var SynactJSCore = {
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
    contextMap: runtime.contextMap,
    mountComponents,
    useRouter,
    createElement,
    setProps,
    updateProps,
    patch,
    resolveContainer,
    componentRegistry: runtime.componentRegistry,
    mountedContainers: runtime.mountedContainers,
    unmountContainer,
    ...tagHelpers
  };
  var core_default = SynactJSCore;

  // src/public-api.js
  var SynactJS = {
    register(component) {
      if (typeof component !== "function") {
        throw new Error("[SynactJS] register() expects a component function.");
      }
      const componentName = component.name;
      if (!componentName) {
        throw new Error("[SynactJS] register() requires a named function component so data-component can resolve it.");
      }
      runtime.componentRegistry.set(componentName, component);
      this.components = Array.from(runtime.componentRegistry.values());
      core_default.mountComponents();
      return component;
    },
    render(componentOrVNode, containerOrSelector, props = {}) {
      const container = core_default.resolveContainer(containerOrSelector);
      if (typeof componentOrVNode === "function") {
        return core_default.renderApp(() => core_default.h(componentOrVNode, props), container);
      }
      return core_default.renderApp(() => componentOrVNode, container);
    },
    mount(componentOrVNode, containerOrSelector, props = {}) {
      return this.render(componentOrVNode, containerOrSelector, props);
    },
    unmount(containerOrSelector) {
      const container = core_default.resolveContainer(containerOrSelector);
      core_default.unmountContainer(container);
    },
    components: []
  };
  function attachBrowserGlobals() {
    if (typeof window === "undefined") {
      return;
    }
    Object.assign(window, core_default, { SynactJS });
    window.SynactJS = SynactJS;
    document.addEventListener("DOMContentLoaded", () => {
      core_default.mountComponents();
    });
    window.addEventListener("beforeunload", () => {
      var _a;
      for (const container of runtime.mountedContainers) {
        cleanupHookCollection((_a = container.__SynactJSCtx) == null ? void 0 : _a.hooks);
      }
      for (const ctx of runtime.contextMap.values()) {
        cleanupHookCollection(ctx == null ? void 0 : ctx.hooks);
      }
      runtime.contextMap.clear();
      runtime.mountedContainers.clear();
    });
  }
  function attachCommonJSExports() {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = {
        ...core_default,
        SynactJS
      };
    }
  }

  // src/index.js
  attachBrowserGlobals();
  attachCommonJSExports();
})();
