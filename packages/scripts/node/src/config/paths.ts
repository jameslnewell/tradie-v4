import * as path from 'path';

export const ROOT = process.cwd();
export const CODE_SRC = path.join(ROOT, 'src');
export const CODE_DEST = path.join(ROOT, 'lib');
export const EXAMPLES_SRC = path.join(ROOT, 'examples');
export const TESTS_SRC = path.join(ROOT, 'tests');
export const COVERAGE_DEST = path.join(ROOT, 'coverage');
