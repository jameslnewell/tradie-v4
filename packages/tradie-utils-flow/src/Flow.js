// @flow
import GroupExecutor, {
  type Group,
  type GroupOrGroups
} from 'tradie-utils-group-exec';
import exec from './exec';
import isFlowConfigured from './isFlowConfigured';
import {getErrors, getWarnings} from './messages';
import exportTypes from './exportTypes';

export {isFlowConfigured as isConfigured};

export type CheckResult = {
  errors: {file: string, message: string}[],
  warnings: {file: string, message: string}[]
};

export type TypeCheckerContext = {
  src: string,
  dest: string
};

function createContext({src, dest}: Group<TypeCheckerContext>) {
  return {
    src,
    dest
  };
}

export default class TypeChecker {
  /** @private */
  directory: string;

  /** @private */
  executor: GroupExecutor<TypeCheckerContext, TypeCheckerContext>;

  /**
   *
   * @param {string} directory The directory containing the `.flowconfig` file
   * @param {*} src
   * @param {*} dest
   */
  constructor(
    directory: string,
    groupOrGroups: GroupOrGroups<TypeCheckerContext>
  ) {
    this.directory = directory;
    this.executor = new GroupExecutor(createContext, groupOrGroups, {
      directory
    });
  }

  /**
   * Export the typings for a file
   * @param {string} file The full path to the file
   */
  async export(file: string) {
    return this.executor.exec(file, (f, {src, dest}) =>
      exportTypes(f, this.directory, src, dest)
    );
  }

  async check(): Promise<CheckResult> {
    //check if flow is configured before wasting time checking and getting errors
    if (!isFlowConfigured(this.directory)) {
      return {
        errors: [],
        warnings: []
      };
    }

    //TODO: stop flow server the first time this is run, to avoid issues with definitions being cached

    const result = await exec(['status'], {cwd: this.directory});

    //report errors
    //FIXME: only report errors for files included/excluded in any of the groups
    const errors = getErrors(this.directory, result).filter(error => {
      return this.executor.context(error.file).length;
    });

    //report warnings
    //FIXME: only report errors for files included/excluded in any of the groups
    const warnings = getWarnings(this.directory, result).filter(error => {
      return this.executor.context(error.file).length;
    });

    return {
      errors,
      warnings
    };
  }
}
