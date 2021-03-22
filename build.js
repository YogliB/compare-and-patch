const { build } = require("esbuild");

build({
  bundle: true,
  entryPoints: ["./src/index.ts", "./src/bin.ts"],
  external: [],
  format: "cjs",
  minify: true,
  platform: "node",
  target: "node10",
  outdir: "./dist",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
