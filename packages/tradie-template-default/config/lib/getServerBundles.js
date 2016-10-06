const isServerBundle = require('./isServerBundle');

module.exports = bundles => bundles.filter(isServerBundle);
