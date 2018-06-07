import chalk from 'chalk';
import * as yargs from 'yargs';

export interface ScriptOptions {
};

export type ScriptFunction = (argv: {}) => Promise<void>;

export interface Script {
  cmd: string,
  desc?: string,
  opts?: ScriptOptions,
  exec: string | ScriptFunction
};

async function _load(path: string) {
  return await import(path).then(module => (module.__esModule ? module.default : module));
};

function _run(scripts: Script[]): Promise<void> {
  return new Promise((resolve, reject) => {
    yargs
      .help()
      .strict()
      .exitProcess(false)
      .usage('Usage: $0 <command> [options]')
      .demandCommand(1, 'Missing the <command> argument.');

    Promise.all(
      scripts.map(async script => {
        const { cmd, desc, opts, exec } = script;

        // get fn
        let fn: string | ScriptFunction;
        if (typeof exec === 'string') {
          fn = await _load(exec);
        } else {
          fn = exec;
        }

        yargs.command({
          command: cmd,
          describe: desc,
          builder: opts,
          handler: async argv => {
            try {

              // check fn
              if (typeof fn !== 'function') {
                reject(new Error(`Script fn not found: "${cmd}".`));
                return;
              }

              // call fn
              await Promise.resolve(fn(argv));

            } catch (error) {
              reject(error);
            }
          }
        });
      })
    ).then(() => {
      try {
        yargs.argv; // tslint:disable-line no-unused-expression
      } catch (error) {
        reject();
      }
    });
  });
};

async function run(scripts: Script[]): Promise<void> {
  try {
    await _run(scripts);
  } catch (error) {
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.stack || '')); // tslint:disable-line no-console
      } else {
        console.error(chalk.red(error)); // tslint:disable-line no-console
      }
    }
    process.exit(1);
  }
};

export { run };
