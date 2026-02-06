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
    CONTEXT_UNSET: Symbol("context_unset"),
    config: {
      errorMode: "console",
      logErrors: true,
      onError: null
    }
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

  // src/errors.js
  var ERROR_CODES = {
    S001: "Invalid mount target. Provide a DOM node or selector string.",
    S002: "register() expects a component function.",
    S003: "register() requires a named function component.",
    S004: "Invalid hook usage. Hooks can only run while a component is rendering.",
    S005: "Invalid vnode encountered during rendering.",
    S006: "Unable to parse data-prop JSON.",
    S007: "Component render failed.",
    S008: "Effect execution failed.",
    S009: "DOM patch operation failed.",
    S010: "Router setup failed.",
    S011: "Library dependency missing. Load synact.js first.",
    S012: "Invalid runtime configuration.",
    S013: "Required browser API is not available in this environment.",
    S014: "Network request failed.",
    S015: "WebSocket operation failed.",
    S016: "Invalid helper usage."
  };
  function resolveMessage(code, message) {
    if (message) return message;
    return ERROR_CODES[code] || "Unexpected SynactJS runtime error.";
  }
  function createSynactError(code, message, details = {}, cause) {
    const error = new Error(`[SynactJS:${code}] ${resolveMessage(code, message)}`);
    error.name = "SynactError";
    error.code = code;
    error.details = details;
    if (cause) {
      error.cause = cause;
    }
    return error;
  }
  function emitError(error, meta = {}) {
    const payload = {
      code: error.code,
      message: error.message,
      details: error.details || {},
      fatal: Boolean(meta.fatal),
      context: meta.context || "runtime"
    };
    if (typeof runtime.config.onError === "function") {
      try {
        runtime.config.onError(error, payload);
      } catch (handlerError) {
        console.error("[SynactJS] onError handler failed:", handlerError);
      }
    }
    if (runtime.config.logErrors !== false) {
      console.error(error.message, payload, error.cause || "");
    }
  }
  function normalizeError(code, errorOrMessage, details = {}) {
    if (errorOrMessage instanceof Error) {
      if (errorOrMessage.name === "SynactError" && errorOrMessage.code) {
        return errorOrMessage;
      }
      return createSynactError(code, errorOrMessage.message, details, errorOrMessage);
    }
    return createSynactError(code, errorOrMessage, details);
  }
  function fail(code, message, details = {}, cause) {
    const error = createSynactError(code, message, details, cause);
    emitError(error, { fatal: true, context: details.context });
    throw error;
  }
  function report(code, messageOrError, details = {}, options = {}) {
    const error = normalizeError(code, messageOrError, details);
    emitError(error, { fatal: Boolean(options.fatal), context: details.context });
    if (options.fatal || runtime.config.errorMode === "throw") {
      throw error;
    }
    return error;
  }
  function configureRuntime(config = {}) {
    if (config.errorMode && !["console", "throw"].includes(config.errorMode)) {
      fail("S012", 'Invalid errorMode. Use "console" or "throw".', { context: "configure" });
    }
    runtime.config = {
      ...runtime.config,
      ...config
    };
    return { ...runtime.config };
  }
  function getRuntimeConfig() {
    return { ...runtime.config };
  }

  // src/hooks.js
  function assertHookContext(hookName) {
    if (!runtime.currentComponent) {
      fail("S004", `${hookName} can only be used while rendering a component.`, { hook: hookName, context: "hooks" });
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
  function getComponentDisplayName(vnode) {
    if (typeof (vnode == null ? void 0 : vnode.__type) === "function") {
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
        const prevComponent2 = runtime.currentComponent;
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
  function createElement(vnode, parentId = "", index = 0, parent = null) {
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

  // src/mount.js
  function resolveContainer(target) {
    if (typeof target === "string") {
      const normalized = target.startsWith("#") ? target.slice(1) : target;
      const byId = document.getElementById(normalized);
      if (byId) return byId;
      const bySelector = document.querySelector(target);
      if (bySelector) return bySelector;
      fail("S001", `Unable to find container for selector "${target}".`, { selector: target, context: "mount" });
    }
    if (target && typeof target === "object" && target.nodeType === 1) {
      return target;
    }
    fail("S001", "Expected a DOM element or selector string for container.", { targetType: typeof target, context: "mount" });
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
          report("S006", error, { component: name, rawProps, context: "mount" });
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
        try {
          setRoute(getPath());
        } catch (error) {
          report("S010", error, { context: "router.popstate", urlPrefix });
        }
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
        try {
          history.pushState({}, "", urlPrefix + nextPath);
          setRoute(nextPath);
        } catch (error) {
          report("S010", error, { context: "router.click", nextPath, urlPrefix });
        }
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
      try {
        history.pushState({}, "", urlPrefix + nextPath);
        setRoute(nextPath);
      } catch (error) {
        report("S010", error, { context: "router.push", nextPath, urlPrefix });
      }
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

  // src/browser.js
  var EMPTY_OBJECT = Object.freeze({});
  var EMPTY_ARRAY = Object.freeze([]);
  var JSON_SERIALIZE = (value) => JSON.stringify(value);
  var JSON_DESERIALIZE = (value) => JSON.parse(value);
  function resolveValue(nextValue, previousValue) {
    return typeof nextValue === "function" ? nextValue(previousValue) : nextValue;
  }
  function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }
  function ensureArray(value, context) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
      fail("S016", `${context} must be an array.`, { context });
    }
    return value;
  }
  function resolveRequestUrl(baseUrl, path) {
    if (!baseUrl) {
      return String(path);
    }
    try {
      return new URL(String(path), baseUrl).toString();
    } catch (_) {
      const normalizedBase = String(baseUrl).replace(/\/+$/, "");
      const normalizedPath = String(path).replace(/^\/+/, "");
      return `${normalizedBase}/${normalizedPath}`;
    }
  }
  function normalizeHeaders(headers = {}) {
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }
    return { ...headers };
  }
  function isBodySerializable(value) {
    if (value == null) return false;
    if (typeof FormData !== "undefined" && value instanceof FormData) return false;
    if (typeof Blob !== "undefined" && value instanceof Blob) return false;
    if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) return false;
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return false;
    return isPlainObject(value) || Array.isArray(value);
  }
  async function parseResponse(response, parseMode = "json") {
    if (typeof parseMode === "function") {
      return parseMode(response);
    }
    if (parseMode === "raw" || parseMode === false) {
      return response;
    }
    if (parseMode === "text") {
      return response.text();
    }
    if (parseMode === "blob") {
      return response.blob();
    }
    if (parseMode === "arrayBuffer") {
      return response.arrayBuffer();
    }
    if (parseMode === "formData") {
      return response.formData();
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  }
  function createHttpClient(config = {}) {
    const {
      baseUrl = "",
      init: defaultInit = {},
      headers: defaultHeaders = {},
      beforeRequest,
      afterResponse,
      fetchImpl = typeof fetch === "function" ? fetch.bind(globalThis) : null
    } = config;
    if (typeof fetchImpl !== "function") {
      fail("S013", "fetch API is not available in this environment.", { context: "http.createClient" });
    }
    async function request(path, init = {}) {
      if (path == null) {
        fail("S016", "request() requires a URL/path value.", { context: "http.request" });
      }
      const url = resolveRequestUrl(baseUrl, path);
      const mergedHeaders = {
        ...normalizeHeaders(defaultHeaders),
        ...normalizeHeaders(defaultInit.headers),
        ...normalizeHeaders(init.headers)
      };
      const requestInit = {
        ...defaultInit,
        ...init,
        headers: mergedHeaders
      };
      if (isBodySerializable(requestInit.body) && !mergedHeaders["Content-Type"] && !mergedHeaders["content-type"]) {
        requestInit.body = JSON.stringify(requestInit.body);
        requestInit.headers = {
          ...mergedHeaders,
          "Content-Type": "application/json"
        };
      }
      const finalInit = typeof beforeRequest === "function" ? await beforeRequest({ ...requestInit }, url) || requestInit : requestInit;
      let response;
      try {
        response = await fetchImpl(url, finalInit);
      } catch (error) {
        report("S014", error, { context: "http.request", url, method: finalInit.method || "GET" });
        throw error;
      }
      if (typeof afterResponse === "function") {
        await afterResponse(response, url, finalInit);
      }
      return response;
    }
    async function requestAndParse(path, init = {}, parseMode = "json", { allowErrorStatus = false } = {}) {
      const response = await request(path, init);
      const data = await parseResponse(response, parseMode);
      if (!response.ok && !allowErrorStatus) {
        const statusError = createSynactError(
          "S014",
          `Request failed with status ${response.status} ${response.statusText}`.trim(),
          {
            context: "http.response",
            status: response.status,
            statusText: response.statusText || "",
            path: String(path)
          }
        );
        report("S014", statusError, statusError.details);
        throw statusError;
      }
      return { data, response };
    }
    return {
      request,
      parseResponse,
      async json(path, init = {}, options = {}) {
        const { data } = await requestAndParse(path, init, "json", options);
        return data;
      },
      async text(path, init = {}, options = {}) {
        const { data } = await requestAndParse(path, init, "text", options);
        return data;
      },
      async get(path, init = {}, options = {}) {
        const { data } = await requestAndParse(path, { ...init, method: "GET" }, "json", options);
        return data;
      },
      async post(path, body, init = {}, options = {}) {
        const requestInit = { ...init, method: "POST", body: body != null ? body : init.body };
        const { data } = await requestAndParse(path, requestInit, "json", options);
        return data;
      },
      async put(path, body, init = {}, options = {}) {
        const requestInit = { ...init, method: "PUT", body: body != null ? body : init.body };
        const { data } = await requestAndParse(path, requestInit, "json", options);
        return data;
      },
      async patch(path, body, init = {}, options = {}) {
        const requestInit = { ...init, method: "PATCH", body: body != null ? body : init.body };
        const { data } = await requestAndParse(path, requestInit, "json", options);
        return data;
      },
      async del(path, init = {}, options = {}) {
        const { data } = await requestAndParse(path, { ...init, method: "DELETE" }, "json", options);
        return data;
      }
    };
  }
  function resolveFetchUrl(input) {
    return typeof input === "function" ? input() : input;
  }
  function useFetch(input, options = {}) {
    const {
      init = EMPTY_OBJECT,
      immediate = true,
      deps = EMPTY_ARRAY,
      parse = "json",
      initialData = null,
      keepPreviousData = true,
      onSuccess,
      onError,
      client
    } = options;
    const extraDeps = ensureArray(deps, "useFetch.deps");
    const requestClient = useMemo(() => client || createHttpClient(), [client]);
    const control = useMemo(() => ({ requestId: 0, controller: null }), []);
    const [state, setState] = useState({
      data: initialData,
      error: null,
      loading: false,
      status: null
    });
    const abort = useCallback(() => {
      if (control.controller && typeof control.controller.abort === "function") {
        control.controller.abort();
      }
      control.controller = null;
    }, [control]);
    const execute = useCallback(async (override = {}) => {
      var _a;
      const requestId = control.requestId + 1;
      control.requestId = requestId;
      abort();
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      control.controller = controller;
      const resolvedUrl = resolveFetchUrl((_a = override.input) != null ? _a : input);
      if (resolvedUrl == null || resolvedUrl === "") {
        fail("S016", "useFetch requires a URL or input value.", { context: "useFetch.execute" });
      }
      const finalInit = {
        ...init,
        ...override.init
      };
      if (controller && !finalInit.signal) {
        finalInit.signal = controller.signal;
      }
      const parseMode = override.parse || parse;
      setState((previousState) => ({
        ...previousState,
        loading: true,
        error: null,
        data: keepPreviousData ? previousState.data : initialData
      }));
      try {
        const response = await requestClient.request(resolvedUrl, finalInit);
        const data = await parseResponse(response, parseMode);
        if (!response.ok) {
          const statusError = createSynactError(
            "S014",
            `Request failed with status ${response.status} ${response.statusText}`.trim(),
            {
              context: "useFetch.response",
              status: response.status,
              statusText: response.statusText || "",
              input: String(resolvedUrl)
            }
          );
          report("S014", statusError, statusError.details);
          throw statusError;
        }
        if (requestId !== control.requestId) {
          return null;
        }
        setState({
          data,
          error: null,
          loading: false,
          status: response.status
        });
        if (typeof onSuccess === "function") {
          onSuccess(data, response);
        }
        return data;
      } catch (error) {
        if ((error == null ? void 0 : error.name) === "AbortError") {
          return null;
        }
        const normalizedError = (error == null ? void 0 : error.code) ? error : report("S014", error, {
          context: "useFetch.execute",
          input: String(resolvedUrl)
        });
        if (requestId !== control.requestId) {
          return null;
        }
        setState((previousState) => ({
          ...previousState,
          loading: false,
          error: normalizedError
        }));
        if (typeof onError === "function") {
          onError(normalizedError);
        }
        throw normalizedError;
      } finally {
        if (control.controller === controller) {
          control.controller = null;
        }
      }
    }, [control, abort, input, init, parse, keepPreviousData, initialData, onSuccess, onError, requestClient]);
    useEffect(() => {
      if (!immediate) {
        return () => abort();
      }
      execute().catch(() => {
      });
      return () => abort();
    }, [execute, immediate, abort, ...extraDeps]);
    return {
      ...state,
      execute,
      refresh: execute,
      abort
    };
  }
  function resolveEventTarget(target) {
    if (typeof target === "function") {
      return target();
    }
    if (target) {
      return target;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    return null;
  }
  function useEventListener(target, eventName, handler, options) {
    useEffect(() => {
      if (!eventName || typeof handler !== "function") {
        return void 0;
      }
      const eventTarget = resolveEventTarget(target);
      if (!eventTarget || typeof eventTarget.addEventListener !== "function") {
        return void 0;
      }
      const listener = (event) => handler(event);
      eventTarget.addEventListener(eventName, listener, options);
      return () => {
        eventTarget.removeEventListener(eventName, listener, options);
      };
    }, [target, eventName, handler, options]);
  }
  function useTimeout(callback, delay, deps = EMPTY_ARRAY) {
    const extraDeps = ensureArray(deps, "useTimeout.deps");
    useEffect(() => {
      if (delay == null || delay === false) {
        return void 0;
      }
      const timeoutId = setTimeout(() => {
        callback();
      }, Number(delay));
      return () => clearTimeout(timeoutId);
    }, [callback, delay, ...extraDeps]);
  }
  function useInterval(callback, delay, deps = EMPTY_ARRAY) {
    const extraDeps = ensureArray(deps, "useInterval.deps");
    useEffect(() => {
      if (delay == null || delay === false) {
        return void 0;
      }
      const intervalId = setInterval(() => {
        callback();
      }, Number(delay));
      return () => clearInterval(intervalId);
    }, [callback, delay, ...extraDeps]);
  }
  function usePolling(callback, intervalMs, options = {}) {
    const {
      enabled = true,
      immediate = true,
      deps = EMPTY_ARRAY
    } = options;
    const extraDeps = ensureArray(deps, "usePolling.deps");
    useEffect(() => {
      if (enabled && immediate) {
        callback();
      }
    }, [callback, enabled, immediate, ...extraDeps]);
    useInterval(() => {
      if (enabled) {
        callback();
      }
    }, enabled ? intervalMs : null, [enabled, ...extraDeps]);
  }
  function useDebouncedValue(value, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useTimeout(() => setDebounced(value), delay, [value, delay]);
    return debounced;
  }
  function getStorage(storageType) {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return storageType === "session" ? window.sessionStorage : window.localStorage;
    } catch (_) {
      return null;
    }
  }
  function useStorageState(key, initialValue, options = {}) {
    const {
      storage = "local",
      sync = true,
      serialize = JSON_SERIALIZE,
      deserialize = JSON_DESERIALIZE
    } = options;
    if (!key || typeof key !== "string") {
      fail("S016", "useStorageState requires a storage key string.", { context: "useStorageState" });
    }
    const storageRef = useMemo(() => getStorage(storage), [storage]);
    const readInitial = useCallback(() => {
      const fallback = typeof initialValue === "function" ? initialValue() : initialValue;
      if (!storageRef) {
        return fallback;
      }
      const rawValue = storageRef.getItem(key);
      if (rawValue == null) {
        return fallback;
      }
      try {
        return deserialize(rawValue);
      } catch (error) {
        report("S016", error, { context: "storage.deserialize", key, storage });
        return fallback;
      }
    }, [storageRef, key, initialValue, deserialize, storage]);
    const [value, setValue] = useState(readInitial);
    const updateValue = useCallback((nextValue) => {
      setValue((previousValue) => {
        const resolvedValue = resolveValue(nextValue, previousValue);
        if (!storageRef) {
          return resolvedValue;
        }
        try {
          if (resolvedValue === void 0) {
            storageRef.removeItem(key);
          } else {
            storageRef.setItem(key, serialize(resolvedValue));
          }
        } catch (error) {
          report("S013", error, { context: "storage.write", key, storage });
        }
        return resolvedValue;
      });
    }, [storageRef, key, serialize, storage]);
    const remove = useCallback(() => {
      if (storageRef) {
        try {
          storageRef.removeItem(key);
        } catch (error) {
          report("S013", error, { context: "storage.remove", key, storage });
        }
      }
      const fallback = typeof initialValue === "function" ? initialValue() : initialValue;
      setValue(fallback);
    }, [storageRef, key, initialValue, storage]);
    useEffect(() => {
      if (!sync || !storageRef || typeof window === "undefined") {
        return void 0;
      }
      const onStorage = (event) => {
        if (event.storageArea !== storageRef || event.key !== key) {
          return;
        }
        if (event.newValue == null) {
          const fallback = typeof initialValue === "function" ? initialValue() : initialValue;
          setValue(fallback);
          return;
        }
        try {
          setValue(deserialize(event.newValue));
        } catch (error) {
          report("S016", error, { context: "storage.sync", key, storage });
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }, [sync, storageRef, key, deserialize, initialValue, storage]);
    return [value, updateValue, remove];
  }
  function useLocalStorage(key, initialValue, options = {}) {
    return useStorageState(key, initialValue, { ...options, storage: "local" });
  }
  function useSessionStorage(key, initialValue, options = {}) {
    return useStorageState(key, initialValue, { ...options, storage: "session" });
  }
  function useOnlineStatus() {
    const [online, setOnline] = useState(() => {
      if (typeof navigator === "undefined") {
        return true;
      }
      return navigator.onLine !== false;
    });
    useEventListener(() => typeof window !== "undefined" ? window : null, "online", () => setOnline(true));
    useEventListener(() => typeof window !== "undefined" ? window : null, "offline", () => setOnline(false));
    return online;
  }
  function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return false;
      }
      return window.matchMedia(query).matches;
    });
    useEffect(() => {
      if (!query || typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return void 0;
      }
      const mediaQueryList = window.matchMedia(query);
      const listener = (event) => setMatches(Boolean(event.matches));
      setMatches(mediaQueryList.matches);
      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", listener);
        return () => mediaQueryList.removeEventListener("change", listener);
      }
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }, [query]);
    return matches;
  }
  function createWebSocket(url, options = {}) {
    if (!url || typeof url !== "string") {
      fail("S016", "createWebSocket requires a URL string.", { context: "websocket.create" });
    }
    if (typeof WebSocket === "undefined") {
      fail("S013", "WebSocket API is not available in this environment.", { context: "websocket.create" });
    }
    const {
      protocols,
      reconnect = true,
      reconnectInterval = 1500,
      maxRetries = Infinity,
      parseJSON = true,
      serializeJSON = true
    } = options;
    let socket = null;
    let status = "idle";
    let retryCount = 0;
    let reconnectTimer = null;
    let manuallyClosed = false;
    const messageSubscribers = /* @__PURE__ */ new Set();
    const statusSubscribers = /* @__PURE__ */ new Set();
    function notifyStatus(nextStatus, event) {
      status = nextStatus;
      for (const subscriber of statusSubscribers) {
        try {
          subscriber(nextStatus, event);
        } catch (error) {
          report("S016", error, { context: "websocket.statusSubscriber", url });
        }
      }
    }
    function notifyMessage(payload, event) {
      for (const subscriber of messageSubscribers) {
        try {
          subscriber(payload, event);
        } catch (error) {
          report("S016", error, { context: "websocket.messageSubscriber", url });
        }
      }
    }
    function clearReconnectTimer() {
      if (reconnectTimer != null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }
    function connect() {
      manuallyClosed = false;
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        return socket;
      }
      clearReconnectTimer();
      notifyStatus("connecting");
      socket = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      socket.onopen = (event) => {
        retryCount = 0;
        notifyStatus("open", event);
      };
      socket.onmessage = (event) => {
        let payload = event.data;
        if (parseJSON && typeof payload === "string") {
          try {
            payload = JSON.parse(payload);
          } catch (_) {
          }
        }
        notifyMessage(payload, event);
      };
      socket.onerror = (event) => {
        notifyStatus("error", event);
        report("S015", "WebSocket emitted an error event.", { context: "websocket.onerror", url });
      };
      socket.onclose = (event) => {
        socket = null;
        notifyStatus("closed", event);
        if (!manuallyClosed && reconnect && retryCount < maxRetries) {
          retryCount += 1;
          reconnectTimer = setTimeout(() => connect(), Number(reconnectInterval));
        }
      };
      return socket;
    }
    function send(message) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        fail("S015", "Cannot send WebSocket message while socket is not open.", {
          context: "websocket.send",
          url
        });
      }
      const payload = serializeJSON && typeof message === "object" ? JSON.stringify(message) : message;
      socket.send(payload);
    }
    function close(code = 1e3, reason = "SynactJS closed connection") {
      manuallyClosed = true;
      clearReconnectTimer();
      if (socket) {
        socket.close(code, reason);
        socket = null;
      } else {
        notifyStatus("closed");
      }
    }
    function reconnectNow() {
      manuallyClosed = false;
      clearReconnectTimer();
      if (socket) {
        socket.close();
        socket = null;
      }
      connect();
    }
    function subscribe(handler) {
      if (typeof handler !== "function") {
        fail("S016", "websocket.subscribe requires a callback function.", { context: "websocket.subscribe", url });
      }
      messageSubscribers.add(handler);
      return () => {
        messageSubscribers.delete(handler);
      };
    }
    function onStatus(handler) {
      if (typeof handler !== "function") {
        fail("S016", "websocket.onStatus requires a callback function.", { context: "websocket.onStatus", url });
      }
      statusSubscribers.add(handler);
      return () => {
        statusSubscribers.delete(handler);
      };
    }
    return {
      connect,
      close,
      reconnect: reconnectNow,
      send,
      subscribe,
      onStatus,
      getStatus: () => status,
      getSocket: () => socket
    };
  }
  function useWebSocket(url, options = {}) {
    const {
      autoConnect = true,
      protocols,
      reconnect = true,
      reconnectInterval = 1500,
      maxRetries = Infinity,
      parseJSON = true,
      serializeJSON = true,
      deps = EMPTY_ARRAY,
      onMessage,
      onStatusChange
    } = options;
    const extraDeps = ensureArray(deps, "useWebSocket.deps");
    const [status, setStatus] = useState("idle");
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const websocket = useMemo(() => createWebSocket(url, {
      protocols,
      reconnect,
      reconnectInterval,
      maxRetries,
      parseJSON,
      serializeJSON
    }), [url, protocols, reconnect, reconnectInterval, maxRetries, parseJSON, serializeJSON, ...extraDeps]);
    useEffect(() => {
      const unsubscribeMessage = websocket.subscribe((message, event) => {
        setLastMessage(message);
        if (typeof onMessage === "function") {
          onMessage(message, event);
        }
      });
      const unsubscribeStatus = websocket.onStatus((nextStatus, event) => {
        setStatus(nextStatus);
        if (nextStatus !== "error") {
          setError(null);
        } else {
          setError(createSynactError("S015", "WebSocket entered error state.", {
            context: "useWebSocket.status",
            url
          }));
        }
        if (typeof onStatusChange === "function") {
          onStatusChange(nextStatus, event);
        }
      });
      setStatus(websocket.getStatus());
      if (autoConnect) {
        websocket.connect();
      }
      return () => {
        unsubscribeMessage();
        unsubscribeStatus();
        websocket.close(1e3, "SynactJS component cleanup");
      };
    }, [websocket, autoConnect, onMessage, onStatusChange, url]);
    const send = useCallback((message) => websocket.send(message), [websocket]);
    const connect = useCallback(() => websocket.connect(), [websocket]);
    const reconnectNow = useCallback(() => websocket.reconnect(), [websocket]);
    const close = useCallback((code, reason) => websocket.close(code, reason), [websocket]);
    return {
      status,
      lastMessage,
      error,
      send,
      connect,
      reconnect: reconnectNow,
      close,
      socket: websocket
    };
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Number(ms)));
  }
  var browserHelpers = {
    createHttpClient,
    parseResponse,
    useFetch,
    createWebSocket,
    useWebSocket,
    useStorageState,
    useLocalStorage,
    useSessionStorage,
    useEventListener,
    useOnlineStatus,
    useMediaQuery,
    useTimeout,
    useInterval,
    usePolling,
    useDebouncedValue,
    sleep
  };

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
    ...tagHelpers,
    ...browserHelpers
  };
  var core_default = SynactJSCore;

  // src/public-api.js
  var SynactJS = {
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
    configure(config = {}) {
      return configureRuntime(config);
    },
    getConfig() {
      return getRuntimeConfig();
    },
    helpers: browserHelpers,
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
