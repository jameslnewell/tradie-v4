// @flow

export default function(...args: number[]) {
  return args.reduce((total, arg) => total + arg, 0);
}
