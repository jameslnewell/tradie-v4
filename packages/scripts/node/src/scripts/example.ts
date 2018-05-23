
import { register } from 'ts-node';
import * as paths from '../config/paths';
import * as tsconfig from '../config/typescript';

export default function (options: { module: string }) {
  const { module = 'index' } = options;

  register({
    // typeCheck: true,
    skipProject: true,
    compilerOptions: tsconfig.example()
  });

  return import(`${paths.EXAMPLES_SRC}/${module}`);
}
