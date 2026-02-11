import { build } from "esbuild";

await build({
  entryPoints: ["src/main.js"],
  outfile: "dist/app.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  sourcemap: true,
  minify: true,
  logLevel: "info"
});
