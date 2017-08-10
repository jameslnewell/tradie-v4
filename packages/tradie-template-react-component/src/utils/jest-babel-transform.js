import {createBabelTransform} from 'tradie-utils-jest';
import {getTestOptions} from './babel';

/* eslint-disable import/no-commonjs */
module.exports = createBabelTransform(getTestOptions());
/* eslint-enable import/no-commonjs */
