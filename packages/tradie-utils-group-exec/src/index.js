//@flow
import match, {type Filter, type FilterFunction} from 'tradie-utils-match';

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
  root?: string
};

export default class GroupExecutor<GroupOptions, GroupContext> {
  matchers: FilterFunction[];
  contexts: GroupContext[];

  constructor(
    createContext: CreateContextFunction<GroupOptions, GroupContext>,
    groupOrGroups: GroupOrGroups<GroupOptions>,
    options: GroupExecutorOptions = {}
  ) {
    const {root} = options;

    const groups = [].concat(groupOrGroups);

    this.matchers = groups.map(group => {
      const {include, exclude} = group;
      return match({
        root,
        include,
        exclude
      });
    });

    this.contexts = groups.map(group => createContext(group));
  }

  exec(
    file: string,
    fn: (file: string, context: GroupContext) => any | Promise<any>
  ) {
    return Promise.all(
      this.matchers.map((matcher, index) => {
        if (matcher(file)) {
          return fn(file, this.contexts[index]);
        } else {
          return null;
        }
      })
    );
  }
}
