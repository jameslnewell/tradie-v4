import {createBabelTransform} from '@tradie/jest-utils';
import * as babel from './babel';

/* eslint-disable import/no-commonjs */
module.exports = createBabelTransform(babel.test());
/* eslint-enable import/no-commonjs */
