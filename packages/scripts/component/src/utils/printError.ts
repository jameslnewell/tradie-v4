import { Arguments } from "yargs";

export const printError = (fn: (argv: Arguments) => Promise<void>) => (argv: Arguments) => Promise.resolve(fn(argv)).catch(error => {
  /* tslint:disable-next-line */
  console.error(error);
  process.exit(1);
});
