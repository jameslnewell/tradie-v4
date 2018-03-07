import {createTypescriptTransform} from '@tradie/jest-utils';
import * as tsconfig from './typescript';

module.exports = createTypescriptTransform(tsconfig.test());
