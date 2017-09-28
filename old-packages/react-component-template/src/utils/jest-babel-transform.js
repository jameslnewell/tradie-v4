import {createBabelTransform} from '@tradie/jest-utils';
import {getTestOptions} from './babel';

/* eslint-disable import/no-commonjs */
module.exports = createBabelTransform(getTestOptions());
/* eslint-enable import/no-commonjs */
