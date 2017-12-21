import path from 'path';

export const ROOT = process.cwd();

export const CODE_SRC = path.join(ROOT, 'src');
export const CODE_DEST = path.join(ROOT, 'dist');
export const CODE_DEST_CJS = path.join(CODE_DEST, 'cjs');
export const CODE_DEST_ESM = path.join(CODE_DEST, 'esm');

export const EXAMPLE_SRC = path.join(ROOT, 'example');
export const EXAMPLE_DEST = path.join(ROOT, 'dist/example');

export const TEST_SRC = path.join(ROOT, 'tests');
export const COVERAGE_DEST = path.join(ROOT, 'coverage');
