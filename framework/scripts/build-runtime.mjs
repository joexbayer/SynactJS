import { build } from "esbuild";

await build({
    entryPoints: ["src/index.js"],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2018"],
    outfile: "synact.js",
    legalComments: "none",
    banner: {
        js: "// Generated from src/index.js. Do not edit synact.js directly."
    },
    logOverride: {
        "commonjs-variable-in-esm": "silent"
    }
});
