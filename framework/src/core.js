import { runtime } from "./state.js";
import { h } from "./vnode.js";
import { setProps, updateProps } from "./props.js";
import { useState, useEffect, useContext, useMemo, useCallback, createContext } from "./hooks.js";
import { createElement, patch, renderApp, unmountContainer } from "./renderer.js";
import { mountComponents, resolveContainer } from "./mount.js";
import { useRouter, RouteView, Fragment } from "./router.js";
import { tagHelpers } from "./tags.js";
import { browserHelpers } from "./browser.js";
import { dataHelpers } from "./data/index.js";
import { pwaHelpers } from "./pwa/index.js";
import { syncHelpers } from "./sync/index.js";

const SynactJSCore = {
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

export default SynactJSCore;
