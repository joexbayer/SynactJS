const fs = require("fs");
const path = require("path");

describe("SynactLib bundle", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        document.documentElement.className = "";
        window.SynactLib = undefined;
    });

    it("exposes expanded component API on window.SynactLib", () => {
        require("../synact.js");
        const libPath = path.join(__dirname, "..", "lib", "synact.lib.js");
        const source = fs.readFileSync(libPath, "utf8");
        // eslint-disable-next-line no-eval
        eval(source);

        expect(window.SynactLib).toBeTruthy();

        const expected = [
            "AppShell",
            "Grid",
            "Stack",
            "Card",
            "StatCard",
            "DataTable",
            "KeyValueList",
            "EmptyState",
            "Badge",
            "Button",
            "Input",
            "Textarea",
            "SelectField",
            "Switch",
            "Progress",
            "Alert",
            "Divider",
            "Kbd",
            "SparkBars",
            "Toolbar",
            "Tabs",
            "Accordion",
            "Modal",
            "ClipboardButton",
            "ShareButton",
            "NetworkStatusBadge",
            "ThemeToggle",
            "FileDropzone",
            "GeolocationCard"
        ];

        for (const key of expected) {
            expect(typeof window.SynactLib[key]).toBe("function");
        }
    });
});
