import { build } from "esbuild";

await build({
    entryPoints: ["../example/plants/app.js"],
    outfile: "../example/plants/app.bundle.js",
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    minify: false,
    logLevel: "info"
});
