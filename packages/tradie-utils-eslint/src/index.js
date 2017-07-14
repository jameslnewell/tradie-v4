//@flow
import fs from 'fs-extra';
import {CLIEngine} from 'eslint';
import GroupExecutor, {
  type Group,
  type GroupOrGroups
} from 'tradie-utils-group-exec';
import {getErrors, getWarnings} from './messages';

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
   * @param {string}        root            The root directory where paths are matched from
   * @param {GroupOrGroups} groupOrGroups   The groups
   */
  constructor(root: string, groupOrGroups: GroupOrGroups<GroupOptions>) {
    this.executor = new GroupExecutor(createContext, groupOrGroups, {root});
  }

  /**
   * @param {string}        file            The full file path
   */
  lint(file: string) {
    return this.executor
      .exec(file, (f, {engine}) =>
        fs.readFile(file).then(text => {
          const report = engine.executeOnText(text.toString(), file);
          return {
            error: getErrors(report)[file],
            warning: getWarnings(report)[file]
          };
        })
      )
      .then(results =>
        results.reduce(
          (combined, result) => {
            if (result.error) {
              combined.error = combined.error
                ? combined.error + result.error
                : result.error;
            }
            if (result.warning) {
              combined.warning = combined.warning
                ? combined.warning + result.warning
                : result.warning;
            }
            return combined;
          },
          {error: null, warning: null}
        )
      );
  }
}
