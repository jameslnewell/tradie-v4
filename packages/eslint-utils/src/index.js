//@flow
import fs from 'fs-extra';
import {CLIEngine} from 'eslint';
import GroupExecutor, {
  type Group,
  type GroupOrGroups
} from '@tradie/group-exec-utils';
import {getErrors, getWarnings} from './messages';

export type LintResult = {
  errors: {file: string, message: string}[],
  warnings: {file: string, message: string}[]
};

export type GroupOptions = {
  options: {}
};

export type GroupContext = {
  engine: CLIEngine
};

function createContext({options}: Group<GroupOptions>) {
  return {
    engine: new CLIEngine({
      ignore: false,
      useEslintrc: false,
      baseConfig: options
    })
  };
}

export default class Linter {
  /** @private */
  executor: GroupExecutor<GroupOptions, GroupContext>;

  /**
   * @param {string}        directory            The root directory where paths are matched from
   * @param {GroupOrGroups} groupOrGroups   The groups
   */
  constructor(directory: string, groupOrGroups: GroupOrGroups<GroupOptions>) {
    this.executor = new GroupExecutor(createContext, groupOrGroups, {
      directory
    });
  }

  /**
   * @param {string}        file            The full file path
   */
  async lint(file: string): Promise<LintResult> {
    const result = {
      errors: [],
      warnings: []
    };
    return this.executor
      .exec(file, (f, {engine}) =>
        fs.readFile(file).then(text => {
          const report = engine.executeOnText(text.toString(), file);

          const error = getErrors(report)[file];
          if (error) result.errors.push({file, message: error});

          const warning = getWarnings(report)[file];
          if (warning) result.warnings.push({file, message: warning});
        })
      )
      .then(() => result);
  }
}
