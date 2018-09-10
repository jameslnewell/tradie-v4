import {Arguments} from 'yargs';
import jest from '@tradie/jest-utils';
import {test} from '@tradie/component-preset';
import {printError} from '../utils/printError';

export const command = 'test'
export const desc = 'Run the tests.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const root = process.cwd();
  const config = test({argv, root});
  await jest(argv as any, config);
});
