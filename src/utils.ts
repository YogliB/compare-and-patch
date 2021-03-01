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
  return join(__dirname, src, "**/*.*").replace(/\\/g, "/");
};

export const getTargetFile = (origin: string, target: string, file: string) => {
  console.log(file, parse(file));
  const originPath = parse(origin);
  console.log("originPath", originPath);
  const targetPath = parse(target);
  const path = parse(file);
  path.dir = path.dir.replace(originPath.dir, targetPath.dir);
  console.log(path);
  return "";
};
