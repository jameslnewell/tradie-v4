#!/usr/bin/env node
//@flow
import 'babel-polyfill';
import chalk from 'chalk';
import yargs from 'yargs';

export type ConfigFn = (args: {}) => Promise<{}>;
export type ScriptFn = (config: {}) => Promise<void>;

export type Options = {
  cli: {
    [name: string]: {
      desc: string,
      args: {}
    }
  },
  configs: {[name: string]: string | ConfigFn},
  scripts: {[name: string]: string | ScriptFn}
};

async function _load(path: string) {
  return await import(path).then(
    module => (module.__esModule ? module.default : module)
  );
}

async function _run(options: Options): Promise<void> {
  const {cli, configs, scripts} = options;

  //check we have options
  if (
    typeof cli !== 'object' ||
    typeof configs !== 'object' ||
    typeof scripts !== 'object'
  ) {
    throw new Error(`"cli", "configs" and "scripts" must all be objects.`);
  }

  //parse args
  let args = null;
  try {
    yargs
      .help()
      .strict()
      .exitProcess(false)
      .usage('Usage: $0 <command> [options]')
      .demandCommand(1, 'Missing the <command> argument.');
    Object.keys(cli).forEach(name => {
      yargs.command(name, cli[name].desc || '', cli[name].args || {});
    });
    args = yargs.argv;
  } catch (error) {
    return; //we assume yargs has already printed an error message
  }

  //check if the user used the "help" command and yargs is showing the help screen
  if (args.help) {
    return;
  }

  //get the command
  const command = args._[0];

  //check we have a config fn
  const configFn: ConfigFn =
    typeof configs[command] === 'string'
      ? await _load(configs[command])
      : configs[command];
  if (!configFn) {
    throw new Error(`Missing config for command "${command}".`);
  }

  //check we have a script fn
  const scriptFn: ScriptFn =
    typeof scripts[command] === 'string'
      ? await _load(scripts[command])
      : scripts[command];
  if (!scriptFn) {
    throw new Error(`Missing script for command "${command}".`);
  }

  //get the config
  const config = await configFn({
    root: process.cwd(),
    debug: process.env.DEBUG,
    ...args
  }); //TODO: currently expects {root: ''}

  //run the script with the config
  await scriptFn(config);
}

export async function run(options: Options): Promise<void> {
  try {
    await _run(options);
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
