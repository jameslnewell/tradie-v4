//@flow
import fs from 'fs-extra';
import {CLIEngine} from 'eslint';
import {getErrors, getWarnings} from './messages';

export type LintConfig = {};

export type LintResult = {
  errors: {file: string, message: string}[],
  warnings: {file: string, message: string}[]
};

export default function(config: LintConfig = {}) {
  const engine = new CLIEngine({
    ignore: false,
    useEslintrc: false,
    baseConfig: config
  });

  return async function(file: string): Promise<LintResult> {
    const result = {
      errors: [],
      warnings: []
    };

    const text = await fs.readFile(file);
    const report = engine.executeOnText(text.toString(), file);

    const error = getErrors(report)[file];
    if (error) result.errors.push({file, message: error});

    const warning = getWarnings(report)[file];
    if (warning) result.warnings.push({file, message: warning});

    return result;
  };
}
