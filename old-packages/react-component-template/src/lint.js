import {
  SOURCE_FILES,
  EXAMPLE_FILES,
  TEST_FILES,
  MOCK_FILES,
  FIXTURE_FILES
} from './utils/paths';
import * as eslint from './utils/eslint';

export default function(cliOptions) {
  const {root, watch} = cliOptions;
  return {
    root,
    watch,
    eslint: [
      {
        include: [SOURCE_FILES, EXAMPLE_FILES],
        exclude: [TEST_FILES, MOCK_FILES, FIXTURE_FILES],
        options: eslint.getSourceConfig()
      },
      {
        include: [TEST_FILES, MOCK_FILES, FIXTURE_FILES],
        options: eslint.getTestConfig()
      }
    ],
    flow: []
  };
}
