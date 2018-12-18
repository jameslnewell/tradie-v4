import {Arguments} from 'yargs';

export function clear() {
  // don't output on CI or when debugging
  if (process.env.CI || process.env.DEBUG) {
    return;
  }

  // don't output if we're not outputting to a terminal
  if (!process.stdout.isTTY) {
    return;
  }

  // clear the screen
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
}

export const handleError = (fn: (argv: Arguments) => Promise<void>) => {
  return async (argv: Arguments) => {
    try {
      await fn(argv);
    } catch (error) {
      if (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
      process.exitCode = 1;
    }
  }
};
