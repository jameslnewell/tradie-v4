// @flow

export default (...args: Array<number>): number =>
  args.reduce((total, next) => total + next);
