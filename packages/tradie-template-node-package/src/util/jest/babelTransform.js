import jestUtils from 'tradie-utils-jest';
import getBabelConfig from '../getBabelConfig';

export default jestUtils.createBabelTransform(
  Object.assign({}, getBabelConfig({root: process.cwd()}), {
    //FIXME: use root variable from command config
    retainLines: true,
    sourceMaps: 'inline'
  })
);
