import * as fs from 'fs';
import * as path from 'path';
import {readConfigFile} from '@tradie/typescript-utils';
import {getPaths} from './getPaths';

export const getTSConfig = ({cwd}: {cwd: string}) => {
  const paths = getPaths({cwd});
  const baseConfig = (fs.existsSync(path.join(cwd, 'tsconfig.json'))) ? readConfigFile(path.join(cwd, 'tsconfig.json')) :  readConfigFile(path.join(__dirname, 'tsconfig.json'));
  return {
    sources: {
      ...baseConfig.compilerOptions,
      rootDir: path.join(cwd, paths.SOURCES_SRC),
      outDir: path.join(cwd, paths.SOURCES_DEST),
      declaration: true,
      emitDeclarationOnly: true,
      sourceMap: true,
      moduleResolution: 'node',
    },
    examples: {
      ...baseConfig.compilerOptions,
      rootDir: path.join(cwd, paths.SOURCES_SRC),
      noEmit: true,
      sourceMap: true,
      moduleResolution: 'node',
    },
    tests: {
      ...baseConfig.compilerOptions,
      rootDir: path.join(cwd, paths.SOURCES_SRC),
      noEmit: true,
      sourceMap: true,
      moduleResolution: 'node',
    },
  };
}
