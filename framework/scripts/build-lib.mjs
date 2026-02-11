import { build } from "esbuild";

await build({
    entryPoints: ["lib/src/index.js"],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2018"],
    outfile: "lib/synact.lib.js",
    legalComments: "none",
    banner: {
        js: "// Generated from lib/src/index.js. Optional Synact component library."
    }
});
