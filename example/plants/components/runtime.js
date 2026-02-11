const core = window.SynactJSCore
    || (typeof window.h === "function" && typeof window.useState === "function" ? window : null);

if (!core) {
    throw new Error("SynactJS runtime is not available. Ensure ../../framework/synact.js is loaded before app modules.");
}

export const {
    h,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useForm,
    div,
    main,
    header,
    footer,
    section,
    nav,
    i,
    button,
    h1,
    h2,
    h3,
    p,
    span,
    strong,
    small,
    input,
    textarea,
    label,
    img,
    article,
    ul,
    li
} = core;
