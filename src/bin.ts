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
import {
  access,
  copyFile,
  readFile,
  writeFile,
  unlink,
  mkdir,
  lstat,
} from "fs/promises";
import { existsSync } from "fs";
import { join, parse } from "path";
import PQueue from "p-queue";
import { cpus } from "os";
import { isBinaryFile } from "isbinaryfile";
import { performance } from "perf_hooks";

const cwd = process.cwd();

const copyAndPatch = async (originFile: string, targetFile: string) => {
  try {
    const exists = existsSync(targetFile);

    if (!exists) {
      await mkdir(parse(targetFile).dir, { recursive: true });
      await copyFile(originFile, targetFile);
      console.log(green(`copied ${targetFile}`));
    }

    if (exists) {
      const isBinary = await isBinaryFile(originFile);
      if (!isBinary) {
        const f1 = await readFile(originFile, { encoding: "utf8" });
        const f2 = await readFile(targetFile, { encoding: "utf8" });

        if (f1.trim().length !== f2.trim().length || f1.trim() !== f2.trim()) {
          await writeFile(targetFile, f1, "utf8");
          console.log(green(`patched ${targetFile}`));
        }
      } else {
        const f1 = await readFile(originFile);
        const f2 = await readFile(targetFile);

        if (f1.length !== f2.length || !f1.equals(f2)) {
          await writeFile(targetFile, f1);
          console.log(green(`patched ${targetFile}`));
        }
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
    const originPath = join(cwd, origin);
    const targetPath = join(cwd, target);

    await access(originPath);
    try {
      await access(targetPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        await mkdir(targetPath);
      }
    }

    let t0 = performance.now();
    const originFiles = await glob(getParsedPath(originPath));
    let t1 = performance.now();
    console.log(`Mapping origin directory took ${t1 - t0} milliseconds.`);

    t0 = performance.now();
    const targetFiles = await glob(getParsedPath(targetPath));
    t1 = performance.now();
    console.log(`Mapping target directory took ${t1 - t0} milliseconds.`);

    let numOfFiles = originFiles.length + targetFiles.length;

    const parallelWorkQueue = new PQueue({ concurrency: CONCURRENT_WORKERS });

    for (const file of originFiles) {
      if ((await lstat(file)).isDirectory()) continue;

      try {
        await access(file);
      } catch (error) {
        console.error(red(error));
        continue;
      }

      const filePath = join(cwd, file);
      const targetFilePath = getTargetFile(originPath, targetPath, filePath);

      parallelWorkQueue
        .add(() => copyAndPatch(filePath, targetFilePath))
        .then(() => {
          numOfFiles -= 1;
          if (numOfFiles === 0) process.exit(0);
        });
    }

    for (const file of targetFiles) {
      if ((await lstat(file)).isDirectory()) continue;

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
