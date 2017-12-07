import {Range, lt} from 'semver';

export function min(arg) {
  let version = null;

  //FIXME: this is a VERY buggy method (rough guess) that doesn't take into account the operator
  new Range(arg).set.forEach(comparator => {
    comparator.forEach(range => {
      if (range.operator === '=' || range.operator === '>' || range.operator === '>=') {
        if (version === null) {
          version = range.semver;
          return;
        }

        if (lt(range.semver, version)) {
          version = range.semver;
          return;
        }
      }
    });
  });

  return version && version.raw;
}
