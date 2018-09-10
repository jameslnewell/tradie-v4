import * as path from 'path';
import { Arguments } from "yargs";

export function clean({root}: {argv: Arguments, root: string}): {paths: string[];} {
  return {
    paths: [path.join(root, 'dist')]
  };
}
