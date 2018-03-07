import * as paths from './paths';

export function source() {
  return {
    declarationDir: paths.CODE_DEST,
    outDir: paths.CODE_DEST,
    rootDir: paths.CODE_SRC,

    // normal JS doesn't work with declarations
    // @see https://github.com/Microsoft/TypeScript/issues/7546
    // allowJs: true,
    // checkJs: true,

    declaration: true,
    jsx: 'React',
    target: 'es2017',
    module: 'commonjs',
    moduleResolution: 'node',
    sourceMap: true,
    lib: ['es2017']
  };
}

export function example() {
  return {
    ...source(),
    rootDir: paths.ROOT
  };
}

export function test() {
  return {
    ...source(),
    rootDir: paths.ROOT
  };
}
