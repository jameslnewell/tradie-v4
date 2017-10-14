import {createBabelTransform} from '@tradie/jest-utils';
import {ROOT} from '../paths';
import {tests} from '../babel';

/* eslint-disable import/no-commonjs */
module.exports = createBabelTransform(tests({root: ROOT}));
/* eslint-enable import/no-commonjs */
