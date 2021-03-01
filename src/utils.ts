import mri from "mri";
import { Arguments } from "./models";
import { readFileSync } from "fs";
import { join } from "path";
import { bold, underline, cyan } from "chalk";

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
