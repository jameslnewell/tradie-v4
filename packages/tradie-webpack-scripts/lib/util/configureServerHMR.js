'use strict';
const webpack = require('webpack');

module.exports = config => {

  const devServerEntries = [
    // 'webpack/hot/signal'
    'webpack/hot/poll?1000'
  ];

  if (typeof config.entry === 'object') {
    Object.keys(config.entry).forEach(entry => {
      config.entry[entry] = devServerEntries.concat(entry);
    });
  } else {
    config.entry = devServerEntries.concat(config.entry);
  }

  //add plugins
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(new webpack.NamedModulesPlugin());
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

};
