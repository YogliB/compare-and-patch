import mri from "mri";
import { Arguments } from "./models";
import { readFileSync } from "fs";
import { bold, underline, cyan } from "chalk";
import { join, parse } from "path";

export const getArguments = (): Arguments => {
  const argv = process.argv.slice(2);
  const { origin, target, help } = mri(argv, {
    alias: {
      o: "origin",
      t: "target",
      h: "help",
    },
  });

  return { origin, target, help };
};

export const logHelp = () => {
  const help = readFileSync(join(__dirname, "help.md"), "utf-8")
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
