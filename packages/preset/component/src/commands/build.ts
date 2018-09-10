import { Arguments } from "yargs";
import * as path from 'path';
import * as tsconfig from '../utils/tsconfig';
import * as tslintConfig from '../utils/tslintConfig';
import * as babelOptions from '../utils/babelOptions';

export function build({argv, root}: {argv: Arguments, root: string}) {
  return {
    tslint: {
      sources: tslintConfig.sources(),
      tests: tslintConfig.tests(),
    },
    tsconfig: {
      sources: tsconfig.sources(),
      tests: tsconfig.tests(),
    },
    babel: {
      cjs: babelOptions.cjs(),
      esm: babelOptions.esm(),
    },
    paths: {
      src: path.join(root, 'src'),
      dest: path.join(root, 'dist'),
    },
    globs: {
      TYPES: '{types,typings}/**/*.d.ts',
      SOURCES: 'src/**/*.{ts,tsx}',
      TESTS: '{src,test}/**/*.test.{ts,tsx}',
      MOCKS: '{src,test}/**/__mocks__/**/*.{ts,tsx}',
      FIXTURES: '{src,test}/**/__fixtures__/**/*'
    }
  };
}

