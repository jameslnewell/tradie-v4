'use strict';
const del = require('promised-del');

/**
 * @param {object}          options
 * @param {Array.<string>}  options.globs
 * @returns {Promise.<null>}
 */
module.exports = options => del(options.globs);
