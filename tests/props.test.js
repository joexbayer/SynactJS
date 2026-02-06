const { setProps, updateProps } = require("../synact.js");

describe("props module", () => {
    let el;

    beforeEach(() => {
        el = document.createElement("div");
    });

    it("sets className and style object", () => {
        setProps(el, {
            className: "a b",
            style: { backgroundColor: "red", marginTop: "4px" }
        });

        expect(el.getAttribute("class")).toBe("a b");
        expect(el.style.backgroundColor).toBe("red");
        expect(el.style.marginTop).toBe("4px");
    });

    it("sets and updates event handlers", () => {
        const fnA = jest.fn();
        const fnB = jest.fn();

        setProps(el, { onClick: fnA });
        el.click();

        updateProps(el, { onClick: fnB }, { onClick: fnA });
        el.click();

        expect(fnA).toHaveBeenCalledTimes(1);
        expect(fnB).toHaveBeenCalledTimes(1);
    });

    it("removes stale attributes", () => {
        setProps(el, { id: "x", title: "before" });
        updateProps(el, { id: "y" }, { id: "x", title: "before" });

        expect(el.id).toBe("y");
        expect(el.hasAttribute("title")).toBe(false);
    });
});
