import { red, green } from "chalk";
import { Arguments } from "./models";
import { getArguments, getParsedPath, getTargetFile, logHelp } from "./utils";
import glob from "tiny-glob";
import { access, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { createPatch } from "diff";
import { join, parse } from "path";

const main = async () => {
  const { origin, target, help }: Arguments = getArguments();

  if (help || !(origin?.trim() && target?.trim())) {
    logHelp();
    process.exit(0);
  }

  try {
    const originPath = join(__dirname, origin);
    const targetPath = join(__dirname, target);

    await access(originPath);
    await access(targetPath);
    const originFiles = await glob(getParsedPath(originPath));
    const targetFiles = await glob(getParsedPath(targetPath));

    for (const file of originFiles) {
      const filePath = join(__dirname, file);

      const targetFilePath = getTargetFile(originPath, targetPath, filePath);
      const exists = existsSync(targetFilePath);

      if (!exists) await copyFile(filePath, targetFilePath);
    }
  } catch (error: any) {
    console.error(red(error));
  }
};

main();
