import * as fs from 'fs';
import * as path from 'path';
import { Configuration } from 'tslint';
import {readConfigFile} from '@tradie/tslint-utils';

export interface Configs {
  sources: Configuration.RawConfigFile;
  examples: Configuration.RawConfigFile;
  tests: Configuration.RawConfigFile;
}

export const getTSLintConfig = ({cwd}: {cwd: string}): Configs => {
  const baseConfig = fs.existsSync(path.join(cwd, 'tslint.json')) ? readConfigFile(path.join(cwd, 'tslint.json')) : readConfigFile(path.join(__dirname, 'tslint.json'));
  return {
    sources: {
      ...baseConfig
    },
    examples: {
      ...baseConfig,
      rules: {
        ...baseConfig.rules,
        'no-console': false,
      }
    },
    tests: {
      ...baseConfig,
      rules: {
        ...baseConfig.rules,
        'no-console': {severity: 'warning'},
        'mocha-avoid-only': true,
      },
      rulesDirectory: [path.dirname(require.resolve('tslint-microsoft-contrib'))]
    },
  };
}
