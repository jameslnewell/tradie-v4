// import path from 'path';
import register from 'babel-register';
import {match} from '@tradie/file-utils';

import * as globs from '../config/globs';
import * as paths from '../config/paths';
import * as babel from '../config/babel';

export default function(argv) {
  const filter = match({
    context: paths.ROOT,
    include: [globs.SOURCES, globs.EXAMPLES]
  });

  register({
    babelrc: false,
    extensions: ['.jsx', '.js'],
    ...babel.examples({root: paths.ROOT}),
    only: filter
    //TODO: use resolveModuleSource() so we can just do '..' instead of '../src'
  });

  return import(`${paths.EXAMPLES_SRC}/${argv.module}`);
}
