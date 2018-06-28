import * as path from 'path';
import * as paths from './paths';

export function source({root}: {root: string}) {
  return {
    declarationDir: path.join(root, paths.CODE_DEST),
    outDir: path.join(root, paths.CODE_DEST),
    rootDir: path.join(root, paths.CODE_SRC),

    // normal JS doesn't work with declarations
    // @see https://github.com/Microsoft/TypeScript/issues/7546
    // allowJs: true,
    // checkJs: true,

    declaration: true,
    jsx: 'React',
    target: 'es2017',
    module: 'commonjs',
    moduleResolution: 'node',
    newLine: 'lf',
    sourceMap: true,
    lib: ['es2017']
  };
}

export function example({root}: {root: string}) {
  return {
    ...source({root}),
    rootDir: root
  };
}

export function test({root}: {root: string}) {
  return {
    ...source({root}),
    rootDir: root
  };
}
