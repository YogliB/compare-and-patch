import { Arguments } from "./models";
import { getArguments, logHelp } from "./utils";
import { compareAndPatch } from "./index";
import { watch as watchFiles } from "chokidar";
import { join } from "path";
import { red } from "chalk";
import { access } from "fs/promises";
const cwd = process.cwd();

const main = async () => {
  const {
    help,
    origin,
    target,
    silent,
    verbose,
    watch,
  }: Arguments = getArguments();

  if (help || !(origin?.trim() && target?.trim())) {
    logHelp();
    process.exit(0);
  }

  const originPath = join(cwd, origin);

  try {
    await access(originPath);
  } catch (error) {
    console.error(red(error));
  }

  if (watch) {
    console.log("Watching for changes...");
    watchFiles(originPath).on("change", () => {
      compareAndPatch({ origin, target, verbose, silent });
    });
  } else compareAndPatch({ origin, target, verbose, silent });
};

main();
