import { build } from "esbuild";

await build({
    entryPoints: ["plants/app.js"],
    outfile: "plants/app.bundle.js",
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    minify: false,
    logLevel: "info"
});
