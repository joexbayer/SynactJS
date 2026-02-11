const { SynactJS, button, useState } = require("../synact.js");
const { flushMicrotasks, resetDOM } = require("./helpers");

describe("mount module", () => {
    afterEach(() => {
        resetDOM();
    });

    it("register mounts data-component elements", async () => {
        document.body.innerHTML = '<div data-component="MountCounter"></div>';

        function MountCounter() {
            const [count, setCount] = useState(0);
            return button({ onClick: () => setCount(count + 1) }, String(count));
        }

        SynactJS.register(MountCounter);

        const btn = document.querySelector("button");
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe("0");

        btn.click();
        await flushMicrotasks();
        expect(document.body.textContent).toContain("1");
    });

    it("register reads data-prop JSON", () => {
        document.body.innerHTML = '<div data-component="LabelComp" data-prop=\'{"label":"Hello"}\'></div>';

        function LabelComp({ label }) {
            return button({}, label);
        }

        SynactJS.register(LabelComp);
        expect(document.body.textContent).toContain("Hello");
    });
});
