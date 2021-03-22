import { Arguments } from "./models";
import { getArguments, logHelp } from "./utils";
import { compareAndPatch } from "./index";

const main = () => {
  const { help, origin, target, silent, verbose }: Arguments = getArguments();

  if (help || !(origin?.trim() && target?.trim())) {
    logHelp();
    process.exit(0);
  }

  compareAndPatch({ origin, target, verbose, silent });
};

main();
