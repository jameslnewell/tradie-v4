import {createBabelTransform} from '@tradie/jest-utils';
import {getBabelConfig} from './babel';

/* eslint-disable import/no-commonjs */
module.exports = createBabelTransform(getBabelConfig({root: process.cwd()}));
/* eslint-enable import/no-commonjs */
