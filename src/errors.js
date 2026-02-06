import { runtime } from "./state.js";

const ERROR_CODES = {
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

export function createSynactError(code, message, details = {}, cause) {
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

export function fail(code, message, details = {}, cause) {
    const error = createSynactError(code, message, details, cause);
    emitError(error, { fatal: true, context: details.context });
    throw error;
}

export function report(code, messageOrError, details = {}, options = {}) {
    const error = normalizeError(code, messageOrError, details);
    emitError(error, { fatal: Boolean(options.fatal), context: details.context });

    if (options.fatal || runtime.config.errorMode === "throw") {
        throw error;
    }

    return error;
}

export function configureRuntime(config = {}) {
    if (config.errorMode && !["console", "throw"].includes(config.errorMode)) {
        fail("S012", "Invalid errorMode. Use \"console\" or \"throw\".", { context: "configure" });
    }

    runtime.config = {
        ...runtime.config,
        ...config
    };

    return { ...runtime.config };
}

export function getRuntimeConfig() {
    return { ...runtime.config };
}
