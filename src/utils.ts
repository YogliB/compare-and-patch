import mri from "mri";
import { Arguments } from "./models";
import { readFileSync } from "fs";
import { bold, underline, cyan } from "chalk";
import { join, parse } from "path";

export const getArguments = (): Arguments => {
  const argv = process.argv.slice(2);
  const { help, origin, target, keep, silent, verbose, watch } = mri(argv, {
    alias: {
      h: "help",
      k: "keep",
      o: "origin",
      s: "silent",
      t: "target",
      v: "verbose",
      w: "watch",
    },
  });

  return { help, origin, target, keep, silent, verbose, watch };
};

export const logHelp = () => {
  const help = readFileSync(join("../help.md"), "utf-8")
    .replace(/^(\s*)#+ (.+)/gm, (m, s, _) => s + bold(_))
    .replace(/_([^_]+)_/g, (m, _) => underline(_))
    .replace(/`([^`]+)`/g, (m, _) => cyan(_));

  process.stdout.write(help);
};

export const getParsedPath = (src: string) => {
  return join(src, "**/**").replace(/\\/g, "/");
};

export const getOriginFile = (
  originPath: string,
  targetPath: string,
  filePath: string
) => {
  const parsedOrigin = parse(originPath);
  const parsedTarget = parse(targetPath);
  const parsedFile = parse(filePath);

  return `${parsedFile.dir.replace(
    `${parsedTarget.dir}\\${parsedTarget.base}`,
    `${parsedOrigin.dir}\\${parsedOrigin.base}`
  )}\\${parsedFile.base}`;
};

export const getTargetFile = (
  originPath: string,
  targetPath: string,
  filePath: string
) => {
  const parsedOrigin = parse(originPath);
  const parsedTarget = parse(targetPath);
  const parsedFile = parse(filePath);

  return `${parsedFile.dir.replace(
    `${parsedOrigin.dir}\\${parsedOrigin.base}`,
    `${parsedTarget.dir}\\${parsedTarget.base}`
  )}\\${parsedFile.base}`;
};

export const presentLoader = (message?: string) => {
  var P = ["\\", "|", "/", "-"];
  var x = 0;

  return setInterval(() => {
    process.stdout.write(`\r ${P[x++]} ${message}`);
    x &= 3;
  }, 250);
};
