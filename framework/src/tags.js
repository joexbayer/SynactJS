import { h } from "./vnode.js";

const tag = (name) => (props, ...children) => h(name, props || {}, ...children);

const tagNames = [
    "div", "h1", "h2", "h3", "h4", "h5", "p", "button", "strong", "span", "ul", "li", "input", "form", "label",
    "a", "nav", "hr", "i", "section", "pre", "code", "img", "table", "thead", "tbody", "tr", "td", "th", "footer",
    "header", "main", "textarea", "select", "option", "svg", "br", "small", "ol", "dl", "dt", "dd", "fieldset", "article"
];

export const tagHelpers = Object.fromEntries(tagNames.map((tagName) => [tagName, tag(tagName)]));
