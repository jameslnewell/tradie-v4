const fileName = require('file-name');

module.exports = path => fileName(path) === 'server';
