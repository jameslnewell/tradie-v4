/* @flow weak */
'use strict';
const fs = require('fs');
const path = require('path');
const getPaths = require('./getPaths');

module.exports = root => {
  const src = getPaths(root).src;

  const getComponentPath = dir => {
    if (fs.existsSync(path.join(src, dir, 'index.jsx'))) {
      return `./${path.join(dir, 'index.jsx')}`;
    } else {
      return null;
    }
  };

  const getScriptPath = dir => {
    if (fs.existsSync(path.join(src, dir, 'index.jsx'))) {
      return `./${path.join(dir, 'index.jsx')}`;
    } else {
      return null;
    }
  };

  //get the site metadata
  //TODO: handle errors
  const site = require(`${src}/site.json`);

  //get the layout metadata
  let layout = null;
  if (typeof site.layout === 'string') {
    layout = {
      chunkName: path.relative('.', site.layout),
      buildPath: getComponentPath(site.layout),
      clientPath: getScriptPath(site.layout)
    };
  } else {
    layout = {
      chunkName: 'layout',
      buildPath: require.resolve(), //TODO:
      clientPath: null
    };
  }

  //get the page metadata
  if (!Array.isArray(site.pages)) {
    return Promise.reject(Error('site.json: Page must be an array of strings.'));
  }
  const pages = site.pages.map(page => ({
    chunkName: path.relative('.', page),
    buildPath: getComponentPath(page),
    clientPath: getScriptPath(page)
  }));

  return Promise.resolve({
    layout,
    pages
  });
};
