import {Arguments} from 'yargs';
import jest from '@tradie/jest-utils';
import {getProjectInfo} from '@tradie/yarn-utils';
import {test} from '@tradie/component-config';

const printError = (fn: (argv: Arguments) => Promise<void>) => (argv: Arguments) => Promise.resolve(fn(argv)).catch(error => {
  /* tslint:disable-next-line */
  console.error(error);
  process.exit(1);
})

export const command = 'test'
export const desc = 'Run the tests.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const {root, workspaces} = await getProjectInfo();

  const config = test({argv, root, workspaces});

  // if (workspaces.length > 1) {
    // throw new Error('Unfortunately jest does not support configuration of multiple workspaces via the CLI at this time.')
  // }

  await jest((argv as any), config);
});
