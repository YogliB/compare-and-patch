import { red, green } from "chalk";
import { Options } from "./models";
import {
  getOriginFile,
  getParsedPath,
  getTargetFile,
  presentLoader,
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

const copyAndPatch = async (
  originFile: string,
  targetFile: string,
  verbose: boolean
) => {
  try {
    const exists = existsSync(targetFile);

    if (!exists) {
      await mkdir(parse(targetFile).dir, { recursive: true });
      await copyFile(originFile, targetFile);
      if (verbose) console.log(green(`copied ${targetFile}`));
    }

    if (exists) {
      const isBinary = await isBinaryFile(originFile);
      if (!isBinary) {
        const f1 = await readFile(originFile, { encoding: "utf8" });
        const f2 = await readFile(targetFile, { encoding: "utf8" });

        if (f1.trim().length !== f2.trim().length || f1.trim() !== f2.trim()) {
          await writeFile(targetFile, f1, "utf8");
          if (verbose) console.log(green(`patched ${targetFile}`));
        }
      } else {
        const f1 = await readFile(originFile);
        const f2 = await readFile(targetFile);

        if (f1.length !== f2.length || !f1.equals(f2)) {
          await writeFile(targetFile, f1);
          if (verbose) console.log(green(`patched ${targetFile}`));
        }
      }
    }
  } catch (error) {
    console.error(red(error));
  }
};

const removeExtraFiles = async (
  originFile: string,
  targetFile: string,
  verbose: boolean
) => {
  try {
    const exists = existsSync(originFile);

    if (!exists) {
      await unlink(targetFile);
      if (verbose) console.log(green(`removed ${targetFile}`));
    }
  } catch (error) {
    console.error(red(error));
  }
};

export const compareAndPatch = async (options: Options) => {
  const { origin, target, keep, verbose, silent } = options;

  if (!origin?.trim()) throw "Missing origin directory path";

  if (!target?.trim()) throw "Missing target directory path";

  if (silent) console.log = console.error = () => {};

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
    let timeout = presentLoader("Mapping origin directory...");
    const originFiles = await glob(getParsedPath(originPath));
    clearInterval(timeout);
    let t1 = performance.now();
    console.log(
      `\nMapping origin directory took ${Math.round(t1 - t0)} milliseconds.`
    );

    t0 = performance.now();
    timeout = presentLoader("Mapping target directory...");
    const targetFiles = await glob(getParsedPath(targetPath));
    clearInterval(timeout);
    t1 = performance.now();
    console.log(
      `\nMapping target directory took ${Math.round(t1 - t0)} milliseconds.`
    );

    let numOfOriginFiles = originFiles.length;
    const parallelWorkQueue = new PQueue({ concurrency: CONCURRENT_WORKERS });

    t0 = performance.now();
    timeout = presentLoader("Copying and patching files...");
    await new Promise<void>(async (resolve, _) => {
      for (const file of originFiles) {
        if ((await lstat(file)).isDirectory()) {
          numOfOriginFiles -= 1;
          continue;
        }

        try {
          await access(file);
        } catch (error) {
          console.error(red(error));
          continue;
        }

        const filePath = join(cwd, file);
        const targetFilePath = getTargetFile(originPath, targetPath, filePath);

        parallelWorkQueue.add(async () => {
          await copyAndPatch(filePath, targetFilePath, !!verbose);
          numOfOriginFiles -= 1;
          if (numOfOriginFiles === 0) {
            resolve();
          }
        });
      }
    });
    clearInterval(timeout);
    t1 = performance.now();
    console.log(
      `\nCopying and patching took ${Math.round(t1 - t0)} milliseconds.`
    );

    if (!keep) {
      if (originFiles.toString() === targetFiles.toString()) return;

      t0 = performance.now();
      timeout = presentLoader("Removing extra files...");

      let numOfTargetFiles = targetFiles.length;

      await new Promise<void>(async (resolve, _) => {
        for (const file of targetFiles) {
          if ((await lstat(file)).isDirectory()) {
            numOfTargetFiles -= 1;
            continue;
          }

          const targetFilePath = join(cwd, file);
          const originFilePath = getOriginFile(
            originPath,
            targetPath,
            targetFilePath
          );

          parallelWorkQueue.add(async () => {
            await removeExtraFiles(originFilePath, targetFilePath, !!verbose);
            numOfTargetFiles -= 1;
            if (numOfTargetFiles === 0) resolve();
          });
        }
      });

      clearInterval(timeout);
      t1 = performance.now();
      console.log(
        `\nRemoving extra files took ${Math.round(t1 - t0)} milliseconds.`
      );
    }
  } catch (error: any) {
    console.error(red(error));
  }
};
