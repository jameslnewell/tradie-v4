import serveIndex from 'serve-index';
import serveStatic from 'serve-static';
import getPaths from './utils/getPaths';
import getSiteMetadata from './utils/getSiteMetadata';
import getWebpackVendorConfig from './utils/getWebpackVendorConfig';
import getWebpackClientConfig from './utils/getWebpackClientConfig';
import getWebpackBuildConfig from './utils/getWebpackBuildConfig';

export default options => {
  const root = options.root;
  const debug = options.debug;
  const optimize = false;
  const manifest = [];

  const paths = getPaths(root);

  return getSiteMetadata(root).then(metadata => ({
    debug,
    webpack: {
      vendor: getWebpackVendorConfig({root, optimize, manifest}),
      client: getWebpackClientConfig({root, optimize, metadata, manifest}),
      build: getWebpackBuildConfig({root, optimize, metadata, manifest})
    },
    onServerStart: server =>
      server.use(serveStatic(paths.dest)).use(serveIndex(paths.dest))
  }));
};
