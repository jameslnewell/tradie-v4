/* eslint-disable no-param-reassign */
import {rollup} from 'rollup';

export default function(groupOrGroups) {
  const groups = [].concat(groupOrGroups);
  return Promise.all(
    groups.map(options =>
      rollup(options).then(bundle =>
        Promise.all(options.targets.map(target => bundle.write(target)))
      )
    )
  );
}
