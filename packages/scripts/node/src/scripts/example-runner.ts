import * as path from 'path';
import * as paths from '../config/paths';

export default async function(cwd: string, module: string) {
  await import(`${path.join(cwd, paths.EXAMPLES_SRC)}/${module}`);
}
