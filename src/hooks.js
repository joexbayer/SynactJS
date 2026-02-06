import { runtime } from "./state.js";

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

export function useState(initialValue) {
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

export function useEffect(effectFn, deps) {
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
        cleanup: prevHook?.cleanup
    };

    ctx.effects.push(() => {
        if (typeof prevHook?.cleanup === "function") {
            prevHook.cleanup();
        }

        const cleanup = effectFn();
        ctx.hooks[hookIndex].cleanup = typeof cleanup === "function" ? cleanup : undefined;
    });
}

export function useMemo(factory, deps) {
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

export function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
}

export function createContext(defaultValue) {
    const context = {
        id: Symbol("context"),
        defaultValue,
        Provider: null
    };

    function Provider(props = {}) {
        return props.children ?? null;
    }

    Provider.__synactProvider = true;
    Provider.__context = context;
    context.Provider = Provider;

    return context;
}

export function useContext(context) {
    if (runtime.contextValues.has(context.id)) {
        return runtime.contextValues.get(context.id);
    }

    return context.defaultValue;
}
