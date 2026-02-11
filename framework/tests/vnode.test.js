const { h } = require("../synact.js");

describe("vnode module", () => {
    it("creates a vnode with normalized children", () => {
        const vnode = h("div", { id: "foo" }, "a", null, false, ["b", 2]);

        expect(vnode).toEqual({
            __type: "div",
            props: { id: "foo" },
            children: ["a", "b", 2],
            key: null
        });
    });

    it("preserves vnode key", () => {
        const vnode = h("li", { key: "item-1" }, "x");
        expect(vnode.key).toBe("item-1");
    });
});
