//@flow
import GroupExecutor, {
  type Group,
  type GroupOrGroups
} from '@tradie/group-exec-utils';
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
   * @param {string}        directory            The root directory where paths are matched from
   * @param {GroupOrGroups} groupOrGroups   The groups
   */
  constructor(
    directory: string,
    groupOrGroups: GroupOrGroups<TranspilerContext>
  ) {
    this.executor = new GroupExecutor(createContext, groupOrGroups, {
      directory
    });
  }

  /**
   * @param {string}        file            The full file path
   */
  transpile(file: string): Promise<void> {
    return this.executor
      .exec(file, (f, {src, dest, options}) => transpile(f, src, dest, options))
      .then(() => {});
  }
}
