import * as path from 'path';

export const getPaths = ({cwd}: {cwd: string}) => ({
  SOURCES_SRC: path.join(cwd, 'src'),
  SOURCES_DEST: path.join(cwd, 'lib'),
  EXAMPLES_SRC: path.join(cwd, 'examples'),
  TESTS_SRC: path.join(cwd, 'tests'),
  COVERAGE_DEST: path.join(cwd, 'coverage'),
});
