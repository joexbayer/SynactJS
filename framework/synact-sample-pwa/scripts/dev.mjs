import { context } from "esbuild";

const ctx = await context({
  entryPoints: ["src/main.js"],
  outfile: "dist/app.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  sourcemap: true,
  minify: false,
  logLevel: "info"
});

await ctx.watch();
const { host, port } = await ctx.serve({ servedir: "." });

console.log(`Synact dev server running at http://${host}:${port}`);
