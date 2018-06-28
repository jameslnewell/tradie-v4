
import * as path from 'path';
import { register } from 'ts-node';
import {getWorkspaces} from '@tradie/yarn-utils';
import * as paths from '../config/paths';
import * as tsconfig from '../config/typescript';

export default async function (options: { module: string }) {
  const { module = 'index' } = options;

  const {root, workspaces} = await getWorkspaces(process.cwd());

  if (workspaces.length > 1) {
    throw new Error('"node-scripts example" may only be run on a single workspace');
  }

  register({
    // typeCheck: true,
    skipProject: true,
    compilerOptions: tsconfig.example({root})
  });

  await import(`${path.join(workspaces[0], paths.EXAMPLES_SRC)}/${module}`);
}
