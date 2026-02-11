const { h, createElement, patch, SynactJS } = require("../synact.js");
const { resetDOM } = require("./helpers");

describe("renderer module", () => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        resetDOM();
    });

    it("creates element and text nodes", () => {
        const node = createElement(h("div", { id: "x" }, "hello"));
        const text = createElement("text");

        expect(node.tagName).toBe("DIV");
        expect(node.id).toBe("x");
        expect(node.textContent).toBe("hello");
        expect(text.nodeType).toBe(Node.TEXT_NODE);
    });

    it("throws when createElement is called with functional root vnode", () => {
        function Comp() {
            return h("div", {}, "x");
        }

        SynactJS.configure({ logErrors: false });
        expect(() => createElement(h(Comp))).toThrow();
        SynactJS.configure({ logErrors: true });
    });

    it("patches append, replace, and remove", () => {
        patch(container, h("div", {}, "a"), null);
        expect(container.innerHTML).toBe("<div>a</div>");

        patch(container, h("span", {}, "b"), h("div", {}, "a"));
        expect(container.innerHTML).toBe("<span>b</span>");

        patch(container, null, h("span", {}, "b"));
        expect(container.innerHTML).toBe("");
    });

    it("patches child lists", () => {
        patch(container, h("ul", {}, h("li", {}, "a")), null);
        patch(
            container,
            h("ul", {}, h("li", {}, "a"), h("li", {}, "b")),
            h("ul", {}, h("li", {}, "a"))
        );

        expect(container.querySelectorAll("li").length).toBe(2);
    });
});
