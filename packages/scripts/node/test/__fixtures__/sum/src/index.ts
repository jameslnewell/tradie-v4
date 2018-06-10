
export default function(...args: number[]): number {
  return args.reduce((total, arg) => total + arg, 0);
}
