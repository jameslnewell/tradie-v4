import path from 'path';
import babelJest from 'babel-jest';
import getTestConfig from '../getBabelTestConfig';

export default babelJest.createTransformer(
  getTestConfig({
    optimize: false,
    root: path.resolve('.') //TODO: fixme
  })
);
