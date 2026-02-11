const { SynactJS, useState, div } = require("../synact.js");

describe("error system", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        SynactJS.configure({ errorMode: "console", logErrors: false, onError: null });
    });

    afterEach(() => {
        SynactJS.configure({ errorMode: "console", logErrors: true, onError: null });
    });

    it("throws coded error when mount target is invalid", () => {
        function App() {
            return div({}, "x");
        }

        expect(() => SynactJS.render(App, "#does-not-exist")).toThrow(/\[SynactJS:S001\]/);
    });

    it("throws coded error for invalid hook usage", () => {
        expect(() => useState(0)).toThrow(/\[SynactJS:S004\]/);
    });

    it("reports data-prop parse errors through onError callback", () => {
        const onError = jest.fn();
        SynactJS.configure({ onError, logErrors: false, errorMode: "console" });

        document.body.innerHTML = '<div data-component="BrokenProps" data-prop="{invalid"></div>';

        function BrokenProps() {
            return div({}, "ok");
        }

        SynactJS.register(BrokenProps);

        expect(onError).toHaveBeenCalled();
        const [error, payload] = onError.mock.calls[0];
        expect(error.code).toBe("S006");
        expect(payload.context).toBe("mount");
    });

    it("can switch to throw mode for non-fatal runtime reports", () => {
        SynactJS.configure({ errorMode: "throw", logErrors: false });
        document.body.innerHTML = '<div data-component="ThrowProps" data-prop="{invalid"></div>';

        function ThrowProps() {
            return div({}, "ok");
        }

        expect(() => SynactJS.register(ThrowProps)).toThrow(/\[SynactJS:S006\]/);
    });
});
