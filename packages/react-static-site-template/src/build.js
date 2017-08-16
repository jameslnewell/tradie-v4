import getSiteMetadata from './utils/getSiteMetadata';
import getWebpackVendorConfig from './utils/getWebpackVendorConfig';
import getWebpackClientConfig from './utils/getWebpackClientConfig';
import getWebpackBuildConfig from './utils/getWebpackBuildConfig';

export default options => {
  const root = options.root;
  const debug = options.debug;
  const optimize = options.optimize;
  const watch = options.watch;
  const manifest = [];

  return getSiteMetadata(root).then(metadata => ({
    debug,
    watch,
    webpack: {
      vendor: getWebpackVendorConfig({root, optimize, manifest}),
      client: getWebpackClientConfig({root, optimize, metadata, manifest}),
      build: getWebpackBuildConfig({root, optimize, metadata, manifest})
    }
  }));
};
