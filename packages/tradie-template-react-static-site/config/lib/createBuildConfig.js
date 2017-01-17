/* @flow weak */
'use strict';
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const createCommonConfig = require('./createCommonConfig');
const StaticReactRenderPlugin = require('static-react-render-webpack-plugin');

function getAssetsFromCache(chunkName, assetsByChunkNameCache) {
  return Object.keys(assetsByChunkNameCache)
    .filter(cn => cn === chunkName)
    .map(chunkName => assetsByChunkNameCache[chunkName])
    .reduce((a, b) => a.concat(b), [])
  ;
}

function getScriptFilesFromCache(chunkName, assetsByChunkNameCache, publicPath) {
  return getAssetsFromCache(chunkName, assetsByChunkNameCache)
    .filter(asset => /\.js/.test(asset))
    .map(asset => path.join(publicPath, asset))
  ;
}

function getStyleFilesFromCache(chunkName, assetsByChunkNameCache, publicPath) {
  return getAssetsFromCache(chunkName, assetsByChunkNameCache)
    .filter(asset => /\.css/.test(asset))
    .map(asset => path.join(publicPath, asset))
  ;
}

module.exports = options => {
  const metadata = options.metadata;
  const assetsByChunkNameCache = options.assetsByChunkNameCache;

  //create a list of entries
  const entries = {};
  if (metadata.layout.component) {
    entries[metadata.layout.chunkName] = metadata.layout.component;
  }
  metadata.pages.forEach(page => {
    if (page.component) {
      entries[page.chunkName] = page.component;
    }
  });

  //check there is at least one client-side script
  if (Object.keys(entries).length === 0) {
    return;
  }

  const builder = createCommonConfig({
    target: 'node',
    styles: 'ignore',
    optimize: options.optimize
  });

  builder.merge({

    entry: entries,

    output: {
      libraryTarget: 'commonjs'
    },

    //exclude `node_modules` because some have dynamic imports and don't bundle well, results in multiple copies of
    // React+ReactHelmet being used between the layouts and the pages, and we have nothing to gain
    // by bundling them for a static build - for a server bundle we may have something to gain
    externals: [nodeExternals()],

    plugins: [
      new StaticReactRenderPlugin({

        layout: metadata.layout.chunkName,
        pages: metadata.pages.map(page => page.chunkName),

        getLayoutProps: (props, ctx) => {

          //get the layout and page scripts
          let scripts = [].concat(
            getScriptFilesFromCache(ctx.layoutChunk.name, assetsByChunkNameCache, builder.publicPath),
            getScriptFilesFromCache(ctx.pageChunk.name, assetsByChunkNameCache, builder.publicPath)
          );

          //if the layout or page has scripts, add the vendor bundle
          if (scripts.length !== 0) {
            scripts = [].concat(
              getScriptFilesFromCache('vendor', assetsByChunkNameCache, builder.publicPath),
              scripts
            );
          }

          //get the layout and page styles
          const styles = [].concat(
            getStyleFilesFromCache(ctx.layoutChunk.name, assetsByChunkNameCache, builder.publicPath),
            getStyleFilesFromCache(ctx.pageChunk.name, assetsByChunkNameCache, builder.publicPath)
          );

          //modify the existing props
          return Object.assign({}, props, {
            root: builder.publicPath,
            scripts,
            styles,
          });

        },

        getPageProps: props => Object.assign({}, props, {
          root: builder.publicPath,
        })

      })
    ]

  });

  return builder.toObject();
};
