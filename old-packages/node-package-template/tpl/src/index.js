// @flow

export default (...args: number[]): number =>
  args.reduce((total, next) => total + next);
