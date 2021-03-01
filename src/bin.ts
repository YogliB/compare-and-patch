import { red, green } from "chalk";
import { Arguments } from "./models";
import { getArguments, getParsedPath, getTargetFile, logHelp } from "./utils";
import glob from "tiny-glob";
import { access } from "fs/promises";
import { existsSync } from "fs";
import { createPatch } from "diff";

const main = async () => {
  const { origin, target, help }: Arguments = getArguments();

  if (help || !(origin?.trim() && target?.trim())) {
    logHelp();
    process.exit(0);
  }

  try {
    await access(origin);
    await access(target);
    let originFiles = await glob(getParsedPath(origin));
    let targetFiles = await glob(getParsedPath(target));

    for (const file of originFiles) {
      if (targetFiles.includes(getTargetFile(origin, target, file))) {
      }
    }
  } catch (error: any) {
    console.error(red(error));
  }
};

main();
