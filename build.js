const { build } = require("esbuild");

build({
  bundle: true,
  entryPoints: ["./src/bin.ts"],
  external: ["autoprefixer", "esbuild-svelte", "esbuild", "svelte-preprocess"],
  format: "cjs",
  minify: true,
  outfile: "./bin.js",
  platform: "node",
  target: "node10",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
