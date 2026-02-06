import { useState, useEffect } from "./hooks.js";
import { h } from "./vnode.js";
import { report } from "./errors.js";

export function useRouter(urlPrefix = "") {
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

export function Fragment(props = {}) {
    return props.children ?? null;
}

export function RouteView({ routes, prefix = "" }) {
    const [route] = useRouter(prefix);
    const match = routes?.[route] || routes?.["*"];
    return h("div", {}, typeof match === "function" ? match() : null);
}
