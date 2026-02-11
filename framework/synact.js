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
  function hasExplicitVNodeKey(vnode) {
    return Boolean(vnode && typeof vnode === "object" && vnode.key != null);
  }
  function shouldUseKeyedChildrenReconciliation(newChildren, oldChildren) {
    return newChildren.some(hasExplicitVNodeKey) || oldChildren.some(hasExplicitVNodeKey);
  }
  function getChildReconcileToken(vnode, index) {
    if (hasExplicitVNodeKey(vnode)) {
      return `k:${String(vnode.key)}`;
    }
    return `u:${index}`;
  }
  function canReuseChildVNode(newVNode, oldVNode) {
    if (isIgnoredVNode(newVNode) || isIgnoredVNode(oldVNode)) {
      return isIgnoredVNode(newVNode) && isIgnoredVNode(oldVNode);
    }
    if (isPrimitiveVNode(newVNode) || isPrimitiveVNode(oldVNode)) {
      return isPrimitiveVNode(newVNode) && isPrimitiveVNode(oldVNode);
    }
    if (isFunctionVNode(newVNode) || isFunctionVNode(oldVNode)) {
      return isFunctionVNode(newVNode) && isFunctionVNode(oldVNode) && newVNode.__type === oldVNode.__type;
    }
    if (isContextProviderVNode(newVNode) || isContextProviderVNode(oldVNode)) {
      return isContextProviderVNode(newVNode) && isContextProviderVNode(oldVNode) && newVNode.__type === oldVNode.__type;
    }
    if (isElementVNode(newVNode) || isElementVNode(oldVNode)) {
      return isElementVNode(newVNode) && isElementVNode(oldVNode) && newVNode.__type === oldVNode.__type;
    }
    return false;
  }
  function reconcileKeyedChildren(parent, newChildren, oldChildren, parentId) {
    const oldTokenMap = /* @__PURE__ */ new Map();
    const matchedOldIndexes = /* @__PURE__ */ new Set();
    const nextDomNodes = [];
    for (let i = 0; i < oldChildren.length; i++) {
      const token = getChildReconcileToken(oldChildren[i], i);
      if (!oldTokenMap.has(token)) {
        oldTokenMap.set(token, []);
      }
      oldTokenMap.get(token).push(i);
    }
    for (let i = 0; i < newChildren.length; i++) {
      const newChild = newChildren[i];
      const token = getChildReconcileToken(newChild, i);
      const candidates = oldTokenMap.get(token) || [];
      for (let j = 0; j < candidates.length; j++) {
        const oldIndex = candidates[j];
        if (matchedOldIndexes.has(oldIndex)) continue;
        if (!canReuseChildVNode(newChild, oldChildren[oldIndex])) continue;
        matchedOldIndexes.add(oldIndex);
        candidates.splice(j, 1);
        break;
      }
      if (isIgnoredVNode(newChild)) continue;
      nextDomNodes.push(createElement(newChild, parentId, i, parent));
    }
    for (let i = 0; i < oldChildren.length; i++) {
      if (!matchedOldIndexes.has(i)) {
        cleanupVNode(oldChildren[i], parentId, i);
      }
    }
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    for (const node of nextDomNodes) {
      parent.appendChild(node);
    }
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
    if (shouldUseKeyedChildrenReconciliation(newChildren, oldChildren)) {
      reconcileKeyedChildren(existing, newChildren, oldChildren, currentId);
      return;
    }
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
  function normalizePrefix(prefix = "") {
    return prefix ? prefix.replace(/\/+$/, "") : "";
  }
  function stripPrefixFromPathname(pathname, prefix) {
    if (!prefix || !pathname.startsWith(prefix)) {
      return pathname || "/";
    }
    return pathname.slice(prefix.length) || "/";
  }
  function toRoute(pathname, search, hash, prefix) {
    const safePathname = stripPrefixFromPathname(pathname || "/", prefix);
    return `${safePathname}${search || ""}${hash || ""}`;
  }
  function normalizeRouteInput(path) {
    let rawPath = path == null ? "/" : String(path);
    if (!rawPath) {
      rawPath = "/";
    }
    try {
      const parsed = new URL(rawPath, window.location.origin);
      return `${parsed.pathname || "/"}${parsed.search || ""}${parsed.hash || ""}`;
    } catch (_) {
      if (!rawPath.startsWith("/")) {
        rawPath = `/${rawPath}`;
      }
      return rawPath;
    }
  }
  function stripPrefixFromRoute(route, prefix) {
    if (!prefix) return route;
    try {
      const parsed = new URL(route, window.location.origin);
      return toRoute(parsed.pathname, parsed.search, parsed.hash, prefix);
    } catch (_) {
      return route;
    }
  }
  function toHistoryUrl(route, prefix) {
    if (!prefix) return route;
    return `${prefix}${route}`;
  }
  function useRouter(urlPrefix = "") {
    const prefix = normalizePrefix(urlPrefix);
    const getPath = () => {
      return toRoute(window.location.pathname, window.location.search, window.location.hash, prefix);
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
        event.preventDefault();
        try {
          const linkUrl = new URL(link.href, window.location.origin);
          const nextPath = toRoute(linkUrl.pathname, linkUrl.search, linkUrl.hash, prefix);
          history.pushState({}, "", toHistoryUrl(nextPath, prefix));
          setRoute(nextPath);
        } catch (error) {
          report("S010", error, { context: "router.click", href: link.href, urlPrefix: prefix });
        }
      };
      window.addEventListener("popstate", onPopState);
      window.addEventListener("click", onClick);
      return () => {
        window.removeEventListener("popstate", onPopState);
        window.removeEventListener("click", onClick);
      };
    }, [prefix]);
    const push = (path) => {
      let nextPath = normalizeRouteInput(path);
      nextPath = stripPrefixFromRoute(nextPath, prefix);
      if (nextPath === route) return;
      try {
        history.pushState({}, "", toHistoryUrl(nextPath, prefix));
        setRoute(nextPath);
      } catch (error) {
        report("S010", error, { context: "router.push", nextPath, urlPrefix: prefix });
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
    const pathname = route.split(/[?#]/)[0] || "/";
    const match = (routes == null ? void 0 : routes[route]) || (routes == null ? void 0 : routes[pathname]) || (routes == null ? void 0 : routes["*"]);
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
  function ensurePlainObject(value, context, fallback = {}) {
    if (value == null) {
      return { ...fallback };
    }
    if (!isPlainObject(value)) {
      fail("S016", `${context} must be a plain object.`, { context });
    }
    return { ...value };
  }
  function computeFormErrors(validate, values) {
    if (typeof validate !== "function") {
      return {};
    }
    let result;
    try {
      result = validate(values);
    } catch (error) {
      report("S016", error, { context: "useForm.validate" });
      throw error;
    }
    if (result == null) {
      return {};
    }
    if (!isPlainObject(result)) {
      fail("S016", "useForm validate() must return a plain object of errors.", {
        context: "useForm.validate"
      });
    }
    return result;
  }
  function useForm(options = {}) {
    const {
      initialValues = EMPTY_OBJECT,
      validate = null,
      onSubmit = null,
      validateOnChange = false,
      validateOnBlur = true
    } = options;
    const initialSnapshot = useMemo(() => ensurePlainObject(initialValues, "useForm.initialValues"), [initialValues]);
    const [values, setValuesState] = useState(initialSnapshot);
    const [baseValues, setBaseValues] = useState(initialSnapshot);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);
    const setValues = useCallback((nextValues) => {
      setValuesState((previousValues) => {
        const resolved = resolveValue(nextValues, previousValues);
        const safeResolved = ensurePlainObject(resolved, "useForm.setValues");
        if (validateOnChange) {
          setErrors(computeFormErrors(validate, safeResolved));
        }
        return safeResolved;
      });
    }, [validateOnChange, validate]);
    const setField = useCallback((name, nextValue) => {
      if (!name || typeof name !== "string") {
        fail("S016", "useForm.setField(name, value) requires a non-empty field name.", {
          context: "useForm.setField"
        });
      }
      setValuesState((previousValues) => {
        const resolved = resolveValue(nextValue, previousValues[name]);
        const nextValuesState = {
          ...previousValues,
          [name]: resolved
        };
        if (validateOnChange) {
          setErrors(computeFormErrors(validate, nextValuesState));
        }
        return nextValuesState;
      });
    }, [validateOnChange, validate]);
    const setError = useCallback((name, message) => {
      if (!name || typeof name !== "string") {
        fail("S016", "useForm.setError(name, message) requires a non-empty field name.", {
          context: "useForm.setError"
        });
      }
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: message
      }));
    }, []);
    const touchField = useCallback((name, value = true) => {
      if (!name || typeof name !== "string") {
        fail("S016", "useForm.touchField(name) requires a non-empty field name.", {
          context: "useForm.touchField"
        });
      }
      setTouched((previousTouched) => ({
        ...previousTouched,
        [name]: Boolean(value)
      }));
    }, []);
    const runValidation = useCallback((candidateValues = values) => {
      const safeCandidateValues = ensurePlainObject(candidateValues, "useForm.validate.values");
      const nextErrors = computeFormErrors(validate, safeCandidateValues);
      setErrors(nextErrors);
      return {
        valid: Object.keys(nextErrors).length === 0,
        errors: nextErrors
      };
    }, [validate, values]);
    const reset = useCallback((nextInitialValues = baseValues) => {
      const safeValues = ensurePlainObject(nextInitialValues, "useForm.reset.values");
      setBaseValues(safeValues);
      setValuesState(safeValues);
      setErrors({});
      setTouched({});
      setSubmitting(false);
    }, [baseValues]);
    const bind = useCallback((name, config = {}) => {
      var _a;
      if (!name || typeof name !== "string") {
        fail("S016", "useForm.bind(name) requires a non-empty field name.", {
          context: "useForm.bind"
        });
      }
      const {
        type = "text",
        parse
      } = config;
      const isCheckbox = type === "checkbox";
      const isFile = type === "file";
      const onInput = (event) => {
        var _a2, _b, _c, _d, _e;
        let nextValue;
        if (typeof parse === "function") {
          nextValue = parse(event, values[name]);
        } else if (isCheckbox) {
          nextValue = Boolean((_a2 = event == null ? void 0 : event.target) == null ? void 0 : _a2.checked);
        } else if (isFile) {
          nextValue = (_d = (_c = (_b = event == null ? void 0 : event.target) == null ? void 0 : _b.files) == null ? void 0 : _c[0]) != null ? _d : null;
        } else {
          nextValue = (_e = event == null ? void 0 : event.target) == null ? void 0 : _e.value;
        }
        setField(name, nextValue);
      };
      const onBlur = () => {
        touchField(name, true);
        if (validateOnBlur && !validateOnChange) {
          runValidation();
        }
      };
      if (isCheckbox) {
        return {
          checked: Boolean(values[name]),
          onInput,
          onBlur
        };
      }
      if (isFile) {
        return {
          onInput,
          onBlur
        };
      }
      return {
        value: (_a = values[name]) != null ? _a : "",
        onInput,
        onBlur
      };
    }, [setField, touchField, validateOnBlur, validateOnChange, runValidation, values]);
    const handleSubmit = useCallback((submitHandler = onSubmit) => {
      return async (event) => {
        if (event && typeof event.preventDefault === "function") {
          event.preventDefault();
        }
        setSubmitCount((previousCount) => previousCount + 1);
        const validation = runValidation();
        if (!validation.valid) {
          return {
            ok: false,
            errors: validation.errors
          };
        }
        if (typeof submitHandler !== "function") {
          return {
            ok: true,
            values
          };
        }
        setSubmitting(true);
        try {
          const result = await submitHandler(values, {
            values,
            errors: validation.errors,
            setValues,
            setField,
            setErrors,
            setError,
            touchField,
            reset,
            validate: runValidation
          });
          return {
            ok: true,
            result
          };
        } finally {
          setSubmitting(false);
        }
      };
    }, [onSubmit, runValidation, setValues, setField, setError, touchField, reset, values]);
    const dirty = useMemo(() => {
      try {
        return JSON.stringify(values) !== JSON.stringify(baseValues);
      } catch (_) {
        return true;
      }
    }, [values, baseValues]);
    return {
      values,
      errors,
      touched,
      submitting,
      submitCount,
      dirty,
      isValid: Object.keys(errors).length === 0,
      setValues,
      setField,
      setErrors,
      setError,
      touchField,
      bind,
      validate: runValidation,
      handleSubmit,
      reset
    };
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
      parseJSON: parseJSON2 = true,
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
        if (parseJSON2 && typeof payload === "string") {
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
      parseJSON: parseJSON2 = true,
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
      parseJSON: parseJSON2,
      serializeJSON
    }), [url, protocols, reconnect, reconnectInterval, maxRetries, parseJSON2, serializeJSON, ...extraDeps]);
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
    useForm,
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

  // src/data/migration-runner.js
  function normalizeMigrations(migrations = []) {
    if (!Array.isArray(migrations)) {
      fail("S016", "migrations must be an array.", { context: "data.migrations.normalize" });
    }
    const map = /* @__PURE__ */ new Map();
    for (const entry of migrations) {
      let version;
      let up;
      if (typeof entry === "function") {
        version = Number(entry.version);
        up = entry;
      } else if (entry && typeof entry === "object") {
        version = Number(entry.version);
        up = entry.up;
      }
      if (!Number.isInteger(version) || version < 1 || typeof up !== "function") {
        fail("S016", "Each migration must provide { version: number >= 1, up: function }.", {
          context: "data.migrations.normalize"
        });
      }
      if (map.has(version)) {
        fail("S016", `Duplicate migration version ${version} detected.`, {
          context: "data.migrations.normalize",
          version
        });
      }
      map.set(version, up);
    }
    return map;
  }
  var MigrationRunner = class {
    constructor({ migrations = [] } = {}) {
      this.migrations = normalizeMigrations(migrations);
    }
    async run(currentVersion, targetVersion, context = {}) {
      const fromVersion = Number(currentVersion) || 0;
      const toVersion = Number(targetVersion) || 0;
      if (!Number.isInteger(fromVersion) || fromVersion < 0) {
        fail("S016", "currentVersion must be an integer >= 0.", {
          context: "data.migrations.run"
        });
      }
      if (!Number.isInteger(toVersion) || toVersion < 0) {
        fail("S016", "targetVersion must be an integer >= 0.", {
          context: "data.migrations.run"
        });
      }
      if (toVersion < fromVersion) {
        fail("S016", "targetVersion cannot be less than currentVersion.", {
          context: "data.migrations.run",
          fromVersion,
          toVersion
        });
      }
      const applied = [];
      for (let version = fromVersion + 1; version <= toVersion; version++) {
        const migration = this.migrations.get(version);
        if (!migration) {
          continue;
        }
        await migration({
          ...context,
          version,
          fromVersion,
          toVersion
        });
        applied.push(version);
      }
      return {
        fromVersion,
        toVersion,
        applied
      };
    }
  };

  // src/data/storage-engine.js
  var StorageEngine = class {
    constructor({ namespace = "synact" } = {}) {
      this.namespace = String(namespace || "synact");
      this.ready = false;
    }
    async open() {
      this.ready = true;
      return this;
    }
    async close() {
      this.ready = false;
    }
    ensureReady(context) {
      if (!this.ready) {
        fail("S016", `${this.constructor.name} is not open. Call open() before using it.`, { context });
      }
    }
    normalizeKey(key, context = "data.storage.key") {
      if (typeof key !== "string" || key.trim() === "") {
        fail("S016", "Storage key must be a non-empty string.", { context, keyType: typeof key });
      }
      return key;
    }
    resolveKey(key, context = "data.storage.key") {
      const normalizedKey = this.normalizeKey(key, context);
      return `${this.namespace}:${normalizedKey}`;
    }
    stripNamespace(qualifiedKey) {
      const prefix = `${this.namespace}:`;
      if (!qualifiedKey.startsWith(prefix)) {
        return null;
      }
      return qualifiedKey.slice(prefix.length);
    }
    notImplemented(methodName) {
      fail("S016", `${this.constructor.name}.${methodName}() is not implemented.`, {
        context: `data.storage.${methodName}`
      });
    }
    async get(_key) {
      this.notImplemented("get");
    }
    async set(_key, _value) {
      this.notImplemented("set");
    }
    async remove(_key) {
      this.notImplemented("remove");
    }
    async list(_prefix = "") {
      this.notImplemented("list");
    }
    async clear(_prefix = "") {
      this.notImplemented("clear");
    }
    async transaction(_operations = []) {
      this.notImplemented("transaction");
    }
  };

  // src/data/indexeddb-storage-engine.js
  function requestToPromise(request, context) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        reject(request.error || createSynactError("S013", "IndexedDB request failed.", { context }));
      };
    });
  }
  function transactionToPromise(transaction, context) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => {
        reject(transaction.error || createSynactError("S013", "IndexedDB transaction failed.", { context }));
      };
      transaction.onabort = () => {
        reject(transaction.error || createSynactError("S013", "IndexedDB transaction aborted.", { context }));
      };
    });
  }
  var IndexedDBStorageEngine = class extends StorageEngine {
    constructor({
      namespace = "synact",
      dbName,
      storeName = "records",
      dbVersion = 1,
      indexedDBImpl = typeof indexedDB !== "undefined" ? indexedDB : null
    } = {}) {
      super({ namespace });
      this.dbName = dbName || `synact-${this.namespace}`;
      this.storeName = storeName;
      this.dbVersion = Number(dbVersion) || 1;
      this.indexedDBImpl = indexedDBImpl;
      this.db = null;
      this.openPromise = null;
    }
    async open() {
      if (this.ready && this.db) {
        return this;
      }
      if (this.openPromise) {
        return this.openPromise;
      }
      if (!this.indexedDBImpl || typeof this.indexedDBImpl.open !== "function") {
        fail("S013", "IndexedDB is not available in this environment.", {
          context: "data.indexeddb.open"
        });
      }
      this.openPromise = new Promise((resolve, reject) => {
        let request;
        try {
          request = this.indexedDBImpl.open(this.dbName, this.dbVersion);
        } catch (error) {
          reject(createSynactError("S013", "Unable to open IndexedDB database.", {
            context: "data.indexeddb.open"
          }, error));
          return;
        }
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: "key" });
          }
        };
        request.onsuccess = () => {
          this.db = request.result;
          this.ready = true;
          this.openPromise = null;
          resolve(this);
        };
        request.onerror = () => {
          this.openPromise = null;
          reject(request.error || createSynactError("S013", "IndexedDB open request failed.", {
            context: "data.indexeddb.open"
          }));
        };
        request.onblocked = () => {
          this.openPromise = null;
          reject(createSynactError("S013", "IndexedDB open request was blocked.", {
            context: "data.indexeddb.open"
          }));
        };
      });
      return this.openPromise;
    }
    async close() {
      if (this.db && typeof this.db.close === "function") {
        this.db.close();
      }
      this.db = null;
      this.ready = false;
      this.openPromise = null;
    }
    async ensureDb(context) {
      await this.open();
      this.ensureReady(context);
      return this.db;
    }
    async get(key) {
      const db = await this.ensureDb("data.indexeddb.get");
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const qualifiedKey = this.resolveKey(key, "data.indexeddb.get");
      const request = store.get(qualifiedKey);
      const [result] = await Promise.all([
        requestToPromise(request, "data.indexeddb.get"),
        transactionToPromise(transaction, "data.indexeddb.get")
      ]);
      return result ? result.value : null;
    }
    async set(key, value) {
      const db = await this.ensureDb("data.indexeddb.set");
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const qualifiedKey = this.resolveKey(key, "data.indexeddb.set");
      const request = store.put({
        key: qualifiedKey,
        value: String(value),
        updatedAt: Date.now()
      });
      await Promise.all([
        requestToPromise(request, "data.indexeddb.set"),
        transactionToPromise(transaction, "data.indexeddb.set")
      ]);
      return true;
    }
    async remove(key) {
      const db = await this.ensureDb("data.indexeddb.remove");
      const qualifiedKey = this.resolveKey(key, "data.indexeddb.remove");
      const previousValue = await this.get(key);
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(qualifiedKey);
      await Promise.all([
        requestToPromise(request, "data.indexeddb.remove"),
        transactionToPromise(transaction, "data.indexeddb.remove")
      ]);
      return previousValue != null;
    }
    async list(prefix = "") {
      const db = await this.ensureDb("data.indexeddb.list");
      const normalizedPrefix = String(prefix || "");
      const results = [];
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          var _a, _b;
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }
          const unqualifiedKey = this.stripNamespace(cursor.key);
          if (unqualifiedKey != null && unqualifiedKey.startsWith(normalizedPrefix)) {
            results.push({ key: unqualifiedKey, value: (_b = (_a = cursor.value) == null ? void 0 : _a.value) != null ? _b : null });
          }
          cursor.continue();
        };
        request.onerror = () => {
          reject(request.error || createSynactError("S013", "IndexedDB cursor request failed.", {
            context: "data.indexeddb.list"
          }));
        };
      });
      await transactionToPromise(transaction, "data.indexeddb.list");
      return results;
    }
    async clear(prefix = "") {
      const normalizedPrefix = String(prefix || "");
      const db = await this.ensureDb("data.indexeddb.clear");
      if (!normalizedPrefix) {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        await Promise.all([
          requestToPromise(request, "data.indexeddb.clear"),
          transactionToPromise(transaction, "data.indexeddb.clear")
        ]);
        return true;
      }
      const entries = await this.list(normalizedPrefix);
      if (entries.length === 0) {
        return 0;
      }
      await this.transaction(entries.map((entry) => ({ type: "remove", key: entry.key })));
      return entries.length;
    }
    async transaction(operations = []) {
      var _a;
      if (!Array.isArray(operations)) {
        fail("S016", "IndexedDBStorageEngine.transaction() expects an array of operations.", {
          context: "data.indexeddb.transaction"
        });
      }
      const db = await this.ensureDb("data.indexeddb.transaction");
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const requestPromises = [];
      for (const operation of operations) {
        if (!operation || typeof operation !== "object") {
          fail("S016", "Invalid transaction operation shape.", {
            context: "data.indexeddb.transaction"
          });
        }
        const key = this.resolveKey(operation.key, "data.indexeddb.transaction");
        if (operation.type === "set") {
          const request = store.put({ key, value: String((_a = operation.value) != null ? _a : ""), updatedAt: Date.now() });
          requestPromises.push(requestToPromise(request, "data.indexeddb.transaction"));
          continue;
        }
        if (operation.type === "remove") {
          const request = store.delete(key);
          requestPromises.push(requestToPromise(request, "data.indexeddb.transaction"));
          continue;
        }
        fail("S016", `Unsupported transaction operation type "${operation.type}".`, {
          context: "data.indexeddb.transaction"
        });
      }
      await Promise.all([...requestPromises, transactionToPromise(transaction, "data.indexeddb.transaction")]);
      return true;
    }
  };

  // src/data/localstorage-storage-engine.js
  var LocalStorageEngine = class extends StorageEngine {
    constructor({ namespace = "synact", storage = null } = {}) {
      super({ namespace });
      this.storage = storage;
      this.storageRef = null;
    }
    resolveStorage() {
      if (this.storage) {
        return this.storage;
      }
      if (typeof window === "undefined") {
        fail("S013", "localStorage is not available in this environment.", {
          context: "data.localstorage.resolve"
        });
      }
      try {
        return window.localStorage;
      } catch (error) {
        fail("S013", "Unable to access localStorage in this environment.", {
          context: "data.localstorage.resolve"
        }, error);
      }
    }
    async open() {
      this.storageRef = this.resolveStorage();
      this.ready = true;
      return this;
    }
    async close() {
      this.storageRef = null;
      this.ready = false;
    }
    getStorage(context) {
      this.ensureReady(context);
      return this.storageRef;
    }
    unsafeGetQualified(qualifiedKey, context) {
      const storage = this.getStorage(context);
      try {
        return storage.getItem(qualifiedKey);
      } catch (error) {
        fail("S013", "localStorage getItem() failed.", { context }, error);
      }
    }
    unsafeSetQualified(qualifiedKey, value, context) {
      const storage = this.getStorage(context);
      try {
        storage.setItem(qualifiedKey, value);
      } catch (error) {
        fail("S013", "localStorage setItem() failed.", { context }, error);
      }
    }
    unsafeRemoveQualified(qualifiedKey, context) {
      const storage = this.getStorage(context);
      try {
        storage.removeItem(qualifiedKey);
      } catch (error) {
        fail("S013", "localStorage removeItem() failed.", { context }, error);
      }
    }
    async get(key) {
      const qualifiedKey = this.resolveKey(key, "data.localstorage.get");
      return this.unsafeGetQualified(qualifiedKey, "data.localstorage.get");
    }
    async set(key, value) {
      const qualifiedKey = this.resolveKey(key, "data.localstorage.set");
      this.unsafeSetQualified(qualifiedKey, String(value), "data.localstorage.set");
      return true;
    }
    async remove(key) {
      const qualifiedKey = this.resolveKey(key, "data.localstorage.remove");
      const previousValue = this.unsafeGetQualified(qualifiedKey, "data.localstorage.remove");
      this.unsafeRemoveQualified(qualifiedKey, "data.localstorage.remove");
      return previousValue != null;
    }
    async list(prefix = "") {
      const storage = this.getStorage("data.localstorage.list");
      const normalizedPrefix = String(prefix || "");
      const results = [];
      for (let i = 0; i < storage.length; i++) {
        const qualifiedKey = storage.key(i);
        if (!qualifiedKey) continue;
        const unqualifiedKey = this.stripNamespace(qualifiedKey);
        if (unqualifiedKey == null) continue;
        if (!unqualifiedKey.startsWith(normalizedPrefix)) continue;
        const value = this.unsafeGetQualified(qualifiedKey, "data.localstorage.list");
        results.push({ key: unqualifiedKey, value });
      }
      return results;
    }
    async clear(prefix = "") {
      const entries = await this.list(prefix);
      for (const entry of entries) {
        await this.remove(entry.key);
      }
      return entries.length;
    }
    async transaction(operations = []) {
      var _a;
      if (!Array.isArray(operations)) {
        fail("S016", "LocalStorageEngine.transaction() expects an array of operations.", {
          context: "data.localstorage.transaction"
        });
      }
      const rollbackMap = /* @__PURE__ */ new Map();
      for (const operation of operations) {
        if (!operation || typeof operation !== "object") {
          fail("S016", "Invalid transaction operation shape.", {
            context: "data.localstorage.transaction"
          });
        }
        const key = this.normalizeKey(operation.key, "data.localstorage.transaction");
        if (rollbackMap.has(key)) {
          continue;
        }
        rollbackMap.set(key, await this.get(key));
      }
      try {
        for (const operation of operations) {
          const key = this.normalizeKey(operation.key, "data.localstorage.transaction");
          if (operation.type === "set") {
            await this.set(key, (_a = operation.value) != null ? _a : "");
          } else if (operation.type === "remove") {
            await this.remove(key);
          } else {
            fail("S016", `Unsupported transaction operation type "${operation.type}".`, {
              context: "data.localstorage.transaction"
            });
          }
        }
      } catch (error) {
        for (const [key, previousValue] of rollbackMap.entries()) {
          if (previousValue == null) {
            await this.remove(key);
          } else {
            await this.set(key, previousValue);
          }
        }
        throw error;
      }
      return true;
    }
  };

  // src/data/datastore.js
  function isPlainObject2(value) {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  function parseJSON(rawValue, context) {
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      fail("S016", "Failed to parse stored JSON value.", { context }, error);
    }
  }
  function stringifyJSON(value, context) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      fail("S016", "Failed to serialize value as JSON.", { context }, error);
    }
  }
  function nowISO() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function resolveEngineMode(engine) {
    if (engine == null) {
      return "auto";
    }
    if (typeof engine === "string") {
      return engine;
    }
    return null;
  }
  var DataStore = class _DataStore {
    constructor(config = {}) {
      var _a;
      const appId = String(config.appId || "").trim();
      if (!appId) {
        fail("S016", "DataStore requires a non-empty appId.", { context: "data.datastore.constructor" });
      }
      const schemaVersion = Number((_a = config.schemaVersion) != null ? _a : 1);
      if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
        fail("S016", "schemaVersion must be an integer >= 1.", {
          context: "data.datastore.constructor"
        });
      }
      this.appId = appId;
      this.schemaVersion = schemaVersion;
      this.engineMode = resolveEngineMode(config.engine);
      this.engineConfig = {
        dbName: config.dbName,
        storeName: config.storeName,
        dbVersion: config.dbVersion,
        indexedDBImpl: config.indexedDBImpl,
        storage: config.storage
      };
      this.namespace = String(config.namespace || `synact:${appId}`);
      this.engine = config.engine instanceof StorageEngine ? config.engine : config.engineInstance || null;
      this.migrationRunner = new MigrationRunner({ migrations: config.migrations || [] });
      this.metaKey = "__synact_meta__";
      this.recordPrefix = "record";
      this.meta = null;
      this.ready = false;
      this.openPromise = null;
    }
    static async create(config = {}) {
      const store = new _DataStore(config);
      await store.open();
      return store;
    }
    validateCollection(collection, context) {
      if (typeof collection !== "string" || !collection.trim()) {
        fail("S016", "collection must be a non-empty string.", { context });
      }
      return collection;
    }
    validateId(id, context) {
      if (typeof id !== "string" || !id.trim()) {
        fail("S016", "id must be a non-empty string.", { context });
      }
      return id;
    }
    buildRecordKey(collection, id) {
      return `${this.recordPrefix}:${collection}:${id}`;
    }
    buildCollectionPrefix(collection) {
      return `${this.recordPrefix}:${collection}:`;
    }
    parseRecordKey(recordKey) {
      const safeKey = String(recordKey || "");
      const prefix = `${this.recordPrefix}:`;
      if (!safeKey.startsWith(prefix)) {
        return null;
      }
      const rest = safeKey.slice(prefix.length);
      const separatorIndex = rest.indexOf(":");
      if (separatorIndex <= 0) {
        return null;
      }
      const collection = rest.slice(0, separatorIndex);
      const id = rest.slice(separatorIndex + 1);
      if (!collection || !id) {
        return null;
      }
      return { collection, id };
    }
    createEngineFromMode(mode) {
      if (mode === "indexeddb") {
        return new IndexedDBStorageEngine({
          namespace: this.namespace,
          dbName: this.engineConfig.dbName,
          storeName: this.engineConfig.storeName,
          dbVersion: this.engineConfig.dbVersion,
          indexedDBImpl: this.engineConfig.indexedDBImpl
        });
      }
      if (mode === "localstorage") {
        return new LocalStorageEngine({
          namespace: this.namespace,
          storage: this.engineConfig.storage
        });
      }
      fail("S016", `Unsupported DataStore engine mode "${mode}".`, {
        context: "data.datastore.createEngine"
      });
    }
    async resolveEngine() {
      var _a;
      if (this.engine) {
        return this.engine;
      }
      if (this.engineMode === "auto") {
        const indexedDBAvailable = typeof ((_a = this.engineConfig.indexedDBImpl) == null ? void 0 : _a.open) === "function" || typeof indexedDB !== "undefined";
        this.engine = indexedDBAvailable ? this.createEngineFromMode("indexeddb") : this.createEngineFromMode("localstorage");
        return this.engine;
      }
      if (this.engineMode === "indexeddb" || this.engineMode === "localstorage") {
        this.engine = this.createEngineFromMode(this.engineMode);
        return this.engine;
      }
      fail("S016", "engine must be one of: auto, indexeddb, localstorage, or a StorageEngine instance.", {
        context: "data.datastore.resolveEngine"
      });
    }
    async open() {
      if (this.ready) {
        return this;
      }
      if (this.openPromise) {
        return this.openPromise;
      }
      this.openPromise = this.openInternal().catch((error) => {
        this.ready = false;
        this.openPromise = null;
        throw error;
      });
      return this.openPromise;
    }
    async openInternal() {
      var _a, _b;
      let engine = await this.resolveEngine();
      try {
        await engine.open();
      } catch (error) {
        if (this.engineMode === "auto" && engine instanceof IndexedDBStorageEngine) {
          engine = this.createEngineFromMode("localstorage");
          this.engine = engine;
          await engine.open();
        } else {
          throw error;
        }
      }
      this.ready = true;
      const rawMeta = await engine.get(this.metaKey);
      if (rawMeta == null) {
        const timestamp = nowISO();
        this.meta = {
          appId: this.appId,
          schemaVersion: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMigrationAt: null,
          lastAppliedMigrations: []
        };
        await engine.set(this.metaKey, stringifyJSON(this.meta, "data.datastore.meta.write"));
      } else {
        this.meta = parseJSON(rawMeta, "data.datastore.meta.read");
        if (((_a = this.meta) == null ? void 0 : _a.appId) !== this.appId) {
          fail("S016", "Stored appId does not match the configured DataStore appId.", {
            context: "data.datastore.meta.validate",
            configuredAppId: this.appId,
            storedAppId: (_b = this.meta) == null ? void 0 : _b.appId
          });
        }
      }
      await this.migrate(this.schemaVersion);
      this.openPromise = null;
      return this;
    }
    async ensureOpen(context) {
      if (!this.ready) {
        await this.open();
      }
      if (!this.engine) {
        fail("S016", "DataStore engine is unavailable.", { context });
      }
      return this.engine;
    }
    async writeMeta(nextMeta) {
      const engine = await this.ensureOpen("data.datastore.writeMeta");
      this.meta = { ...nextMeta };
      await engine.set(this.metaKey, stringifyJSON(this.meta, "data.datastore.meta.write"));
      return { ...this.meta };
    }
    getMeta() {
      if (!this.meta) {
        return null;
      }
      return { ...this.meta };
    }
    getRecordTtlMs(record) {
      if (!(record == null ? void 0 : record.expiresAt)) {
        return void 0;
      }
      const ttlMs = Number(new Date(record.expiresAt).getTime()) - Date.now();
      if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
        return void 0;
      }
      return ttlMs;
    }
    isExpired(record) {
      if (!(record == null ? void 0 : record.expiresAt)) {
        return false;
      }
      return Number(new Date(record.expiresAt).getTime()) <= Date.now();
    }
    async readRecord(collection, id) {
      const safeCollection = this.validateCollection(collection, "data.datastore.readRecord");
      const safeId = this.validateId(id, "data.datastore.readRecord");
      const engine = await this.ensureOpen("data.datastore.readRecord");
      const recordKey = this.buildRecordKey(safeCollection, safeId);
      const rawRecord = await engine.get(recordKey);
      if (rawRecord == null) {
        return null;
      }
      const record = parseJSON(rawRecord, "data.datastore.readRecord");
      if (this.isExpired(record)) {
        await engine.remove(recordKey);
        return null;
      }
      return record;
    }
    async read(collection, id) {
      const record = await this.readRecord(collection, id);
      return record ? record.payload : null;
    }
    async write(collection, id, payload, options = {}) {
      const safeCollection = this.validateCollection(collection, "data.datastore.write");
      const safeId = this.validateId(id, "data.datastore.write");
      const existingRecord = await this.readRecord(safeCollection, safeId);
      const timestamp = nowISO();
      let expiresAt = null;
      if (options.ttlMs != null) {
        const ttlMs = Number(options.ttlMs);
        if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
          fail("S016", "ttlMs must be a positive number.", { context: "data.datastore.write" });
        }
        expiresAt = new Date(Date.now() + ttlMs).toISOString();
      }
      const record = {
        appId: this.appId,
        collection: safeCollection,
        id: safeId,
        payload,
        createdAt: (existingRecord == null ? void 0 : existingRecord.createdAt) || timestamp,
        updatedAt: timestamp,
        expiresAt
      };
      const engine = await this.ensureOpen("data.datastore.write");
      await engine.set(
        this.buildRecordKey(safeCollection, safeId),
        stringifyJSON(record, "data.datastore.write")
      );
      return payload;
    }
    async update(collection, id, patch2) {
      const safeCollection = this.validateCollection(collection, "data.datastore.update");
      const safeId = this.validateId(id, "data.datastore.update");
      const existingRecord = await this.readRecord(safeCollection, safeId);
      if (!existingRecord) {
        return null;
      }
      let nextPayload;
      if (typeof patch2 === "function") {
        nextPayload = patch2(existingRecord.payload);
      } else if (isPlainObject2(patch2) && isPlainObject2(existingRecord.payload)) {
        nextPayload = { ...existingRecord.payload, ...patch2 };
      } else {
        nextPayload = patch2;
      }
      const writeOptions = {};
      if (existingRecord.expiresAt) {
        const ttlMs = this.getRecordTtlMs(existingRecord);
        if (ttlMs > 0) {
          writeOptions.ttlMs = ttlMs;
        }
      }
      return this.write(safeCollection, safeId, nextPayload, writeOptions);
    }
    async delete(collection, id) {
      const safeCollection = this.validateCollection(collection, "data.datastore.delete");
      const safeId = this.validateId(id, "data.datastore.delete");
      const engine = await this.ensureOpen("data.datastore.delete");
      return engine.remove(this.buildRecordKey(safeCollection, safeId));
    }
    async query(collection, options = {}) {
      const safeCollection = this.validateCollection(collection, "data.datastore.query");
      const {
        limit,
        offset = 0,
        sortBy = "updatedAt",
        sortDirection = "desc",
        predicate,
        withMeta = false
      } = options;
      const safeOffset = Math.max(0, Number(offset) || 0);
      const safeLimit = limit == null ? null : Math.max(0, Number(limit) || 0);
      const engine = await this.ensureOpen("data.datastore.query");
      const entries = await engine.list(this.buildCollectionPrefix(safeCollection));
      const records = [];
      for (const entry of entries) {
        const record = parseJSON(entry.value, "data.datastore.query");
        if (this.isExpired(record)) {
          await engine.remove(entry.key);
          continue;
        }
        if (typeof predicate === "function" && !predicate(record.payload, record)) {
          continue;
        }
        records.push(record);
      }
      records.sort((a, b) => {
        const aValue = a == null ? void 0 : a[sortBy];
        const bValue = b == null ? void 0 : b[sortBy];
        if (aValue === bValue) return 0;
        if (aValue == null) return sortDirection === "asc" ? -1 : 1;
        if (bValue == null) return sortDirection === "asc" ? 1 : -1;
        const result = String(aValue).localeCompare(String(bValue));
        return sortDirection === "asc" ? result : -result;
      });
      const sliced = records.slice(safeOffset, safeLimit == null ? void 0 : safeOffset + safeLimit);
      if (withMeta) {
        return sliced;
      }
      return sliced.map((record) => record.payload);
    }
    async listCollections() {
      const engine = await this.ensureOpen("data.datastore.listCollections");
      const entries = await engine.list(`${this.recordPrefix}:`);
      const collections = /* @__PURE__ */ new Set();
      for (const entry of entries) {
        const parsed = this.parseRecordKey(entry.key);
        if (!parsed) continue;
        collections.add(parsed.collection);
      }
      return Array.from(collections).sort();
    }
    async listRecords(collection = null) {
      if (collection != null) {
        const safeCollection = this.validateCollection(collection, "data.datastore.listRecords");
        return this.query(safeCollection, { withMeta: true });
      }
      const engine = await this.ensureOpen("data.datastore.listRecords");
      const entries = await engine.list(`${this.recordPrefix}:`);
      const records = [];
      for (const entry of entries) {
        const parsed = this.parseRecordKey(entry.key);
        if (!parsed) continue;
        const record = parseJSON(entry.value, "data.datastore.listRecords");
        if (this.isExpired(record)) {
          await engine.remove(entry.key);
          continue;
        }
        records.push(record);
      }
      return records;
    }
    async writeRecord(record) {
      if (!record || typeof record !== "object") {
        fail("S016", "writeRecord() expects a record object.", {
          context: "data.datastore.writeRecord"
        });
      }
      const collection = this.validateCollection(record.collection, "data.datastore.writeRecord");
      const id = this.validateId(record.id, "data.datastore.writeRecord");
      const createdAt = record.createdAt || nowISO();
      const updatedAt = record.updatedAt || nowISO();
      const expiresAt = record.expiresAt || null;
      const normalizedRecord = {
        appId: this.appId,
        collection,
        id,
        payload: record.payload,
        createdAt,
        updatedAt,
        expiresAt
      };
      const engine = await this.ensureOpen("data.datastore.writeRecord");
      await engine.set(
        this.buildRecordKey(collection, id),
        stringifyJSON(normalizedRecord, "data.datastore.writeRecord")
      );
      return normalizedRecord;
    }
    async clearCollection(collection) {
      const safeCollection = this.validateCollection(collection, "data.datastore.clearCollection");
      const engine = await this.ensureOpen("data.datastore.clearCollection");
      return engine.clear(this.buildCollectionPrefix(safeCollection));
    }
    async clearAllRecords() {
      const engine = await this.ensureOpen("data.datastore.clearAllRecords");
      return engine.clear(`${this.recordPrefix}:`);
    }
    async migrate(targetVersion = this.schemaVersion) {
      var _a;
      const safeTargetVersion = Number(targetVersion);
      if (!Number.isInteger(safeTargetVersion) || safeTargetVersion < 0) {
        fail("S016", "targetVersion must be an integer >= 0.", {
          context: "data.datastore.migrate"
        });
      }
      await this.ensureOpen("data.datastore.migrate");
      const fromVersion = Number((_a = this.meta) == null ? void 0 : _a.schemaVersion) || 0;
      if (safeTargetVersion === fromVersion) {
        return {
          fromVersion,
          toVersion: safeTargetVersion,
          applied: []
        };
      }
      const migrationResult = await this.migrationRunner.run(fromVersion, safeTargetVersion, {
        store: this,
        engine: this.engine,
        appId: this.appId
      });
      const timestamp = nowISO();
      await this.writeMeta({
        ...this.meta,
        schemaVersion: safeTargetVersion,
        updatedAt: timestamp,
        lastMigrationAt: timestamp,
        lastAppliedMigrations: migrationResult.applied
      });
      return migrationResult;
    }
    async close() {
      if (!this.engine) {
        this.ready = false;
        this.openPromise = null;
        return;
      }
      await this.engine.close();
      this.ready = false;
      this.openPromise = null;
    }
  };

  // src/data/import-export-manager.js
  function isPlainObject3(value) {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }
  function stableSerialize(value) {
    if (Array.isArray(value)) {
      return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
    }
    if (isPlainObject3(value)) {
      const keys = Object.keys(value).sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }
  function computeFNV1a32(input) {
    let hash = 2166136261;
    const text = String(input || "");
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }
  function toTimestamp(value) {
    const time = Number(new Date(value).getTime());
    if (!Number.isFinite(time)) {
      return null;
    }
    return time;
  }
  function defaultConflictResolver({ existingRecord, incomingRecord }) {
    const existingTimestamp = toTimestamp(existingRecord == null ? void 0 : existingRecord.updatedAt);
    const incomingTimestamp = toTimestamp(incomingRecord == null ? void 0 : incomingRecord.updatedAt);
    if (existingTimestamp == null && incomingTimestamp == null) {
      return "incoming";
    }
    if (existingTimestamp == null) {
      return "incoming";
    }
    if (incomingTimestamp == null) {
      return "existing";
    }
    return incomingTimestamp >= existingTimestamp ? "incoming" : "existing";
  }
  var ImportExportManager = class {
    constructor({
      store,
      format = "synact.snapshot.v1",
      runtimeVersion = "0.0.0"
    } = {}) {
      if (!(store instanceof DataStore)) {
        fail("S016", "ImportExportManager requires a DataStore instance.", {
          context: "data.importExport.constructor"
        });
      }
      this.store = store;
      this.format = format;
      this.runtimeVersion = String(runtimeVersion || "0.0.0");
    }
    computeChecksum(snapshot) {
      const input = { ...snapshot };
      delete input.checksum;
      return `fnv1a32:${computeFNV1a32(stableSerialize(input))}`;
    }
    normalizeRecord(collection, record, context = "data.importExport.normalizeRecord") {
      if (!record || typeof record !== "object") {
        fail("S016", "Snapshot record must be an object.", { context, collection });
      }
      if (typeof record.id !== "string" || !record.id.trim()) {
        fail("S016", "Snapshot record.id must be a non-empty string.", {
          context,
          collection
        });
      }
      const createdAt = record.createdAt || (/* @__PURE__ */ new Date()).toISOString();
      const updatedAt = record.updatedAt || createdAt;
      return {
        appId: this.store.appId,
        collection,
        id: record.id,
        payload: record.payload,
        createdAt,
        updatedAt,
        expiresAt: record.expiresAt || null
      };
    }
    async exportSnapshot(options = {}) {
      var _a, _b, _c;
      const {
        includeMeta = true,
        includeChecksum = true
      } = options;
      await this.store.open();
      const records = await this.store.listRecords();
      const collections = {};
      for (const record of records) {
        if (!collections[record.collection]) {
          collections[record.collection] = [];
        }
        collections[record.collection].push({
          id: record.id,
          payload: record.payload,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          expiresAt: record.expiresAt || null
        });
      }
      for (const items of Object.values(collections)) {
        items.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      }
      const snapshot = {
        format: this.format,
        appId: this.store.appId,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        schemaVersion: Number((_c = (_b = (_a = this.store.getMeta()) == null ? void 0 : _a.schemaVersion) != null ? _b : this.store.schemaVersion) != null ? _c : 0),
        runtimeVersion: this.runtimeVersion,
        collections
      };
      if (includeMeta) {
        snapshot.meta = this.store.getMeta();
      }
      if (includeChecksum) {
        snapshot.checksum = this.computeChecksum(snapshot);
      }
      return snapshot;
    }
    validateSnapshot(snapshot, options = {}) {
      const { verifyChecksum = true } = options;
      const errors = [];
      if (!snapshot || typeof snapshot !== "object") {
        errors.push("Snapshot must be an object.");
        return { valid: false, errors };
      }
      if (snapshot.format !== this.format) {
        errors.push(`Snapshot format must be "${this.format}".`);
      }
      if (typeof snapshot.appId !== "string" || !snapshot.appId.trim()) {
        errors.push("Snapshot appId must be a non-empty string.");
      }
      if (!Number.isInteger(Number(snapshot.schemaVersion)) || Number(snapshot.schemaVersion) < 0) {
        errors.push("Snapshot schemaVersion must be an integer >= 0.");
      }
      if (!isPlainObject3(snapshot.collections)) {
        errors.push("Snapshot collections must be an object.");
      } else {
        for (const [collection, records] of Object.entries(snapshot.collections)) {
          if (!Array.isArray(records)) {
            errors.push(`Collection "${collection}" must be an array.`);
            continue;
          }
          for (const record of records) {
            if (!record || typeof record !== "object") {
              errors.push(`Collection "${collection}" contains an invalid record.`);
              continue;
            }
            if (typeof record.id !== "string" || !record.id.trim()) {
              errors.push(`Collection "${collection}" contains a record with invalid id.`);
            }
          }
        }
      }
      if (verifyChecksum) {
        if (typeof snapshot.checksum !== "string" || !snapshot.checksum.trim()) {
          errors.push("Snapshot checksum is required when verifyChecksum=true.");
        } else {
          const expectedChecksum = this.computeChecksum(snapshot);
          if (snapshot.checksum !== expectedChecksum) {
            errors.push("Snapshot checksum mismatch.");
          }
        }
      }
      return {
        valid: errors.length === 0,
        errors
      };
    }
    resolveConflictDecision(onConflict, conflictContext) {
      if (typeof onConflict === "function") {
        return onConflict(conflictContext);
      }
      if (onConflict === "incoming") {
        return "incoming";
      }
      if (onConflict === "existing") {
        return "existing";
      }
      if (onConflict === "newest" || onConflict == null) {
        return defaultConflictResolver(conflictContext);
      }
      fail("S016", `Unsupported onConflict strategy "${onConflict}".`, {
        context: "data.importExport.import"
      });
    }
    async importSnapshot(snapshot, options = {}) {
      var _a;
      const {
        mode = "merge",
        dryRun = false,
        onConflict = "newest",
        verifyChecksum = true,
        allowAppIdMismatch = false,
        allowFutureSchema = false
      } = options;
      await this.store.open();
      const validation = this.validateSnapshot(snapshot, { verifyChecksum });
      if (!validation.valid) {
        fail("S016", "Invalid snapshot payload.", {
          context: "data.importExport.import",
          errors: validation.errors
        });
      }
      if (!allowAppIdMismatch && snapshot.appId !== this.store.appId) {
        fail("S016", "Snapshot appId does not match DataStore appId.", {
          context: "data.importExport.import",
          snapshotAppId: snapshot.appId,
          storeAppId: this.store.appId
        });
      }
      if (!allowFutureSchema && Number(snapshot.schemaVersion) > Number(this.store.schemaVersion)) {
        fail("S016", "Snapshot schemaVersion is newer than the configured DataStore schemaVersion.", {
          context: "data.importExport.import",
          snapshotSchemaVersion: Number(snapshot.schemaVersion),
          storeSchemaVersion: Number(this.store.schemaVersion)
        });
      }
      if (!mode || !["merge", "replace"].includes(mode)) {
        fail("S016", 'import mode must be "merge" or "replace".', {
          context: "data.importExport.import",
          mode
        });
      }
      const report2 = {
        mode,
        dryRun: Boolean(dryRun),
        summary: {
          incoming: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          deleted: 0,
          conflicts: 0
        },
        conflicts: []
      };
      if (mode === "replace") {
        const existingRecords = await this.store.listRecords();
        report2.summary.deleted = existingRecords.length;
        if (!dryRun) {
          await this.store.clearAllRecords();
        }
      }
      const collectionEntries = Object.entries(snapshot.collections || {});
      for (const [collection, records] of collectionEntries) {
        for (const record of records) {
          const incomingRecord = this.normalizeRecord(collection, record);
          report2.summary.incoming += 1;
          const existingRecord = await this.store.readRecord(collection, incomingRecord.id);
          if (!existingRecord) {
            report2.summary.created += 1;
            if (!dryRun) {
              await this.store.writeRecord(incomingRecord);
            }
            continue;
          }
          report2.summary.conflicts += 1;
          const conflictContext = {
            collection,
            id: incomingRecord.id,
            existingRecord,
            incomingRecord
          };
          const decision = this.resolveConflictDecision(onConflict, conflictContext);
          if (decision === "existing") {
            report2.summary.skipped += 1;
            report2.conflicts.push({
              collection,
              id: incomingRecord.id,
              decision: "existing"
            });
            continue;
          }
          if (decision === "incoming") {
            report2.summary.updated += 1;
            report2.conflicts.push({
              collection,
              id: incomingRecord.id,
              decision: "incoming"
            });
            if (!dryRun) {
              await this.store.writeRecord(incomingRecord);
            }
            continue;
          }
          if (isPlainObject3(decision)) {
            const patchedRecord = {
              ...incomingRecord,
              payload: decision,
              createdAt: existingRecord.createdAt,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            report2.summary.updated += 1;
            report2.conflicts.push({
              collection,
              id: incomingRecord.id,
              decision: "custom"
            });
            if (!dryRun) {
              await this.store.writeRecord(patchedRecord);
            }
            continue;
          }
          fail("S016", 'Conflict resolver must return "incoming", "existing", or an object payload.', {
            context: "data.importExport.import",
            collection,
            id: incomingRecord.id
          });
        }
      }
      const snapshotSchemaVersion = Number(snapshot.schemaVersion) || 0;
      if (!dryRun && snapshotSchemaVersion > Number(((_a = this.store.getMeta()) == null ? void 0 : _a.schemaVersion) || 0)) {
        await this.store.migrate(snapshotSchemaVersion);
      }
      return report2;
    }
  };

  // src/data/index.js
  async function createDataStore(config = {}) {
    return DataStore.create(config);
  }
  function createImportExportManager({ store, ...options } = {}) {
    return new ImportExportManager({ store, ...options });
  }
  function createStorageEngine(options = {}) {
    const { engine = "auto" } = options;
    if (engine instanceof StorageEngine) {
      return engine;
    }
    if (engine === "indexeddb") {
      return new IndexedDBStorageEngine(options);
    }
    if (engine === "localstorage") {
      return new LocalStorageEngine(options);
    }
    if (engine === "auto") {
      if (typeof indexedDB !== "undefined") {
        return new IndexedDBStorageEngine(options);
      }
      return new LocalStorageEngine(options);
    }
    return null;
  }
  var dataHelpers = {
    createDataStore,
    createImportExportManager,
    createStorageEngine,
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
  };

  // src/pwa/pwa-service.js
  function createStatusSnapshot(status) {
    return {
      supported: Boolean(status.supported),
      registered: Boolean(status.registered),
      installing: Boolean(status.installing),
      waiting: Boolean(status.waiting),
      updateAvailable: Boolean(status.updateAvailable),
      active: Boolean(status.active),
      installPromptAvailable: Boolean(status.installPromptAvailable),
      installed: Boolean(status.installed),
      scope: status.scope || null,
      lastError: status.lastError || null
    };
  }
  function isStandaloneDisplayMode(windowRef) {
    if (!windowRef || typeof windowRef.matchMedia !== "function") {
      return false;
    }
    try {
      return Boolean(windowRef.matchMedia("(display-mode: standalone)").matches);
    } catch (_) {
      return false;
    }
  }
  var PWAService = class {
    constructor({
      windowRef = typeof window !== "undefined" ? window : null,
      navigatorRef = typeof navigator !== "undefined" ? navigator : null,
      autoInit = true
    } = {}) {
      var _a;
      this.windowRef = windowRef;
      this.navigatorRef = navigatorRef;
      this.events = /* @__PURE__ */ new Map();
      this.initialized = false;
      this.registration = null;
      this.deferredInstallPrompt = null;
      this.windowCleanup = [];
      this.registrationCleanup = [];
      this.boundBeforeInstallPrompt = (event) => this.onBeforeInstallPrompt(event);
      this.boundAppInstalled = () => this.onAppInstalled();
      this.status = createStatusSnapshot({
        supported: Boolean((_a = this.navigatorRef) == null ? void 0 : _a.serviceWorker),
        registered: false,
        installing: false,
        waiting: false,
        updateAvailable: false,
        active: false,
        installPromptAvailable: false,
        installed: isStandaloneDisplayMode(this.windowRef),
        scope: null,
        lastError: null
      });
      if (autoInit) {
        this.initialize();
      }
    }
    initialize() {
      if (this.initialized) {
        return this;
      }
      this.initialized = true;
      if (this.windowRef && typeof this.windowRef.addEventListener === "function") {
        this.windowRef.addEventListener("beforeinstallprompt", this.boundBeforeInstallPrompt);
        this.windowRef.addEventListener("appinstalled", this.boundAppInstalled);
        this.windowCleanup.push(() => this.windowRef.removeEventListener("beforeinstallprompt", this.boundBeforeInstallPrompt));
        this.windowCleanup.push(() => this.windowRef.removeEventListener("appinstalled", this.boundAppInstalled));
      }
      return this;
    }
    onBeforeInstallPrompt(event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      this.deferredInstallPrompt = event;
      this.patchStatus({ installPromptAvailable: true });
      this.emit("installPromptAvailable", { event });
    }
    onAppInstalled() {
      this.deferredInstallPrompt = null;
      this.patchStatus({ installed: true, installPromptAvailable: false });
      this.emit("appInstalled", { installed: true });
    }
    patchStatus(patch2) {
      const prevStatus = this.getStatus();
      this.status = createStatusSnapshot({
        ...this.status,
        ...patch2
      });
      this.emit("statusChange", {
        current: this.getStatus(),
        previous: prevStatus
      });
    }
    setError(error, context) {
      this.patchStatus({
        lastError: {
          message: (error == null ? void 0 : error.message) || String(error),
          context
        }
      });
      this.emit("error", { error, context });
    }
    on(eventName, handler) {
      if (typeof handler !== "function") {
        fail("S016", "PWAService.on() expects a callback function.", {
          context: "pwa.events.on",
          eventName
        });
      }
      if (!this.events.has(eventName)) {
        this.events.set(eventName, /* @__PURE__ */ new Set());
      }
      const handlers = this.events.get(eventName);
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    }
    emit(eventName, payload) {
      const handlers = this.events.get(eventName);
      if (!handlers || handlers.size === 0) {
        return;
      }
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          this.setError(error, "pwa.events.emit");
        }
      }
    }
    cleanupRegistrationListeners() {
      for (const cleanup of this.registrationCleanup) {
        cleanup();
      }
      this.registrationCleanup = [];
    }
    bindRegistration(registration) {
      var _a;
      this.cleanupRegistrationListeners();
      if (!registration) {
        return;
      }
      const onUpdateFound = () => {
        const worker = registration.installing;
        this.patchStatus({ installing: Boolean(worker) });
        this.emit("updateFound", { registration, worker });
        if (!worker || typeof worker.addEventListener !== "function") {
          return;
        }
        const onStateChange = () => {
          var _a2, _b;
          const state = worker.state;
          if (state === "installed") {
            const hasController = Boolean((_b = (_a2 = this.navigatorRef) == null ? void 0 : _a2.serviceWorker) == null ? void 0 : _b.controller);
            const waiting = Boolean(registration.waiting) || hasController;
            this.patchStatus({
              installing: false,
              waiting,
              updateAvailable: waiting,
              active: !waiting
            });
            if (waiting) {
              this.emit("updateAvailable", { registration, worker });
            } else {
              this.emit("installed", { registration, worker });
            }
            return;
          }
          if (state === "activated") {
            this.patchStatus({
              installing: false,
              waiting: false,
              updateAvailable: false,
              active: true
            });
            this.emit("activated", { registration, worker });
            return;
          }
          if (state === "redundant") {
            this.patchStatus({ installing: false });
            this.emit("redundant", { registration, worker });
          }
        };
        worker.addEventListener("statechange", onStateChange);
        this.registrationCleanup.push(() => worker.removeEventListener("statechange", onStateChange));
      };
      if (typeof registration.addEventListener === "function") {
        registration.addEventListener("updatefound", onUpdateFound);
        this.registrationCleanup.push(() => registration.removeEventListener("updatefound", onUpdateFound));
      }
      if (registration.installing) {
        onUpdateFound();
      }
      if (registration.waiting) {
        this.patchStatus({ waiting: true, updateAvailable: true });
        this.emit("updateAvailable", { registration, worker: registration.waiting });
      }
      const serviceWorkerContainer = (_a = this.navigatorRef) == null ? void 0 : _a.serviceWorker;
      if (serviceWorkerContainer && typeof serviceWorkerContainer.addEventListener === "function") {
        const onControllerChange = () => {
          this.patchStatus({ active: true, waiting: false, updateAvailable: false });
          this.emit("controllerChange", { registration: this.registration });
        };
        serviceWorkerContainer.addEventListener("controllerchange", onControllerChange);
        this.registrationCleanup.push(() => serviceWorkerContainer.removeEventListener("controllerchange", onControllerChange));
      }
    }
    async register({ swUrl = "/sw.js", scope = "/" } = {}) {
      var _a;
      this.initialize();
      const serviceWorkerContainer = (_a = this.navigatorRef) == null ? void 0 : _a.serviceWorker;
      if (!serviceWorkerContainer || typeof serviceWorkerContainer.register !== "function") {
        fail("S013", "Service Worker API is not available in this environment.", {
          context: "pwa.register"
        });
      }
      let registration;
      try {
        registration = await serviceWorkerContainer.register(swUrl, { scope });
      } catch (error) {
        fail("S013", "Service worker registration failed.", {
          context: "pwa.register",
          swUrl,
          scope
        }, error);
      }
      this.registration = registration;
      this.patchStatus({
        supported: true,
        registered: true,
        scope: registration.scope || scope,
        lastError: null
      });
      this.bindRegistration(registration);
      if (serviceWorkerContainer.ready && typeof serviceWorkerContainer.ready.then === "function") {
        serviceWorkerContainer.ready.then(() => {
          this.patchStatus({ active: true });
          this.emit("ready", { registration: this.registration });
        }).catch((error) => {
          this.setError(error, "pwa.ready");
        });
      }
      this.emit("registered", { registration });
      return registration;
    }
    async unregister() {
      if (!this.registration) {
        return false;
      }
      let result = true;
      if (typeof this.registration.unregister === "function") {
        try {
          result = await this.registration.unregister();
        } catch (error) {
          fail("S013", "Service worker unregister failed.", {
            context: "pwa.unregister"
          }, error);
        }
      }
      this.cleanupRegistrationListeners();
      this.registration = null;
      this.patchStatus({
        registered: false,
        installing: false,
        waiting: false,
        updateAvailable: false,
        active: false,
        scope: null
      });
      this.emit("unregistered", { result });
      return result;
    }
    async checkForUpdate() {
      if (!this.registration || typeof this.registration.update !== "function") {
        return false;
      }
      try {
        await this.registration.update();
      } catch (error) {
        this.setError(error, "pwa.checkForUpdate");
        throw error;
      }
      if (this.registration.waiting) {
        this.patchStatus({ waiting: true, updateAvailable: true });
        this.emit("updateAvailable", { registration: this.registration, worker: this.registration.waiting });
        return true;
      }
      return this.status.updateAvailable;
    }
    async activateWaitingWorker() {
      if (!this.registration || !this.registration.waiting) {
        return false;
      }
      if (typeof this.registration.waiting.postMessage !== "function") {
        fail("S013", "Waiting service worker does not support postMessage().", {
          context: "pwa.activateWaitingWorker"
        });
      }
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      this.emit("updateActivationRequested", { registration: this.registration, worker: this.registration.waiting });
      return true;
    }
    async promptInstall() {
      const promptEvent = this.deferredInstallPrompt;
      if (!promptEvent) {
        return { outcome: "unavailable" };
      }
      if (typeof promptEvent.prompt !== "function") {
        fail("S013", "Install prompt event is not promptable.", {
          context: "pwa.promptInstall"
        });
      }
      await promptEvent.prompt();
      const userChoice = promptEvent.userChoice ? await promptEvent.userChoice : { outcome: "accepted" };
      if ((userChoice == null ? void 0 : userChoice.outcome) === "accepted") {
        this.patchStatus({ installPromptAvailable: false });
        this.deferredInstallPrompt = null;
      }
      this.emit("installPromptResult", { choice: userChoice });
      return userChoice;
    }
    getStatus() {
      return createStatusSnapshot(this.status);
    }
    getInstallState() {
      return {
        canPrompt: Boolean(this.status.installPromptAvailable && this.deferredInstallPrompt),
        installed: Boolean(this.status.installed)
      };
    }
    destroy() {
      this.cleanupRegistrationListeners();
      for (const cleanup of this.windowCleanup) {
        cleanup();
      }
      this.windowCleanup = [];
      this.events.clear();
      this.registration = null;
      this.deferredInstallPrompt = null;
      this.initialized = false;
      this.patchStatus({
        registered: false,
        installing: false,
        waiting: false,
        updateAvailable: false,
        active: false,
        installPromptAvailable: false
      });
    }
  };

  // src/pwa/index.js
  function createPWAService(options = {}) {
    return new PWAService(options);
  }
  var pwaHelpers = {
    createPWAService,
    PWAService
  };

  // src/sync/snapshot-crypto.js
  var DEFAULT_KDF_ITERATIONS = 21e4;
  var DEFAULT_ALGORITHM = "AES-GCM";
  var SALT_BYTES = 16;
  var IV_BYTES = 12;
  function getCryptoImpl(preferredImpl = null) {
    const cryptoImpl = preferredImpl || globalThis.crypto;
    if (!cryptoImpl || typeof cryptoImpl.getRandomValues !== "function" || !cryptoImpl.subtle) {
      fail("S013", "Web Crypto APIs are required for sync encryption.", {
        context: "sync.crypto.getCrypto"
      });
    }
    return cryptoImpl;
  }
  function toBase64(uint8Value) {
    if (!(uint8Value instanceof Uint8Array)) {
      return "";
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(uint8Value).toString("base64");
    }
    let binary = "";
    for (const value of uint8Value) {
      binary += String.fromCharCode(value);
    }
    if (typeof btoa === "function") {
      return btoa(binary);
    }
    fail("S013", "Unable to encode base64 in this environment.", {
      context: "sync.crypto.toBase64"
    });
  }
  function fromBase64(base64Value) {
    if (typeof base64Value !== "string" || !base64Value) {
      return new Uint8Array();
    }
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(base64Value, "base64"));
    }
    if (typeof atob === "function") {
      const binary = atob(base64Value);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    fail("S013", "Unable to decode base64 in this environment.", {
      context: "sync.crypto.fromBase64"
    });
  }
  function safeStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      fail("S016", "Unable to serialize encrypted snapshot payload.", {
        context: "sync.crypto.stringify"
      }, error);
    }
  }
  function safeParseJSON(rawValue) {
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      fail("S016", "Unable to parse decrypted snapshot payload.", {
        context: "sync.crypto.parse"
      }, error);
    }
  }
  function normalizeAad(aad) {
    if (aad == null) return null;
    const text = typeof aad === "string" ? aad : safeStringify(aad);
    return new TextEncoder().encode(text);
  }
  var SnapshotCrypto = class {
    constructor(config = {}) {
      this.kdfIterations = Number(config.kdfIterations || DEFAULT_KDF_ITERATIONS);
      this.kdfHash = config.kdfHash || "SHA-256";
      this.algorithm = config.algorithm || DEFAULT_ALGORITHM;
      this.cryptoImpl = config.cryptoImpl || null;
    }
    randomBytes(length) {
      const cryptoImpl = getCryptoImpl(this.cryptoImpl);
      const bytes = new Uint8Array(length);
      cryptoImpl.getRandomValues(bytes);
      return bytes;
    }
    async deriveKey(passphrase, saltBase64 = null) {
      const safePassphrase = String(passphrase || "");
      if (!safePassphrase) {
        fail("S016", "A non-empty passphrase is required for sync encryption.", {
          context: "sync.crypto.deriveKey"
        });
      }
      const cryptoImpl = getCryptoImpl(this.cryptoImpl);
      const subtle = cryptoImpl.subtle;
      const salt = saltBase64 ? fromBase64(saltBase64) : this.randomBytes(SALT_BYTES);
      const passphraseBytes = new TextEncoder().encode(safePassphrase);
      const keyMaterial = await subtle.importKey(
        "raw",
        passphraseBytes,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      const key = await subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: this.kdfIterations,
          hash: this.kdfHash
        },
        keyMaterial,
        { name: this.algorithm, length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
      return {
        key,
        salt,
        saltBase64: toBase64(salt)
      };
    }
    async encryptObject(value, { passphrase, aad = null } = {}) {
      const safePassphrase = String(passphrase || "");
      if (!safePassphrase) {
        fail("S016", "encryptObject requires a passphrase.", {
          context: "sync.crypto.encrypt"
        });
      }
      const cryptoImpl = getCryptoImpl(this.cryptoImpl);
      const subtle = cryptoImpl.subtle;
      const { key, saltBase64 } = await this.deriveKey(safePassphrase);
      const iv = this.randomBytes(IV_BYTES);
      const plaintext = new TextEncoder().encode(safeStringify(value));
      const additionalData = normalizeAad(aad);
      const ciphertextBuffer = await subtle.encrypt(
        {
          name: this.algorithm,
          iv,
          additionalData
        },
        key,
        plaintext
      );
      return {
        version: 1,
        alg: this.algorithm,
        kdf: {
          name: "PBKDF2",
          hash: this.kdfHash,
          iterations: this.kdfIterations,
          salt: saltBase64
        },
        iv: toBase64(iv),
        ciphertext: toBase64(new Uint8Array(ciphertextBuffer))
      };
    }
    async decryptObject(envelope, { passphrase, aad = null } = {}) {
      var _a;
      if (!envelope || typeof envelope !== "object") {
        fail("S016", "decryptObject requires an encrypted envelope object.", {
          context: "sync.crypto.decrypt"
        });
      }
      const safePassphrase = String(passphrase || "");
      if (!safePassphrase) {
        fail("S016", "decryptObject requires a passphrase.", {
          context: "sync.crypto.decrypt"
        });
      }
      const salt = (_a = envelope == null ? void 0 : envelope.kdf) == null ? void 0 : _a.salt;
      if (typeof salt !== "string" || !salt) {
        fail("S016", "Encrypted envelope is missing kdf.salt.", {
          context: "sync.crypto.decrypt"
        });
      }
      const iv = fromBase64(envelope.iv || "");
      const ciphertext = fromBase64(envelope.ciphertext || "");
      const cryptoImpl = getCryptoImpl(this.cryptoImpl);
      const subtle = cryptoImpl.subtle;
      const { key } = await this.deriveKey(safePassphrase, salt);
      const additionalData = normalizeAad(aad);
      let plaintextBuffer;
      try {
        plaintextBuffer = await subtle.decrypt(
          {
            name: envelope.alg || this.algorithm,
            iv,
            additionalData
          },
          key,
          ciphertext
        );
      } catch (error) {
        fail("S016", "Unable to decrypt sync payload. Passphrase may be invalid.", {
          context: "sync.crypto.decrypt"
        }, error);
      }
      const plaintext = new TextDecoder().decode(plaintextBuffer);
      return safeParseJSON(plaintext);
    }
  };
  function createSnapshotCrypto(config = {}) {
    return new SnapshotCrypto(config);
  }

  // src/sync/sync-client.js
  function safeJsonParse(rawValue) {
    try {
      return JSON.parse(rawValue);
    } catch (_) {
      return null;
    }
  }
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }
  function normalizeBaseUrl(baseUrl) {
    const value = String(baseUrl || "").trim();
    if (!value) {
      fail("S016", "SyncClient requires a baseUrl.", {
        context: "sync.client.constructor"
      });
    }
    return value.replace(/\/+$/, "");
  }
  function resolveUrl(baseUrl, path) {
    const safePath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
    try {
      return new URL(safePath, baseUrl).toString();
    } catch (_) {
      return `${baseUrl}${safePath}`;
    }
  }
  async function parseResponseBody(response) {
    var _a, _b, _c;
    const contentType = ((_b = (_a = response.headers) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "content-type")) || "";
    if (response.status === 204) {
      return null;
    }
    if (contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    return (_c = safeJsonParse(text)) != null ? _c : text;
  }
  function normalizeErrorPayload(payload, fallbackMessage) {
    if (payload && typeof payload === "object") {
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        return payload.errors.join(", ");
      }
    }
    return fallbackMessage;
  }
  var SyncClient = class {
    constructor(config = {}) {
      this.baseUrl = normalizeBaseUrl(config.baseUrl);
      this.appId = String(config.appId || "").trim();
      if (!this.appId) {
        fail("S016", "SyncClient requires a non-empty appId.", {
          context: "sync.client.constructor"
        });
      }
      this.fetchImpl = typeof config.fetchImpl === "function" ? config.fetchImpl : typeof fetch === "function" ? fetch.bind(globalThis) : null;
      if (typeof this.fetchImpl !== "function") {
        fail("S013", "fetch API is not available in this environment.", {
          context: "sync.client.constructor"
        });
      }
      this.crypto = config.crypto instanceof SnapshotCrypto ? config.crypto : new SnapshotCrypto(config.crypto || {});
      this.defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...config.headers || {}
      };
      this.credentials = config.credentials || "include";
      this.accessToken = null;
      this.passphrase = config.passphrase || null;
    }
    setAccessToken(accessToken) {
      this.accessToken = typeof accessToken === "string" ? accessToken : null;
      return this.accessToken;
    }
    clearAccessToken() {
      this.accessToken = null;
    }
    setPassphrase(passphrase) {
      const safePassphrase = String(passphrase || "");
      if (!safePassphrase) {
        fail("S016", "setPassphrase requires a non-empty passphrase.", {
          context: "sync.client.setPassphrase"
        });
      }
      this.passphrase = safePassphrase;
      return this.passphrase;
    }
    clearPassphrase() {
      this.passphrase = null;
    }
    resolvePassphrase(passphrase) {
      const resolved = passphrase || this.passphrase;
      if (!resolved) {
        fail("S016", "A passphrase is required for sync encryption/decryption.", {
          context: "sync.client.passphrase"
        });
      }
      return resolved;
    }
    async request(path, {
      method = "GET",
      body,
      auth = true,
      retryOnUnauthorized = true,
      headers = {},
      credentials
    } = {}) {
      const url = resolveUrl(this.baseUrl, path);
      const mergedHeaders = {
        ...this.defaultHeaders,
        ...headers
      };
      if (auth && this.accessToken) {
        mergedHeaders.Authorization = `Bearer ${this.accessToken}`;
      }
      const requestInit = {
        method,
        headers: mergedHeaders,
        credentials: credentials || this.credentials
      };
      if (body !== void 0) {
        requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
      }
      let response;
      try {
        response = await this.fetchImpl(url, requestInit);
      } catch (error) {
        report("S014", error, {
          context: "sync.client.request",
          method,
          url
        });
        throw error;
      }
      if (response.status === 401 && auth && retryOnUnauthorized) {
        const refreshed = await this.refresh({ silent: true });
        if (refreshed == null ? void 0 : refreshed.accessToken) {
          return this.request(path, {
            method,
            body,
            auth,
            retryOnUnauthorized: false,
            headers,
            credentials
          });
        }
      }
      const payload = await parseResponseBody(response);
      if (!response.ok) {
        const message = normalizeErrorPayload(payload, `Sync request failed with status ${response.status}.`);
        const statusError = createSynactError("S014", message, {
          context: "sync.client.response",
          method,
          path,
          status: response.status
        });
        report("S014", statusError, statusError.details);
        throw statusError;
      }
      return payload;
    }
    validateCredentials({ email, password }, context) {
      const safeEmail = String(email || "").trim().toLowerCase();
      const safePassword = String(password || "");
      if (!isEmail(safeEmail)) {
        fail("S016", "A valid email is required for sync authentication.", {
          context
        });
      }
      if (safePassword.length < 10) {
        fail("S016", "Password must be at least 10 characters.", {
          context
        });
      }
      return {
        email: safeEmail,
        password: safePassword
      };
    }
    async register({ email, password } = {}) {
      const credentials = this.validateCredentials({ email, password }, "sync.client.register");
      const payload = await this.request("/v1/auth/register", {
        method: "POST",
        body: {
          ...credentials,
          appId: this.appId
        },
        auth: false,
        retryOnUnauthorized: false
      });
      this.setAccessToken((payload == null ? void 0 : payload.accessToken) || null);
      return payload;
    }
    async login({ email, password } = {}) {
      const credentials = this.validateCredentials({ email, password }, "sync.client.login");
      const payload = await this.request("/v1/auth/login", {
        method: "POST",
        body: {
          ...credentials,
          appId: this.appId
        },
        auth: false,
        retryOnUnauthorized: false
      });
      this.setAccessToken((payload == null ? void 0 : payload.accessToken) || null);
      return payload;
    }
    async refresh({ silent = false } = {}) {
      try {
        const payload = await this.request("/v1/auth/refresh", {
          method: "POST",
          body: {
            appId: this.appId
          },
          auth: false,
          retryOnUnauthorized: false
        });
        this.setAccessToken((payload == null ? void 0 : payload.accessToken) || null);
        return payload;
      } catch (error) {
        this.clearAccessToken();
        if (!silent) {
          throw error;
        }
        return null;
      }
    }
    async logout() {
      try {
        await this.request("/v1/auth/logout", {
          method: "POST",
          body: {
            appId: this.appId
          },
          auth: false,
          retryOnUnauthorized: false
        });
      } finally {
        this.clearAccessToken();
      }
      return true;
    }
    async pushSnapshot(snapshot, {
      passphrase,
      metadata = null,
      aad = null
    } = {}) {
      if (!snapshot || typeof snapshot !== "object") {
        fail("S016", "pushSnapshot requires a snapshot object payload.", {
          context: "sync.client.pushSnapshot"
        });
      }
      const encryptedSnapshot = await this.crypto.encryptObject(snapshot, {
        passphrase: this.resolvePassphrase(passphrase),
        aad: aad || this.appId
      });
      return this.request("/v1/sync/blob", {
        method: "PUT",
        body: {
          appId: this.appId,
          metadata,
          encryptedSnapshot
        }
      });
    }
    async pullSnapshot({ passphrase, aad = null } = {}) {
      const response = await this.request(`/v1/sync/blob?appId=${encodeURIComponent(this.appId)}`, {
        method: "GET",
        auth: true
      });
      if (!response || !response.encryptedSnapshot) {
        return null;
      }
      const snapshot = await this.crypto.decryptObject(response.encryptedSnapshot, {
        passphrase: this.resolvePassphrase(passphrase),
        aad: aad || this.appId
      });
      return {
        snapshot,
        meta: {
          appId: response.appId,
          updatedAt: response.updatedAt || null,
          metadata: response.metadata || null
        }
      };
    }
  };
  function createSyncClient(config = {}) {
    return new SyncClient(config);
  }

  // src/sync/sync-session.js
  function resolveStorage(preferredStorage = null) {
    if (preferredStorage && typeof preferredStorage.getItem === "function" && typeof preferredStorage.setItem === "function") {
      return preferredStorage;
    }
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window.localStorage || null;
    } catch (_) {
      return null;
    }
  }
  function safeParseJSON2(rawValue) {
    if (typeof rawValue !== "string" || !rawValue) {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch (_) {
      return null;
    }
  }
  function safeStringify2(value) {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return null;
    }
  }
  function normalizeClientConfig(options = {}) {
    var _a, _b;
    const clientConfig = options.clientConfig && typeof options.clientConfig === "object" ? { ...options.clientConfig } : {};
    const baseUrl = (_a = options.baseUrl) != null ? _a : clientConfig.baseUrl;
    const appId = (_b = options.appId) != null ? _b : clientConfig.appId;
    if (!baseUrl || !appId) {
      return null;
    }
    return {
      ...clientConfig,
      ..."baseUrl" in options ? { baseUrl: options.baseUrl } : {},
      ..."appId" in options ? { appId: options.appId } : {},
      ..."credentials" in options ? { credentials: options.credentials } : {},
      ..."headers" in options ? { headers: options.headers } : {},
      ..."fetchImpl" in options ? { fetchImpl: options.fetchImpl } : {},
      ..."crypto" in options ? { crypto: options.crypto } : {}
    };
  }
  var SyncSession = class {
    constructor(options = {}) {
      this.storage = resolveStorage(options.storage);
      this.storageKey = String(options.storageKey || "synact.sync.session");
      this.persist = options.persist !== false;
      this.dataApi = options.dataApi || null;
      this.client = options.client || null;
      this.clientFactory = typeof options.createClient === "function" ? options.createClient : createSyncClient;
      this.state = {
        configured: Boolean(this.client),
        authenticated: false,
        user: null,
        passphraseSet: false,
        lastSyncAt: null,
        lastSyncDirection: null,
        lastError: null
      };
      if (this.client) {
        if (!(this.client instanceof SyncClient) && typeof this.client.request !== "function") {
          fail("S016", "SyncSession client must be a SyncClient-compatible instance.", {
            context: "sync.session.constructor"
          });
        }
      }
      const nextClientConfig = normalizeClientConfig(options);
      if (!this.client && nextClientConfig) {
        this.configure(nextClientConfig);
      }
    }
    getState() {
      return {
        ...this.state
      };
    }
    setDataApi(dataApi2) {
      this.dataApi = dataApi2;
      return this;
    }
    ensureClient(context = "sync.session") {
      if (!this.client) {
        fail("S016", "SyncSession is not configured. Set baseUrl/appId first.", { context });
      }
      return this.client;
    }
    ensureDataApi(context = "sync.session") {
      if (!this.dataApi || typeof this.dataApi.export !== "function" || typeof this.dataApi.import !== "function") {
        fail("S016", "SyncSession requires SynactJS.data API (init + export/import methods).", { context });
      }
      return this.dataApi;
    }
    configure(config = {}) {
      const nextConfig = normalizeClientConfig(config) || normalizeClientConfig({
        ...config,
        clientConfig: config
      });
      if (!nextConfig) {
        fail("S016", "SyncSession.configure requires baseUrl and appId.", {
          context: "sync.session.configure"
        });
      }
      this.client = this.clientFactory(nextConfig);
      this.state.configured = true;
      this.state.lastError = null;
      return this.client;
    }
    setPassphrase(passphrase) {
      const client = this.ensureClient("sync.session.setPassphrase");
      client.setPassphrase(passphrase);
      this.state.passphraseSet = true;
      this.state.lastError = null;
      return passphrase;
    }
    clearPassphrase() {
      if (!this.client) {
        this.state.passphraseSet = false;
        return;
      }
      this.client.clearPassphrase();
      this.state.passphraseSet = false;
    }
    readPersistedAuth() {
      if (!this.persist || !this.storage) {
        return null;
      }
      return safeParseJSON2(this.storage.getItem(this.storageKey));
    }
    persistAuth({ accessToken, user } = {}) {
      if (!this.persist || !this.storage) {
        return;
      }
      const raw = safeStringify2({
        accessToken: accessToken || null,
        user: user || null,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (raw) {
        this.storage.setItem(this.storageKey, raw);
      }
    }
    clearPersistedAuth() {
      if (!this.storage) {
        return;
      }
      this.storage.removeItem(this.storageKey);
    }
    applyAuthPayload(payload = {}, { remember = this.persist, fallbackUser = null } = {}) {
      const client = this.ensureClient("sync.session.applyAuth");
      const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : null;
      if (!accessToken) {
        this.clearAuthState({ clearStorage: remember });
        return this.getState();
      }
      client.setAccessToken(accessToken);
      const nextUser = payload.user || fallbackUser || this.state.user || null;
      this.state.authenticated = true;
      this.state.user = nextUser;
      this.state.lastError = null;
      if (remember) {
        this.persistAuth({
          accessToken,
          user: nextUser
        });
      }
      return this.getState();
    }
    clearAuthState({ clearStorage = true } = {}) {
      if (this.client) {
        this.client.clearAccessToken();
      }
      this.state.authenticated = false;
      this.state.user = null;
      if (clearStorage) {
        this.clearPersistedAuth();
      }
    }
    async register(credentials = {}, options = {}) {
      const client = this.ensureClient("sync.session.register");
      const remember = options.remember !== false;
      const payload = await client.register(credentials);
      if (options.passphrase) {
        this.setPassphrase(options.passphrase);
      }
      this.applyAuthPayload(payload, {
        remember,
        fallbackUser: (payload == null ? void 0 : payload.user) || null
      });
      return payload;
    }
    async login(credentials = {}, options = {}) {
      const client = this.ensureClient("sync.session.login");
      const remember = options.remember !== false;
      const payload = await client.login(credentials);
      if (options.passphrase) {
        this.setPassphrase(options.passphrase);
      }
      this.applyAuthPayload(payload, {
        remember,
        fallbackUser: (payload == null ? void 0 : payload.user) || null
      });
      return payload;
    }
    async restoreAuth(options = {}) {
      const client = this.ensureClient("sync.session.restoreAuth");
      const {
        refresh = true,
        silent = true
      } = options;
      const persisted = this.readPersistedAuth();
      if (!(persisted == null ? void 0 : persisted.accessToken)) {
        return {
          restored: false,
          refreshed: false,
          payload: null
        };
      }
      client.setAccessToken(persisted.accessToken);
      this.state.authenticated = true;
      this.state.user = persisted.user || null;
      if (!refresh) {
        return {
          restored: true,
          refreshed: false,
          payload: null
        };
      }
      try {
        const payload = await client.refresh({ silent });
        if (payload == null ? void 0 : payload.accessToken) {
          this.applyAuthPayload(payload, {
            remember: true,
            fallbackUser: persisted.user || null
          });
        }
        return {
          restored: true,
          refreshed: Boolean(payload == null ? void 0 : payload.accessToken),
          payload: payload || null
        };
      } catch (error) {
        this.clearAuthState({ clearStorage: true });
        if (!silent) {
          throw error;
        }
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        return {
          restored: false,
          refreshed: false,
          payload: null
        };
      }
    }
    async logout(options = {}) {
      const client = this.ensureClient("sync.session.logout");
      const clearStorage = options.clearStorage !== false;
      try {
        await client.logout();
      } finally {
        this.clearAuthState({ clearStorage });
      }
      return true;
    }
    markSync(direction) {
      this.state.lastSyncAt = (/* @__PURE__ */ new Date()).toISOString();
      this.state.lastSyncDirection = direction;
      this.state.lastError = null;
    }
    async pushDataSnapshot(options = {}) {
      const client = this.ensureClient("sync.session.pushDataSnapshot");
      const dataApi2 = this.ensureDataApi("sync.session.pushDataSnapshot");
      const snapshot = await dataApi2.export(options.exportOptions || {});
      const result = await client.pushSnapshot(snapshot, options);
      this.markSync("push");
      return {
        snapshot,
        result
      };
    }
    async pullDataSnapshot(options = {}) {
      var _a;
      const client = this.ensureClient("sync.session.pullDataSnapshot");
      const dataApi2 = this.ensureDataApi("sync.session.pullDataSnapshot");
      let pulled;
      try {
        pulled = await client.pullSnapshot(options);
      } catch (error) {
        if (Number((_a = error == null ? void 0 : error.details) == null ? void 0 : _a.status) === 404) {
          return {
            snapshot: null,
            report: null,
            meta: null
          };
        }
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
      if (!(pulled == null ? void 0 : pulled.snapshot)) {
        return {
          snapshot: null,
          report: null,
          meta: (pulled == null ? void 0 : pulled.meta) || null
        };
      }
      const report2 = await dataApi2.import(
        pulled.snapshot,
        options.importOptions || {
          mode: "merge",
          onConflict: "newest"
        }
      );
      this.markSync("pull");
      return {
        snapshot: pulled.snapshot,
        report: report2,
        meta: pulled.meta || null
      };
    }
    async syncNow(options = {}) {
      const direction = options.direction || "both";
      if (direction === "push") {
        return {
          push: await this.pushDataSnapshot(options.pushOptions || options)
        };
      }
      if (direction === "pull") {
        return {
          pull: await this.pullDataSnapshot(options.pullOptions || options)
        };
      }
      const pull = await this.pullDataSnapshot(options.pullOptions || options);
      const push = await this.pushDataSnapshot(options.pushOptions || options);
      this.markSync("both");
      return {
        pull,
        push
      };
    }
  };
  function createSyncSession(config = {}) {
    return new SyncSession(config);
  }

  // src/sync/sync-app-service.js
  var DEFAULT_IMPORT_OPTIONS = Object.freeze({
    mode: "merge",
    onConflict: "newest"
  });
  function resolveStorage2(preferredStorage = null) {
    if (preferredStorage && typeof preferredStorage.getItem === "function" && typeof preferredStorage.setItem === "function") {
      return preferredStorage;
    }
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window.localStorage || null;
    } catch (_) {
      return null;
    }
  }
  function safeParseJSON3(rawValue) {
    if (typeof rawValue !== "string" || !rawValue) {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch (_) {
      return null;
    }
  }
  function safeStringify3(value) {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return null;
    }
  }
  function normalizeConfigPatch(patch2 = {}) {
    const value = patch2 && typeof patch2 === "object" ? patch2 : {};
    return {
      baseUrl: "baseUrl" in value ? String(value.baseUrl || "").trim() : void 0,
      appId: "appId" in value ? String(value.appId || "").trim() : void 0,
      email: "email" in value ? String(value.email || "").trim().toLowerCase() : void 0,
      rememberAuth: "rememberAuth" in value ? Boolean(value.rememberAuth) : void 0
    };
  }
  function resolveConfig(baseConfig = {}, patch2 = {}) {
    const normalizedPatch = normalizeConfigPatch(patch2);
    const nextConfig = {
      ...baseConfig,
      ...Object.fromEntries(
        Object.entries(normalizedPatch).filter(([, value]) => value !== void 0)
      )
    };
    nextConfig.baseUrl = String(nextConfig.baseUrl || "").trim();
    nextConfig.appId = String(nextConfig.appId || "").trim();
    nextConfig.email = String(nextConfig.email || "").trim().toLowerCase();
    nextConfig.rememberAuth = nextConfig.rememberAuth !== false;
    return nextConfig;
  }
  var SyncAppService = class {
    constructor(options = {}) {
      this.storage = resolveStorage2(options.storage);
      this.configStorageKey = String(options.configStorageKey || "synact.sync.config");
      this.sessionClientConfig = {
        ...options.clientConfig && typeof options.clientConfig === "object" ? options.clientConfig : {},
        ..."fetchImpl" in options ? { fetchImpl: options.fetchImpl } : {},
        ..."crypto" in options ? { crypto: options.crypto } : {},
        ..."credentials" in options ? { credentials: options.credentials } : {},
        ..."headers" in options ? { headers: options.headers } : {}
      };
      this.defaultConfig = resolveConfig(
        {
          baseUrl: "",
          appId: "",
          email: "",
          rememberAuth: true
        },
        options.defaults || {}
      );
      this.config = { ...this.defaultConfig };
      const session = options.session || createSyncSession({
        dataApi: options.dataApi || null,
        storage: this.storage,
        storageKey: options.sessionStorageKey || "synact.sync.session",
        persist: this.config.rememberAuth,
        ...this.sessionClientConfig
      });
      if (!(session instanceof SyncSession) && typeof (session == null ? void 0 : session.configure) !== "function") {
        fail("S016", "SyncAppService requires a SyncSession-compatible instance.", {
          context: "sync.appService.constructor"
        });
      }
      this.session = session;
      this.state = {
        lastError: null
      };
    }
    setDataApi(dataApi2) {
      if (this.session && typeof this.session.setDataApi === "function") {
        this.session.setDataApi(dataApi2);
      }
      return this;
    }
    readPersistedConfig() {
      if (!this.storage) {
        return null;
      }
      return safeParseJSON3(this.storage.getItem(this.configStorageKey));
    }
    persistConfig() {
      if (!this.storage) {
        return;
      }
      const raw = safeStringify3(this.config);
      if (raw) {
        this.storage.setItem(this.configStorageKey, raw);
      }
    }
    clearPersistedConfig() {
      if (!this.storage) {
        return;
      }
      this.storage.removeItem(this.configStorageKey);
    }
    getConfig() {
      return {
        ...this.config
      };
    }
    getState() {
      return {
        config: this.getConfig(),
        ...this.session.getState(),
        lastError: this.state.lastError
      };
    }
    ensureConfigured(context = "sync.appService") {
      const config = this.getConfig();
      if (!config.baseUrl || !config.appId) {
        fail("S016", "Sync configuration requires baseUrl and appId.", { context });
      }
      return config;
    }
    applyConfig(config) {
      const previousConfig = this.config || {};
      this.config = resolveConfig(this.defaultConfig, config);
      this.session.persist = this.config.rememberAuth;
      if (!this.config.baseUrl || !this.config.appId) {
        return this.getConfig();
      }
      const currentState = typeof this.session.getState === "function" ? this.session.getState() : null;
      const endpointChanged = previousConfig.baseUrl !== this.config.baseUrl || previousConfig.appId !== this.config.appId;
      const needsInitialConfigure = !(currentState == null ? void 0 : currentState.configured);
      if (endpointChanged || needsInitialConfigure) {
        this.session.configure({
          ...this.sessionClientConfig,
          baseUrl: this.config.baseUrl,
          appId: this.config.appId
        });
      }
      if (!this.config.rememberAuth) {
        this.session.clearPersistedAuth();
      }
      return this.getConfig();
    }
    saveConfig(configPatch = {}) {
      const next = resolveConfig(this.config, configPatch);
      this.applyConfig(next);
      this.persistConfig();
      this.state.lastError = null;
      return this.getConfig();
    }
    bootstrap(options = {}) {
      const persistedConfig = this.readPersistedConfig();
      const runtimeConfig = resolveConfig(
        persistedConfig || this.defaultConfig,
        options.config || {}
      );
      this.applyConfig(runtimeConfig);
      this.persistConfig();
      if (options.restoreAuth === false) {
        return Promise.resolve({
          config: this.getConfig(),
          auth: null,
          state: this.getState()
        });
      }
      return this.restoreAuth({
        refresh: options.refresh !== false,
        silent: options.silent !== false
      }).then((auth) => ({
        config: this.getConfig(),
        auth,
        state: this.getState()
      }));
    }
    async restoreAuth(options = {}) {
      this.ensureConfigured("sync.appService.restoreAuth");
      try {
        const result = await this.session.restoreAuth({
          refresh: options.refresh !== false,
          silent: options.silent !== false
        });
        this.state.lastError = null;
        return result;
      } catch (error) {
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
    }
    async authenticate(mode = "login", values = {}, options = {}) {
      var _a, _b, _c;
      this.ensureConfigured("sync.appService.authenticate");
      const action = mode === "register" ? "register" : "login";
      const payload = {
        email: values.email,
        password: values.password
      };
      const remember = (_a = options.remember) != null ? _a : this.config.rememberAuth;
      const passphrase = (_b = options.passphrase) != null ? _b : values.passphrase;
      let authResult;
      if (action === "register") {
        authResult = await this.session.register(payload, { remember, passphrase });
      } else {
        authResult = await this.session.login(payload, { remember, passphrase });
      }
      const nextEmail = String(values.email || "").trim().toLowerCase();
      if (nextEmail && nextEmail !== this.config.email) {
        this.saveConfig({ email: nextEmail });
      }
      let pullResult = null;
      const autoPull = (_c = options.autoPull) != null ? _c : values.autoPull;
      if (autoPull) {
        pullResult = await this.pullData({
          importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS
        });
      }
      this.state.lastError = null;
      return {
        authResult,
        pullResult,
        state: this.getState()
      };
    }
    async logout(options = {}) {
      try {
        await this.session.logout({ clearStorage: options.clearStorage !== false });
        this.session.clearPassphrase();
        this.state.lastError = null;
        return true;
      } catch (error) {
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
    }
    async pushData(options = {}) {
      this.ensureConfigured("sync.appService.pushData");
      try {
        const result = await this.session.pushDataSnapshot({
          metadata: options.metadata || null,
          passphrase: options.passphrase,
          aad: options.aad,
          exportOptions: options.exportOptions || {}
        });
        this.state.lastError = null;
        return result;
      } catch (error) {
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
    }
    async pullData(options = {}) {
      this.ensureConfigured("sync.appService.pullData");
      try {
        const result = await this.session.pullDataSnapshot({
          passphrase: options.passphrase,
          aad: options.aad,
          importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS
        });
        this.state.lastError = null;
        return result;
      } catch (error) {
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
    }
    async sync(options = {}) {
      this.ensureConfigured("sync.appService.sync");
      const direction = options.direction || "both";
      try {
        if (direction === "push") {
          return {
            push: await this.pushData(options.pushOptions || options)
          };
        }
        if (direction === "pull") {
          return {
            pull: await this.pullData(options.pullOptions || options)
          };
        }
        const pull = await this.pullData(options.pullOptions || options);
        const push = await this.pushData(options.pushOptions || options);
        this.state.lastError = null;
        return {
          pull,
          push
        };
      } catch (error) {
        this.state.lastError = (error == null ? void 0 : error.message) || String(error);
        throw error;
      }
    }
  };
  function createSyncAppService(config = {}) {
    return new SyncAppService(config);
  }

  // src/sync/sync-feature-service.js
  var DEFAULT_IMPORT_OPTIONS2 = Object.freeze({
    mode: "merge",
    onConflict: "newest"
  });
  var DEFAULT_SETTINGS_FIELDS = Object.freeze({
    serverUrl: "syncServerUrl",
    appId: "syncAppId",
    email: "syncEmail",
    rememberAuth: "syncRememberAuth",
    autoSyncEnabled: "syncAutoEnabled",
    autoSyncIntervalMinutes: "syncAutoIntervalMinutes",
    autoSyncDirection: "syncAutoDirection"
  });
  var DEFAULT_AUTO_SYNC = Object.freeze({
    enabled: false,
    intervalMinutes: 30,
    direction: "both"
  });
  var AUTO_SYNC_DIRECTIONS = /* @__PURE__ */ new Set(["both", "pull", "push"]);
  function normalizeString(value, fallback = "") {
    if (value === null || value === void 0) {
      return fallback;
    }
    return String(value).trim();
  }
  function normalizeSettingsFields(fields = {}) {
    const resolved = {
      ...DEFAULT_SETTINGS_FIELDS,
      ...fields && typeof fields === "object" ? fields : {}
    };
    return {
      serverUrl: normalizeString(resolved.serverUrl, DEFAULT_SETTINGS_FIELDS.serverUrl),
      appId: normalizeString(resolved.appId, DEFAULT_SETTINGS_FIELDS.appId),
      email: normalizeString(resolved.email, DEFAULT_SETTINGS_FIELDS.email),
      rememberAuth: normalizeString(resolved.rememberAuth, DEFAULT_SETTINGS_FIELDS.rememberAuth),
      autoSyncEnabled: normalizeString(resolved.autoSyncEnabled, DEFAULT_SETTINGS_FIELDS.autoSyncEnabled),
      autoSyncIntervalMinutes: normalizeString(resolved.autoSyncIntervalMinutes, DEFAULT_SETTINGS_FIELDS.autoSyncIntervalMinutes),
      autoSyncDirection: normalizeString(resolved.autoSyncDirection, DEFAULT_SETTINGS_FIELDS.autoSyncDirection)
    };
  }
  function normalizeAutoSyncInterval(value, fallback = DEFAULT_AUTO_SYNC.intervalMinutes) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(5, Math.floor(numeric));
  }
  function normalizeAutoSyncDirection(value, fallback = DEFAULT_AUTO_SYNC.direction) {
    const normalized = normalizeString(value).toLowerCase();
    if (AUTO_SYNC_DIRECTIONS.has(normalized)) {
      return normalized;
    }
    return fallback;
  }
  function cloneObject(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    return {
      ...value
    };
  }
  function ensureObject(value, context) {
    if (!value || typeof value !== "object") {
      fail("S016", "Expected an object result from sync settings hook.", { context });
    }
    return value;
  }
  var SyncFeatureService = class {
    constructor(options = {}) {
      var _a, _b, _c, _d, _e, _f, _g;
      this.fields = normalizeSettingsFields(options.settingsFields || {});
      this.defaults = {
        baseUrl: normalizeString(((_a = options.defaults) == null ? void 0 : _a.baseUrl) || options.baseUrl || ""),
        appId: normalizeString(((_b = options.defaults) == null ? void 0 : _b.appId) || options.appId || ""),
        email: normalizeString(((_c = options.defaults) == null ? void 0 : _c.email) || "").toLowerCase(),
        rememberAuth: ((_d = options.defaults) == null ? void 0 : _d.rememberAuth) !== false
      };
      this.readSettingsFn = typeof options.readSettings === "function" ? options.readSettings : null;
      this.writeSettingsFn = typeof options.writeSettings === "function" ? options.writeSettings : null;
      this.afterPullFn = typeof options.afterPull === "function" ? options.afterPull : null;
      this.persistAuthEmail = options.persistAuthEmail !== false;
      this.pushMetadataFactory = typeof options.pushMetadataFactory === "function" ? options.pushMetadataFactory : null;
      this.autoSyncDefaults = {
        enabled: ((_e = options.autoSync) == null ? void 0 : _e.enabled) === true,
        intervalMinutes: normalizeAutoSyncInterval(
          (_f = options.autoSync) == null ? void 0 : _f.intervalMinutes,
          DEFAULT_AUTO_SYNC.intervalMinutes
        ),
        direction: normalizeAutoSyncDirection(
          (_g = options.autoSync) == null ? void 0 : _g.direction,
          DEFAULT_AUTO_SYNC.direction
        )
      };
      const appService = options.appService || createSyncAppService(options);
      if (!(appService instanceof SyncAppService) && typeof (appService == null ? void 0 : appService.bootstrap) !== "function") {
        fail("S016", "SyncFeatureService requires a SyncAppService-compatible instance.", {
          context: "sync.feature.constructor"
        });
      }
      this.appService = appService;
      this.settings = null;
      this.autoSyncTimer = null;
      this.autoSyncInFlight = null;
      this.autoSyncTick = null;
      this.autoSyncHandlers = {
        onTick: null,
        onError: null,
        onSkipped: null
      };
      this.autoSyncState = {
        enabled: this.autoSyncDefaults.enabled,
        active: false,
        intervalMinutes: this.autoSyncDefaults.intervalMinutes,
        direction: this.autoSyncDefaults.direction,
        lastRunAt: null,
        lastError: null,
        lastSkipReason: null
      };
    }
    setDataApi(dataApi2) {
      var _a;
      if (typeof ((_a = this.appService) == null ? void 0 : _a.setDataApi) === "function") {
        this.appService.setDataApi(dataApi2);
      }
      return this;
    }
    getSettings() {
      return cloneObject(this.settings);
    }
    getSyncState() {
      return this.appService.getState();
    }
    getAutoSyncState() {
      return {
        ...this.autoSyncState
      };
    }
    getState() {
      return {
        settings: this.getSettings(),
        sync: this.getSyncState(),
        autoSync: this.getAutoSyncState()
      };
    }
    resolveConfig(settings = this.settings, patch2 = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const sourceSettings = settings && typeof settings === "object" ? settings : {};
      const sourcePatch = patch2 && typeof patch2 === "object" ? patch2 : {};
      const hasServerPatch = "baseUrl" in sourcePatch || this.fields.serverUrl in sourcePatch;
      const hasAppIdPatch = "appId" in sourcePatch || this.fields.appId in sourcePatch;
      const hasEmailPatch = "email" in sourcePatch || this.fields.email in sourcePatch;
      const hasRememberPatch = "rememberAuth" in sourcePatch || this.fields.rememberAuth in sourcePatch;
      const baseUrl = hasServerPatch ? normalizeString((_a = sourcePatch.baseUrl) != null ? _a : sourcePatch[this.fields.serverUrl]) : normalizeString((_b = sourceSettings[this.fields.serverUrl]) != null ? _b : this.defaults.baseUrl);
      const appId = hasAppIdPatch ? normalizeString((_c = sourcePatch.appId) != null ? _c : sourcePatch[this.fields.appId]) : normalizeString((_d = sourceSettings[this.fields.appId]) != null ? _d : this.defaults.appId);
      const email = (hasEmailPatch ? normalizeString((_e = sourcePatch.email) != null ? _e : sourcePatch[this.fields.email]) : normalizeString((_f = sourceSettings[this.fields.email]) != null ? _f : this.defaults.email)).toLowerCase();
      const rememberAuth = hasRememberPatch ? Boolean((_g = sourcePatch.rememberAuth) != null ? _g : sourcePatch[this.fields.rememberAuth]) : ((_h = sourceSettings[this.fields.rememberAuth]) != null ? _h : this.defaults.rememberAuth) !== false;
      return {
        baseUrl,
        appId,
        email,
        rememberAuth
      };
    }
    toSettingsPatch(config = {}) {
      const resolved = this.resolveConfig({}, config);
      return {
        [this.fields.serverUrl]: resolved.baseUrl || this.defaults.baseUrl,
        [this.fields.appId]: resolved.appId || this.defaults.appId,
        [this.fields.email]: resolved.email,
        [this.fields.rememberAuth]: resolved.rememberAuth
      };
    }
    resolveAutoSyncConfig(settings = this.settings, patch2 = {}) {
      var _a, _b, _c, _d;
      const sourceSettings = settings && typeof settings === "object" ? settings : {};
      const sourcePatch = patch2 && typeof patch2 === "object" ? patch2 : {};
      const hasEnabledPatch = "autoSyncEnabled" in sourcePatch || this.fields.autoSyncEnabled in sourcePatch;
      const hasIntervalPatch = "autoSyncIntervalMinutes" in sourcePatch || this.fields.autoSyncIntervalMinutes in sourcePatch;
      const hasDirectionPatch = "autoSyncDirection" in sourcePatch || this.fields.autoSyncDirection in sourcePatch;
      const enabled = hasEnabledPatch ? Boolean((_a = sourcePatch.autoSyncEnabled) != null ? _a : sourcePatch[this.fields.autoSyncEnabled]) : Boolean((_b = sourceSettings[this.fields.autoSyncEnabled]) != null ? _b : this.autoSyncDefaults.enabled);
      const intervalMinutes = hasIntervalPatch ? normalizeAutoSyncInterval(
        (_c = sourcePatch.autoSyncIntervalMinutes) != null ? _c : sourcePatch[this.fields.autoSyncIntervalMinutes],
        this.autoSyncDefaults.intervalMinutes
      ) : normalizeAutoSyncInterval(
        sourceSettings[this.fields.autoSyncIntervalMinutes],
        this.autoSyncDefaults.intervalMinutes
      );
      const direction = hasDirectionPatch ? normalizeAutoSyncDirection(
        (_d = sourcePatch.autoSyncDirection) != null ? _d : sourcePatch[this.fields.autoSyncDirection],
        this.autoSyncDefaults.direction
      ) : normalizeAutoSyncDirection(
        sourceSettings[this.fields.autoSyncDirection],
        this.autoSyncDefaults.direction
      );
      return {
        enabled,
        intervalMinutes,
        direction
      };
    }
    toAutoSyncSettingsPatch(config = {}) {
      const resolved = this.resolveAutoSyncConfig({}, config);
      return {
        [this.fields.autoSyncEnabled]: resolved.enabled,
        [this.fields.autoSyncIntervalMinutes]: resolved.intervalMinutes,
        [this.fields.autoSyncDirection]: resolved.direction
      };
    }
    async loadSettings(force = false) {
      if (!force && this.settings) {
        return this.getSettings();
      }
      if (!this.readSettingsFn) {
        if (!this.settings) {
          this.settings = {
            ...this.toSettingsPatch(this.defaults),
            ...this.toAutoSyncSettingsPatch(this.autoSyncDefaults)
          };
        }
        const autoSync2 = this.resolveAutoSyncConfig(this.settings);
        this.autoSyncState.enabled = autoSync2.enabled;
        this.autoSyncState.intervalMinutes = autoSync2.intervalMinutes;
        this.autoSyncState.direction = autoSync2.direction;
        return this.getSettings();
      }
      const loaded = await this.readSettingsFn();
      this.settings = cloneObject(ensureObject(loaded, "sync.feature.loadSettings"));
      const autoSync = this.resolveAutoSyncConfig(this.settings);
      this.autoSyncState.enabled = autoSync.enabled;
      this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
      this.autoSyncState.direction = autoSync.direction;
      return this.getSettings();
    }
    async persistSettingsPatch(patch2 = {}) {
      const nextPatch = patch2 && typeof patch2 === "object" ? patch2 : {};
      if (!this.writeSettingsFn) {
        const base = this.settings && typeof this.settings === "object" ? this.settings : {};
        this.settings = {
          ...base,
          ...nextPatch
        };
        const autoSync2 = this.resolveAutoSyncConfig(this.settings);
        this.autoSyncState.enabled = autoSync2.enabled;
        this.autoSyncState.intervalMinutes = autoSync2.intervalMinutes;
        this.autoSyncState.direction = autoSync2.direction;
        return this.getSettings();
      }
      const saved = await this.writeSettingsFn(nextPatch);
      this.settings = cloneObject(ensureObject(saved, "sync.feature.persistSettingsPatch"));
      const autoSync = this.resolveAutoSyncConfig(this.settings);
      this.autoSyncState.enabled = autoSync.enabled;
      this.autoSyncState.intervalMinutes = autoSync.intervalMinutes;
      this.autoSyncState.direction = autoSync.direction;
      return this.getSettings();
    }
    async applySettingsToSync(patch2 = {}) {
      await this.loadSettings(false);
      const config = this.resolveConfig(this.settings, patch2);
      this.appService.saveConfig(config);
      return config;
    }
    async bootstrap(options = {}) {
      const settings = await this.loadSettings(true);
      const config = this.resolveConfig(settings, options.config || {});
      const bootstrapResult = await this.appService.bootstrap({
        ...options,
        config
      });
      return {
        ...bootstrapResult,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    async saveConfig(values = {}) {
      const resolvedConfig = await this.applySettingsToSync(values);
      const resolvedAutoSync = this.resolveAutoSyncConfig(this.settings, values);
      const savedSettings = await this.persistSettingsPatch({
        ...this.toSettingsPatch(resolvedConfig),
        ...this.toAutoSyncSettingsPatch(resolvedAutoSync)
      });
      this.autoSyncState.enabled = resolvedAutoSync.enabled;
      this.autoSyncState.intervalMinutes = resolvedAutoSync.intervalMinutes;
      this.autoSyncState.direction = resolvedAutoSync.direction;
      return {
        config: this.appService.getConfig(),
        settings: savedSettings,
        sync: this.getSyncState()
      };
    }
    async authenticate(mode = "login", values = {}, options = {}) {
      var _a, _b, _c;
      const resolvedConfig = await this.applySettingsToSync();
      const result = await this.appService.authenticate(mode, values, {
        ...options,
        remember: (_a = options.remember) != null ? _a : resolvedConfig.rememberAuth,
        importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS2
      });
      const email = normalizeString((values == null ? void 0 : values.email) || "").toLowerCase();
      if (this.persistAuthEmail && email && email !== normalizeString(((_b = this.settings) == null ? void 0 : _b[this.fields.email]) || "").toLowerCase()) {
        await this.persistSettingsPatch({
          [this.fields.email]: email
        });
      }
      if (((_c = result == null ? void 0 : result.pullResult) == null ? void 0 : _c.snapshot) && this.afterPullFn) {
        await this.afterPullFn(result.pullResult);
      }
      return {
        ...result,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    async restoreAuth(options = {}) {
      await this.applySettingsToSync();
      const restored = await this.appService.restoreAuth(options);
      return {
        ...restored,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    buildPushOptions(options = {}) {
      const next = {
        ...options && typeof options === "object" ? options : {}
      };
      if (!next.metadata && this.pushMetadataFactory) {
        next.metadata = this.pushMetadataFactory();
      }
      return next;
    }
    async pushData(options = {}) {
      await this.applySettingsToSync();
      const result = await this.appService.pushData(this.buildPushOptions(options));
      return {
        result,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    async pullData(options = {}) {
      await this.applySettingsToSync();
      const result = await this.appService.pullData({
        importOptions: options.importOptions || DEFAULT_IMPORT_OPTIONS2,
        ...options && typeof options === "object" ? options : {}
      });
      if ((result == null ? void 0 : result.snapshot) && this.afterPullFn) {
        await this.afterPullFn(result);
      }
      return {
        result,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    async sync(options = {}) {
      var _a;
      await this.applySettingsToSync();
      const direction = options.direction || "both";
      const pullOptions = {
        importOptions: DEFAULT_IMPORT_OPTIONS2,
        ...options.pullOptions || options
      };
      const pushOptions = this.buildPushOptions(options.pushOptions || options);
      const result = await this.appService.sync({
        ...options,
        direction,
        pullOptions,
        pushOptions
      });
      if (((_a = result == null ? void 0 : result.pull) == null ? void 0 : _a.snapshot) && this.afterPullFn) {
        await this.afterPullFn(result.pull);
      }
      return {
        result,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    updateAutoSyncHandlers(options = {}) {
      const source = options && typeof options === "object" ? options : {};
      if (typeof source.onTick === "function") {
        this.autoSyncHandlers.onTick = source.onTick;
      }
      if (typeof source.onError === "function") {
        this.autoSyncHandlers.onError = source.onError;
      }
      if (typeof source.onSkipped === "function") {
        this.autoSyncHandlers.onSkipped = source.onSkipped;
      }
    }
    async runAutoSyncTick(trigger = "interval", options = {}) {
      if (this.autoSyncInFlight) {
        return this.autoSyncInFlight;
      }
      this.autoSyncInFlight = (async () => {
        const syncState = this.getSyncState();
        const config = this.resolveAutoSyncConfig(this.settings, options.patch || {});
        let skippedReason = null;
        if (!config.enabled) {
          skippedReason = "disabled";
        } else if (!syncState.configured || !syncState.authenticated) {
          skippedReason = "not-authenticated";
        } else if (!syncState.passphraseSet) {
          skippedReason = "passphrase-missing";
        }
        if (skippedReason) {
          this.autoSyncState.lastSkipReason = skippedReason;
          if (this.autoSyncHandlers.onSkipped) {
            this.autoSyncHandlers.onSkipped({
              reason: skippedReason,
              trigger,
              state: this.getAutoSyncState()
            });
          }
          return {
            skipped: true,
            reason: skippedReason
          };
        }
        try {
          const result = await this.sync({
            direction: config.direction,
            pullOptions: {
              importOptions: DEFAULT_IMPORT_OPTIONS2
            }
          });
          this.autoSyncState.lastRunAt = (/* @__PURE__ */ new Date()).toISOString();
          this.autoSyncState.lastError = null;
          this.autoSyncState.lastSkipReason = null;
          if (this.autoSyncHandlers.onTick) {
            this.autoSyncHandlers.onTick({
              trigger,
              result,
              state: this.getAutoSyncState()
            });
          }
          return result;
        } catch (error) {
          this.autoSyncState.lastError = (error == null ? void 0 : error.message) || String(error);
          if (this.autoSyncHandlers.onError) {
            this.autoSyncHandlers.onError(error, {
              trigger,
              state: this.getAutoSyncState()
            });
          }
          throw error;
        } finally {
          this.autoSyncInFlight = null;
        }
      })();
      return this.autoSyncInFlight;
    }
    async startAutoSync(options = {}) {
      this.updateAutoSyncHandlers(options);
      await this.loadSettings(false);
      const config = this.resolveAutoSyncConfig(this.settings, options.patch || {});
      this.autoSyncState.enabled = config.enabled;
      this.autoSyncState.intervalMinutes = config.intervalMinutes;
      this.autoSyncState.direction = config.direction;
      this.autoSyncState.lastError = null;
      if (!config.enabled) {
        this.stopAutoSync();
        return {
          started: false,
          reason: "disabled",
          autoSync: this.getAutoSyncState()
        };
      }
      if (this.autoSyncTimer) {
        clearInterval(this.autoSyncTimer);
        this.autoSyncTimer = null;
      }
      this.autoSyncState.active = true;
      this.autoSyncTick = () => this.runAutoSyncTick("interval", { patch: config });
      this.autoSyncTimer = setInterval(() => {
        this.autoSyncTick().catch(() => {
        });
      }, config.intervalMinutes * 60 * 1e3);
      if (options.immediate === true) {
        try {
          await this.runAutoSyncTick("start", { patch: config });
        } catch (error) {
          if (options.throwOnImmediateError === true) {
            throw error;
          }
        }
      }
      return {
        started: true,
        autoSync: this.getAutoSyncState()
      };
    }
    stopAutoSync() {
      if (this.autoSyncTimer) {
        clearInterval(this.autoSyncTimer);
        this.autoSyncTimer = null;
      }
      this.autoSyncTick = null;
      this.autoSyncInFlight = null;
      this.autoSyncState.active = false;
      return {
        stopped: true,
        autoSync: this.getAutoSyncState()
      };
    }
    async logout(options = {}) {
      const result = await this.appService.logout(options);
      return {
        result,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
    setPassphrase(passphrase) {
      var _a;
      const value = normalizeString(passphrase);
      if (!value) {
        fail("S016", "Passphrase is required.", {
          context: "sync.feature.setPassphrase"
        });
      }
      const session = (_a = this.appService) == null ? void 0 : _a.session;
      if (!session || typeof session.setPassphrase !== "function") {
        fail("S016", "Sync session does not support setPassphrase.", {
          context: "sync.feature.setPassphrase"
        });
      }
      session.setPassphrase(value);
      return {
        value,
        settings: this.getSettings(),
        sync: this.getSyncState()
      };
    }
  };
  function createSyncFeatureService(config = {}) {
    return new SyncFeatureService(config);
  }

  // src/sync/index.js
  var syncHelpers = {
    SyncClient,
    SnapshotCrypto,
    SyncSession,
    SyncAppService,
    SyncFeatureService,
    createSyncClient,
    createSnapshotCrypto,
    createSyncSession,
    createSyncAppService,
    createSyncFeatureService
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
    ...browserHelpers,
    ...dataHelpers,
    ...pwaHelpers,
    ...syncHelpers
  };
  var core_default = SynactJSCore;

  // src/public-api.js
  var pwaApi = {
    currentService: null,
    init(options = {}) {
      if (this.currentService) {
        this.currentService.destroy();
      }
      this.currentService = createPWAService(options);
      return this.currentService;
    },
    ensureService(context) {
      if (!this.currentService) {
        this.currentService = createPWAService();
      }
      if (!this.currentService) {
        fail("S013", "Unable to create PWAService instance.", { context });
      }
      return this.currentService;
    },
    get service() {
      return this.currentService;
    },
    on(eventName, handler) {
      return this.ensureService("pwa.api.on").on(eventName, handler);
    },
    async register(options = {}) {
      return this.ensureService("pwa.api.register").register(options);
    },
    async unregister() {
      if (!this.currentService) {
        return false;
      }
      return this.currentService.unregister();
    },
    async checkForUpdate() {
      return this.ensureService("pwa.api.checkForUpdate").checkForUpdate();
    },
    async activateUpdate() {
      return this.ensureService("pwa.api.activateUpdate").activateWaitingWorker();
    },
    async promptInstall() {
      return this.ensureService("pwa.api.promptInstall").promptInstall();
    },
    getStatus() {
      return this.ensureService("pwa.api.getStatus").getStatus();
    },
    getInstallState() {
      return this.ensureService("pwa.api.getInstallState").getInstallState();
    },
    destroy() {
      if (!this.currentService) {
        return;
      }
      this.currentService.destroy();
      this.currentService = null;
    },
    createService: createPWAService,
    PWAService
  };
  var dataApi = {
    currentStore: null,
    currentManager: null,
    async init(config = {}) {
      const store = await createDataStore(config);
      this.currentStore = store;
      this.currentManager = createImportExportManager({ store });
      return store;
    },
    async close() {
      if (!this.currentStore) {
        this.currentManager = null;
        return;
      }
      await this.currentStore.close();
      this.currentStore = null;
      this.currentManager = null;
    },
    get store() {
      return this.currentStore;
    },
    get manager() {
      return this.currentManager;
    },
    ensureStore(context) {
      if (!this.currentStore) {
        fail("S016", "SynactJS.data is not initialized. Call SynactJS.data.init(...) first.", { context });
      }
      return this.currentStore;
    },
    ensureManager(context) {
      if (!this.currentStore || !this.currentManager) {
        fail("S016", "SynactJS.data is not initialized. Call SynactJS.data.init(...) first.", { context });
      }
      return this.currentManager;
    },
    async export(options = {}) {
      const manager = this.ensureManager("data.api.export");
      return manager.exportSnapshot(options);
    },
    validateSnapshot(snapshot, options = {}) {
      const manager = this.ensureManager("data.api.validateSnapshot");
      return manager.validateSnapshot(snapshot, options);
    },
    async import(snapshot, options = {}) {
      const manager = this.ensureManager("data.api.import");
      return manager.importSnapshot(snapshot, options);
    },
    async write(collection, id, payload, options = {}) {
      const store = this.ensureStore("data.api.write");
      return store.write(collection, id, payload, options);
    },
    async read(collection, id) {
      const store = this.ensureStore("data.api.read");
      return store.read(collection, id);
    },
    async update(collection, id, patch2) {
      const store = this.ensureStore("data.api.update");
      return store.update(collection, id, patch2);
    },
    async delete(collection, id) {
      const store = this.ensureStore("data.api.delete");
      return store.delete(collection, id);
    },
    async query(collection, options = {}) {
      const store = this.ensureStore("data.api.query");
      return store.query(collection, options);
    },
    async listRecords(collection = null) {
      const store = this.ensureStore("data.api.listRecords");
      return store.listRecords(collection);
    },
    async listCollections() {
      const store = this.ensureStore("data.api.listCollections");
      return store.listCollections();
    },
    async clearCollection(collection) {
      const store = this.ensureStore("data.api.clearCollection");
      return store.clearCollection(collection);
    },
    async clearAllRecords() {
      const store = this.ensureStore("data.api.clearAllRecords");
      return store.clearAllRecords();
    },
    async fileToDataUrl(file) {
      if (!file || typeof file !== "object") {
        fail("S016", "fileToDataUrl expects a File or Blob value.", {
          context: "data.api.fileToDataUrl"
        });
      }
      if (typeof FileReader === "undefined") {
        fail("S013", "FileReader API is not available in this environment.", {
          context: "data.api.fileToDataUrl"
        });
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("Failed to read file as data URL."));
        reader.readAsDataURL(file);
      });
    },
    async writeImage(collection, id, imageInput, options = {}) {
      var _a;
      let dataUrl = null;
      let mimeType = options.mimeType || null;
      let sizeBytes = options.sizeBytes || null;
      let fileName = options.name || null;
      if (typeof imageInput === "string") {
        dataUrl = imageInput;
      } else if (imageInput && typeof imageInput === "object") {
        dataUrl = await this.fileToDataUrl(imageInput);
        mimeType = mimeType || imageInput.type || null;
        sizeBytes = (_a = sizeBytes != null ? sizeBytes : imageInput.size) != null ? _a : null;
        fileName = fileName || imageInput.name || null;
      }
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
        fail("S016", "writeImage requires a valid data URL string or File/Blob.", {
          context: "data.api.writeImage"
        });
      }
      const payload = {
        __synactType: "image",
        dataUrl,
        mimeType,
        sizeBytes,
        name: fileName,
        alt: options.alt || null,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        meta: options.meta && typeof options.meta === "object" ? options.meta : null
      };
      return this.write(collection, id, payload, options.writeOptions || {});
    },
    async readImage(collection, id) {
      const payload = await this.read(collection, id);
      if (!payload || typeof payload !== "object") {
        return null;
      }
      if (payload.__synactType !== "image" || typeof payload.dataUrl !== "string") {
        return null;
      }
      return payload;
    },
    createStore: createDataStore,
    createImportExportManager,
    createStorageEngine,
    DataStore,
    StorageEngine,
    IndexedDBStorageEngine,
    LocalStorageEngine,
    MigrationRunner,
    ImportExportManager
  };
  var syncApi = {
    currentClient: null,
    currentSession: null,
    currentAppService: null,
    currentFeatureService: null,
    init(config = {}) {
      this.currentClient = createSyncClient(config);
      if (this.currentSession && typeof this.currentSession.configure === "function") {
        this.currentSession.configure(config);
      }
      return this.currentClient;
    },
    destroy() {
      if (this.currentFeatureService && typeof this.currentFeatureService.stopAutoSync === "function") {
        this.currentFeatureService.stopAutoSync();
      }
      this.currentClient = null;
      this.currentSession = null;
      this.currentAppService = null;
      this.currentFeatureService = null;
    },
    get client() {
      return this.currentClient;
    },
    get session() {
      return this.currentSession;
    },
    get appService() {
      return this.currentAppService;
    },
    get featureService() {
      return this.currentFeatureService;
    },
    ensureClient(context) {
      if (!this.currentClient) {
        fail("S016", "SynactJS.sync is not initialized. Call SynactJS.sync.init(...) first.", { context });
      }
      return this.currentClient;
    },
    ensureSession(context) {
      if (!this.currentSession) {
        fail("S016", "SynactJS.sync session is not initialized. Call SynactJS.sync.initSession(...) first.", { context });
      }
      return this.currentSession;
    },
    createSession(config = {}) {
      const resolvedConfig = {
        ...config,
        dataApi: (config == null ? void 0 : config.dataApi) || dataApi
      };
      if (!resolvedConfig.client && this.currentClient) {
        resolvedConfig.client = this.currentClient;
      }
      const session = createSyncSession(resolvedConfig);
      if (session == null ? void 0 : session.client) {
        this.currentClient = session.client;
      }
      return session;
    },
    initSession(config = {}) {
      const session = this.createSession(config);
      this.currentSession = session;
      if (session == null ? void 0 : session.client) {
        this.currentClient = session.client;
      }
      return session;
    },
    createAppService(config = {}) {
      var _a;
      const resolvedConfig = {
        ...config,
        dataApi: (config == null ? void 0 : config.dataApi) || dataApi
      };
      if (!resolvedConfig.session && this.currentSession) {
        resolvedConfig.session = this.currentSession;
      }
      const service = createSyncAppService(resolvedConfig);
      if (service == null ? void 0 : service.session) {
        this.currentSession = service.session;
      }
      if ((_a = service == null ? void 0 : service.session) == null ? void 0 : _a.client) {
        this.currentClient = service.session.client;
      }
      return service;
    },
    initAppService(config = {}) {
      const service = this.createAppService(config);
      this.currentAppService = service;
      return service;
    },
    createFeatureService(config = {}) {
      var _a, _b, _c;
      const resolvedConfig = {
        ...config,
        dataApi: (config == null ? void 0 : config.dataApi) || dataApi
      };
      if (!resolvedConfig.appService && this.currentAppService) {
        resolvedConfig.appService = this.currentAppService;
      }
      if (!resolvedConfig.session && this.currentSession) {
        resolvedConfig.session = this.currentSession;
      }
      const service = createSyncFeatureService(resolvedConfig);
      if (service == null ? void 0 : service.appService) {
        this.currentAppService = service.appService;
      }
      if ((_a = service == null ? void 0 : service.appService) == null ? void 0 : _a.session) {
        this.currentSession = service.appService.session;
      }
      if ((_c = (_b = service == null ? void 0 : service.appService) == null ? void 0 : _b.session) == null ? void 0 : _c.client) {
        this.currentClient = service.appService.session.client;
      }
      return service;
    },
    initFeatureService(config = {}) {
      const service = this.createFeatureService(config);
      this.currentFeatureService = service;
      return service;
    },
    setPassphrase(passphrase) {
      return this.ensureClient("sync.api.setPassphrase").setPassphrase(passphrase);
    },
    clearPassphrase() {
      const client = this.ensureClient("sync.api.clearPassphrase");
      client.clearPassphrase();
    },
    setAccessToken(accessToken) {
      return this.ensureClient("sync.api.setAccessToken").setAccessToken(accessToken);
    },
    clearAccessToken() {
      const client = this.ensureClient("sync.api.clearAccessToken");
      client.clearAccessToken();
    },
    async register(credentials = {}) {
      return this.ensureClient("sync.api.register").register(credentials);
    },
    async login(credentials = {}) {
      return this.ensureClient("sync.api.login").login(credentials);
    },
    async refresh(options = {}) {
      return this.ensureClient("sync.api.refresh").refresh(options);
    },
    async logout() {
      return this.ensureClient("sync.api.logout").logout();
    },
    async restoreAuth(options = {}) {
      return this.ensureSession("sync.api.restoreAuth").restoreAuth(options);
    },
    async syncNow(options = {}) {
      return this.ensureSession("sync.api.syncNow").syncNow(options);
    },
    async pushSnapshot(snapshot, options = {}) {
      return this.ensureClient("sync.api.pushSnapshot").pushSnapshot(snapshot, options);
    },
    async pullSnapshot(options = {}) {
      return this.ensureClient("sync.api.pullSnapshot").pullSnapshot(options);
    },
    async pushDataSnapshot(options = {}) {
      if (!dataApi.manager) {
        fail("S016", "SynactJS.data must be initialized before pushDataSnapshot().", {
          context: "sync.api.pushDataSnapshot"
        });
      }
      const snapshot = await dataApi.export(options.exportOptions || {});
      const result = await this.pushSnapshot(snapshot, options);
      return { snapshot, result };
    },
    async pullDataSnapshot(options = {}) {
      if (!dataApi.manager) {
        fail("S016", "SynactJS.data must be initialized before pullDataSnapshot().", {
          context: "sync.api.pullDataSnapshot"
        });
      }
      const pulled = await this.pullSnapshot(options);
      if (!(pulled == null ? void 0 : pulled.snapshot)) {
        return {
          snapshot: null,
          report: null,
          meta: (pulled == null ? void 0 : pulled.meta) || null
        };
      }
      const report2 = await dataApi.import(pulled.snapshot, options.importOptions || {
        mode: "merge",
        onConflict: "newest"
      });
      return {
        snapshot: pulled.snapshot,
        report: report2,
        meta: pulled.meta || null
      };
    },
    createClient: createSyncClient,
    createSyncSession,
    createSyncAppService,
    createSyncFeatureService,
    createSnapshotCrypto,
    SyncFeatureService,
    SyncAppService,
    SyncSession,
    SyncClient,
    SnapshotCrypto
  };
  function resolveRenderBlock(block, args = {}) {
    if (typeof block === "function") {
      return block(args);
    }
    return block != null ? block : null;
  }
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
      delete container.__synactStartMounted;
      delete container.__synactStartDisposer;
      core_default.unmountContainer(container);
    },
    async start({
      app,
      container = "#app",
      props = {},
      waitForDom = true,
      once = true,
      data = null,
      pwa = null
    } = {}) {
      if (!app) {
        fail("S016", "SynactJS.start() requires an app component or vnode.", {
          context: "public-api.start"
        });
      }
      if (waitForDom && typeof document !== "undefined" && document.readyState === "loading") {
        await new Promise((resolve) => {
          document.addEventListener("DOMContentLoaded", resolve, { once: true });
        });
      }
      if (data) {
        await this.data.init(data);
      }
      if (pwa) {
        if (pwa.init !== false) {
          this.pwa.init(pwa.initOptions || {});
        }
        if (pwa.register === true) {
          await this.pwa.register(pwa.registerOptions || {});
        }
      }
      const resolvedContainer = core_default.resolveContainer(container);
      if (once && resolvedContainer.__synactStartMounted && typeof resolvedContainer.__synactStartDisposer === "function") {
        return resolvedContainer.__synactStartDisposer;
      }
      const disposer = this.render(app, resolvedContainer, props);
      if (once) {
        resolvedContainer.__synactStartMounted = true;
        resolvedContainer.__synactStartDisposer = disposer;
      }
      return disposer;
    },
    lazy(loader, options = {}) {
      if (typeof loader !== "function") {
        fail("S016", "SynactJS.lazy() expects a loader function.", {
          context: "public-api.lazy"
        });
      }
      const {
        fallback = null,
        errorFallback = null
      } = options;
      return function SynactLazyComponent(props = {}) {
        const [state, setState] = core_default.useState(() => ({
          component: null,
          error: null
        }));
        core_default.useEffect(() => {
          let cancelled = false;
          Promise.resolve().then(() => loader()).then((loadedModule) => {
            if (cancelled) return;
            const resolvedComponent = (loadedModule == null ? void 0 : loadedModule.default) || loadedModule;
            if (typeof resolvedComponent !== "function") {
              fail("S016", "lazy loader must resolve to a component function.", {
                context: "public-api.lazy.load"
              });
            }
            setState({
              component: resolvedComponent,
              error: null
            });
          }).catch((error) => {
            if (cancelled) return;
            setState({
              component: null,
              error
            });
          });
          return () => {
            cancelled = true;
          };
        }, []);
        if (state.error) {
          return resolveRenderBlock(errorFallback, { error: state.error, props });
        }
        if (!state.component) {
          return resolveRenderBlock(fallback, { props });
        }
        return core_default.h(state.component, props);
      };
    },
    skeleton(options = {}) {
      const {
        rows = 3,
        rowHeight = 12,
        gap = 10,
        borderRadius = 8,
        width = "100%"
      } = options;
      const safeRows = Math.max(1, Number(rows) || 1);
      const safeGap = Math.max(2, Number(gap) || 8);
      const safeHeight = Math.max(6, Number(rowHeight) || 12);
      const safeRadius = Math.max(0, Number(borderRadius) || 8);
      const lines = [];
      for (let index = 0; index < safeRows; index++) {
        const isLastLine = index === safeRows - 1;
        lines.push(
          core_default.div({
            key: `skeleton-line-${index}`,
            style: {
              height: `${safeHeight}px`,
              width: isLastLine && safeRows > 1 ? "72%" : width,
              borderRadius: `${safeRadius}px`,
              background: "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
              backgroundSize: "220% 100%",
              animation: "synact-shimmer 1.2s ease-in-out infinite"
            }
          })
        );
      }
      return core_default.div(
        {
          style: {
            display: "grid",
            gap: `${safeGap}px`
          }
        },
        ...lines
      );
    },
    configure(config = {}) {
      return configureRuntime(config);
    },
    getConfig() {
      return getRuntimeConfig();
    },
    helpers: browserHelpers,
    pwa: pwaApi,
    data: dataApi,
    sync: syncApi,
    components: []
  };
  function attachBrowserGlobals() {
    if (typeof window === "undefined") {
      return;
    }
    if (!document.getElementById("synact-skeleton-keyframes")) {
      const styleEl = document.createElement("style");
      styleEl.id = "synact-skeleton-keyframes";
      styleEl.textContent = "@keyframes synact-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
      document.head.appendChild(styleEl);
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
