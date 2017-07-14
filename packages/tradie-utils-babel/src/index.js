//@flow
import GroupExecutor, {
  type Group,
  type GroupOrGroups
} from 'tradie-utils-group-exec';
import transpile from './transpile';

export type TranspilerContext = {
  src: string,
  dest: string,
  options: {}
};

function createContext({src, dest, options}: Group<TranspilerContext>) {
  return {
    src,
    dest,
    options
  };
}

export default class Transpiler {
  /** @private */
  executor: GroupExecutor<TranspilerContext, TranspilerContext>;

  /**
   * @param {string}        root            The root directory where paths are matched from
   * @param {GroupOrGroups} groupOrGroups   The groups
   */
  constructor(root: string, groupOrGroups: GroupOrGroups<TranspilerContext>) {
    this.executor = new GroupExecutor(createContext, groupOrGroups, {root});
  }

  /**
   * @param {string}        file            The full file path
   */
  transpile(file: string) {
    return this.executor.exec(file, (f, {src, dest, options}) =>
      transpile(f, src, dest, options)
    );
  }
}
