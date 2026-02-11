import { useState, useEffect } from "./hooks.js";
import { h } from "./vnode.js";
import { report } from "./errors.js";

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

export function useRouter(urlPrefix = "") {
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

export function Fragment(props = {}) {
    return props.children ?? null;
}

export function RouteView({ routes, prefix = "" }) {
    const [route] = useRouter(prefix);
    const pathname = route.split(/[?#]/)[0] || "/";
    const match = routes?.[route] || routes?.[pathname] || routes?.["*"];
    return h("div", {}, typeof match === "function" ? match() : null);
}
