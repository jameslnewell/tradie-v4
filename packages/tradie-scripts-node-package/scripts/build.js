const path = require('path');
const Builder = require('../lib/Builder');

module.exports = function(options) {
  const root = options.root;
  const src = options.src;
  const dest = options.dest;
  const include = options.include;
  const exclude = options.exclude;
  const babel = options.babel;
  const eslint = options.eslint;
  const watch = options.watch;
  const builder = new Builder({
    root,
    src,
    dest,
    include,
    exclude,
    babel,
    eslint,
    watch
  });

  process.on('SIGINT', () => {
    builder.stop();
  });

  return builder.start().wait();
};
