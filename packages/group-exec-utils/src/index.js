//@flow
import match, {type Filter, type FilterFunction} from '@tradie/match-utils';

export type Group<GroupOptions> = {
  include?: Filter,
  exclude?: Filter
} & GroupOptions;

export type GroupOrGroups<GroupOptions> =
  | Group<GroupOptions>
  | Group<GroupOptions>[];

export type CreateContextFunction<GroupOptions, GroupContext> = (
  group: Group<GroupOptions>
) => GroupContext;

export type GroupExecutorOptions = {
  directory?: string
};

export default class GroupExecutor<GroupOptions, GroupContext> {
  matchers: FilterFunction[];
  contexts: GroupContext[];

  constructor(
    createContext: CreateContextFunction<GroupOptions, GroupContext>,
    groupOrGroups: GroupOrGroups<GroupOptions>,
    options: GroupExecutorOptions = {}
  ) {
    const {directory} = options;

    const groups = [].concat(groupOrGroups);

    this.matchers = groups.map(group => {
      const {include, exclude} = group;
      return match({
        directory,
        include,
        exclude
      });
    });

    this.contexts = groups.map(group => createContext(group));
  }

  /**
   * Get the context for each group that matches the file
   */
  context(file: string): GroupContext[] {
    return this.matchers.reduce((contexts, matcher, index) => {
      if (matcher(file)) {
        return contexts.concat(this.contexts[index]);
      } else {
        return contexts;
      }
    }, []);
  }

  /**
   * Execute a function for each groups that matches the file
   */
  exec(
    file: string,
    fn: (file: string, context: GroupContext) => any | Promise<any>
  ): Promise<any[]> {
    return Promise.all(this.context(file).map(context => fn(file, context)));
  }
}
