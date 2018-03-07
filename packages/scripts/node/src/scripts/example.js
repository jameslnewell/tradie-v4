// import path from 'path';
import {register} from 'ts-node';
import * as paths from '../config/paths';
import * as tsconfig from '../config/typescript';

export default function(argv) {
  const {module = 'index'} = argv;

  register({
    // typeCheck: true,
    skipProject: true,
    compilerOptions: tsconfig.example()
  });

  return import(`${paths.EXAMPLES_SRC}/${module}`);
}
