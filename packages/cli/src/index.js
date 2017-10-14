#!/usr/bin/env node
//@flow
import 'babel-polyfill';
import chalk from 'chalk';
import yargs from 'yargs';

export type ScriptOptions = {};
export type ScriptFunction = (argv: {}) => Promise<void>;

export type Script = {
  cmd: string,
  desc?: string,
  opts?: ScriptOptions,
  exec: string | ScriptFunction
};

async function _load(path: string) {
  return await import(path).then(
    module => (module.__esModule ? module.default : module)
  );
}

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
        const {cmd, desc, opts, exec} = script;

        // get fn
        let fn;
        if (typeof exec === 'string') {
          fn = await _load(exec);
        } else {
          fn = exec;
        }

        // check fn
        if (typeof fn !== 'function') {
          reject(new Error(`Script fn not found: "${cmd}".`));
          return;
        }

        yargs.command({
          command: cmd,
          description: desc,
          builder: opts,
          handler: argv => {
            try {
              Promise.resolve(fn(argv)).then(resolve, reject);
            } catch (error) {
              reject(error);
            }
          }
        });
      })
    ).then(() => {
      try {
        yargs.argv; // eslint-disable-line no-unused-expressions
        resolve();
      } catch (error) {
        // eslint-disable-line no-empty
      }
    });
  });
}

export async function run(scripts: Script[]): Promise<void> {
  try {
    await _run(scripts);
  } catch (error) {
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.stack)); //eslint-disable-line no-console
      } else {
        console.error(chalk.red(error)); //eslint-disable-line no-console
      }
    }
    process.exit(1);
  }
}
