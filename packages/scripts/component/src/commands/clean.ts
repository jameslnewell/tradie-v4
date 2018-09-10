import {Arguments} from 'yargs';
import {rm} from '@tradie/file-utils';
import {clean} from '@tradie/component-preset';
import {printError} from '../utils/printError';

export const command = 'clean'
export const desc = 'Clean the build component artifacts.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const root = process.cwd();
  const config = clean({argv, root});
  await rm(config.paths);
});
