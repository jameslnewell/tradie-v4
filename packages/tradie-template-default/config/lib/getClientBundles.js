const isClientBundle = require('./isClientBundle');

module.exports = bundles => bundles.filter(isClientBundle);
