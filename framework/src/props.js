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
        el.value = value ?? "";
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
            // Fall back to attribute assignment when direct prop assignment fails.
        }
    }

    el.setAttribute(key, String(value));
}

export function setProps(el, props) {
    for (const [key, value] of Object.entries(props || {})) {
        setProp(el, key, value);
    }
}

export function updateProps(el, newProps, oldProps) {
    if (!el) return;

    const nextProps = newProps || {};
    const prevProps = oldProps || {};
    const allKeys = new Set([...Object.keys(nextProps), ...Object.keys(prevProps)]);

    for (const key of allKeys) {
        const nextValue = nextProps[key];
        const prevValue = prevProps[key];

        if (Object.is(nextValue, prevValue)) {
            continue;
        }

        setProp(el, key, nextValue);
    }
}
