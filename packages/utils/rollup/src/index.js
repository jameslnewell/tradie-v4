/* eslint-disable no-param-reassign */
import {rollup} from 'rollup';

export default function(groupOrGroups) {
  const groups = [].concat(groupOrGroups);
  return Promise.all(
    groups.map(options =>
      rollup(options)
        .then(bundle => Promise.all(options.targets.map(target => bundle.write(target))))
        .then(
          () => ({
            errors: [],
            warnings: []
          }),
          error => {
            if (error.id) {
              return {
                errors: [{file: error.id, message: String(error)}],
                warnings: []
              };
            } else {
              throw error;
            }
          }
        )
    )
  ).then(results =>
    results.reduce(
      (accum, result) => ({
        errors: [...accum, ...result.errors],
        warnings: [...accum, ...result.warnings]
      }),
      {}
    )
  );
}
