const isServerBundle = require('./isServerBundle');

module.exports = path => !isServerBundle(path);
