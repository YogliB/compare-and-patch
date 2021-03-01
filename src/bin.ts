import { red, green } from "chalk";
import { Arguments } from "./models";
import {
  getArguments,
  getOriginFile,
  getParsedPath,
  getTargetFile,
  logHelp,
} from "./utils";
import glob from "tiny-glob";
import { access, copyFile, readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import PQueue from "p-queue";
import { cpus } from "os";

const copyAndPatch = async (originFile: string, targetFile: string) => {
  try {
    const exists = existsSync(targetFile);

    if (!exists) {
      await copyFile(originFile, targetFile);
      console.log(green(`copied ${targetFile}`));
    }

    if (exists) {
      const f1 = await readFile(originFile, { encoding: "utf8" });
      const f2 = await readFile(targetFile, { encoding: "utf8" });

      if (f1.trim().length !== f2.trim().length || f1.trim() !== f2.trim()) {
        await writeFile(targetFile, f1, "utf8");
        console.log(green(`patched ${targetFile}`));
      }
    }
  } catch (error) {
    console.error(red(error));
  }
};

const removeExtraFiles = async (originFile: string, targetFile: string) => {
  try {
    const exists = existsSync(originFile);

    if (!exists) {
      await unlink(targetFile);
      console.log(green(`removed ${targetFile}`));
    }
  } catch (error) {
    console.error(red(error));
  }
};

const main = async () => {
  const { origin, target, help }: Arguments = getArguments();

  if (help || !(origin?.trim() && target?.trim())) {
    logHelp();
    process.exit(0);
  }

  const CONCURRENT_WORKERS = cpus().length;

  try {
    const originPath = join(__dirname, origin);
    const targetPath = join(__dirname, target);

    await access(originPath);
    await access(targetPath);
    const originFiles = await glob(getParsedPath(originPath));
    const targetFiles = await glob(getParsedPath(targetPath));
    let numOfFiles = originFiles.length + targetFiles.length;

    const parallelWorkQueue = new PQueue({ concurrency: CONCURRENT_WORKERS });

    for (const file of originFiles) {
      const filePath = join(__dirname, file);
      const targetFilePath = getTargetFile(originPath, targetPath, filePath);

      parallelWorkQueue
        .add(() => copyAndPatch(filePath, targetFilePath))
        .then(() => {
          numOfFiles -= 1;
          if (numOfFiles === 0) process.exit(0);
        });
    }

    for (const file of targetFiles) {
      const targetFilePath = join(__dirname, file);
      const originFilePath = getOriginFile(
        originPath,
        targetPath,
        targetFilePath
      );

      parallelWorkQueue
        .add(() => removeExtraFiles(originFilePath, targetFilePath))
        .then(() => {
          numOfFiles -= 1;
          if (numOfFiles === 0) process.exit(0);
        });
    }
  } catch (error: any) {
    console.error(red(error));
  }
};

main();
