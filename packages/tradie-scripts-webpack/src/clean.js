import del from 'promised-del';

/**
 * @param {object}          options
 * @param {Array.<string>}  options.globs
 * @returns {Promise.<null>}
 */
export default function(options) {
  return del(options.globs);
}
