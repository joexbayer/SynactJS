import { useState, useEffect, useMemo, useCallback } from "./hooks.js";
import { fail, report, createSynactError } from "./errors.js";

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);
const JSON_SERIALIZE = (value) => JSON.stringify(value);
const JSON_DESERIALIZE = (value) => JSON.parse(value);

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

export async function parseResponse(response, parseMode = "json") {
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

export function createHttpClient(config = {}) {
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

        const finalInit = typeof beforeRequest === "function"
            ? (await beforeRequest({ ...requestInit }, url)) || requestInit
            : requestInit;

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
            const requestInit = { ...init, method: "POST", body: body ?? init.body };
            const { data } = await requestAndParse(path, requestInit, "json", options);
            return data;
        },
        async put(path, body, init = {}, options = {}) {
            const requestInit = { ...init, method: "PUT", body: body ?? init.body };
            const { data } = await requestAndParse(path, requestInit, "json", options);
            return data;
        },
        async patch(path, body, init = {}, options = {}) {
            const requestInit = { ...init, method: "PATCH", body: body ?? init.body };
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

export function useFetch(input, options = {}) {
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
        const requestId = control.requestId + 1;
        control.requestId = requestId;

        abort();

        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        control.controller = controller;

        const resolvedUrl = resolveFetchUrl(override.input ?? input);
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
            if (error?.name === "AbortError") {
                return null;
            }

            const normalizedError = error?.code ? error : report("S014", error, {
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

        execute().catch(() => {});
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

export function useEventListener(target, eventName, handler, options) {
    useEffect(() => {
        if (!eventName || typeof handler !== "function") {
            return undefined;
        }

        const eventTarget = resolveEventTarget(target);
        if (!eventTarget || typeof eventTarget.addEventListener !== "function") {
            return undefined;
        }

        const listener = (event) => handler(event);
        eventTarget.addEventListener(eventName, listener, options);
        return () => {
            eventTarget.removeEventListener(eventName, listener, options);
        };
    }, [target, eventName, handler, options]);
}

export function useTimeout(callback, delay, deps = EMPTY_ARRAY) {
    const extraDeps = ensureArray(deps, "useTimeout.deps");
    useEffect(() => {
        if (delay == null || delay === false) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            callback();
        }, Number(delay));

        return () => clearTimeout(timeoutId);
    }, [callback, delay, ...extraDeps]);
}

export function useInterval(callback, delay, deps = EMPTY_ARRAY) {
    const extraDeps = ensureArray(deps, "useInterval.deps");
    useEffect(() => {
        if (delay == null || delay === false) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            callback();
        }, Number(delay));

        return () => clearInterval(intervalId);
    }, [callback, delay, ...extraDeps]);
}

export function usePolling(callback, intervalMs, options = {}) {
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

export function useDebouncedValue(value, delay = 250) {
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

export function useForm(options = {}) {
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
            let nextValue;

            if (typeof parse === "function") {
                nextValue = parse(event, values[name]);
            } else if (isCheckbox) {
                nextValue = Boolean(event?.target?.checked);
            } else if (isFile) {
                nextValue = event?.target?.files?.[0] ?? null;
            } else {
                nextValue = event?.target?.value;
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
            value: values[name] ?? "",
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

export function useStorageState(key, initialValue, options = {}) {
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
                if (resolvedValue === undefined) {
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
            return undefined;
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

export function useLocalStorage(key, initialValue, options = {}) {
    return useStorageState(key, initialValue, { ...options, storage: "local" });
}

export function useSessionStorage(key, initialValue, options = {}) {
    return useStorageState(key, initialValue, { ...options, storage: "session" });
}

export function useOnlineStatus() {
    const [online, setOnline] = useState(() => {
        if (typeof navigator === "undefined") {
            return true;
        }
        return navigator.onLine !== false;
    });

    useEventListener(() => (typeof window !== "undefined" ? window : null), "online", () => setOnline(true));
    useEventListener(() => (typeof window !== "undefined" ? window : null), "offline", () => setOnline(false));

    return online;
}

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return false;
        }
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (!query || typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return undefined;
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

export function createWebSocket(url, options = {}) {
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
    const messageSubscribers = new Set();
    const statusSubscribers = new Set();

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
                    // Keep string payload when message is not JSON.
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

    function close(code = 1000, reason = "SynactJS closed connection") {
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

export function useWebSocket(url, options = {}) {
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
            websocket.close(1000, "SynactJS component cleanup");
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

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Number(ms)));
}

export const browserHelpers = {
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
