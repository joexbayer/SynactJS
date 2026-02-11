export const runtime = {
    currentComponent: null,
    contextMap: new Map(),
    contextValues: new Map(),
    componentRegistry: new Map(),
    mountedSignatures: new WeakMap(),
    mountedContainers: new Set(),
    globalContainerId: 0,
    containerIdMap: new WeakMap(),
    CONTEXT_UNSET: Symbol("context_unset"),
    config: {
        errorMode: "console",
        logErrors: true,
        onError: null
    }
};

export function generateContainerId(container) {
    if (!runtime.containerIdMap.has(container)) {
        runtime.containerIdMap.set(container, `/Mount${runtime.globalContainerId++}`);
    }
    return runtime.containerIdMap.get(container);
}

export function cleanupHookCollection(hooks) {
    if (!Array.isArray(hooks)) return;

    for (const hook of hooks) {
        if (hook && typeof hook.cleanup === "function") {
            hook.cleanup();
        }
    }
}
