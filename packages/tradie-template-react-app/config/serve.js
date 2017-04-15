'use strict';
const path = require('path');
const proxyMiddleware = require('http-proxy-middleware');
const getPaths = require('./lib/getPaths');
const getWebpackVendorConfig = require('./lib/getWebpackVendorConfig');
const getWebpackClientConfig = require('./lib/getWebpackClientConfig');
const getWebpackServerConfig = require('./lib/getWebpackServerConfig');


module.exports = options => {
  const root = options.root;
  const debug = options.debug;
  const optimize = false;
  const manifest = {};
  const paths = getPaths(root);

  let app = new Process(
    path.join(paths.dest, 'server.js'), 
    {env: {PORT: 4000}}
  );

  return {
    debug,

    webpack: {
      vendor: getWebpackVendorConfig({root, optimize, manifest}),
      client: getWebpackClientConfig({root, optimize, manifest}),
      server: getWebpackServerConfig({root, optimize})
    },

    onServerStart: server => {
      
      app.start();

      server.use(proxyMiddleware({
        target: `http://localhost:${APP_PORT}`, //TODO: make configurable
        logLevel: 'warn'
      }));
    
    },

    onServerStop: () => {
      return app.stop();
    }

  };

};
