const path = require('path');
const Builder = require('../lib/Builder');

module.exports = function(options) {
  const root = options.root;
  const src = options.src;
  const dest = options.dest;
  const include = options.include;
  const exclude = options.exclude;
  const babel = options.babel;
  const watch = options.watch;
  debugger;
  const builder = new Builder({
    root,
    src,
    dest,
    include,
    exclude,
    babel,
    watch
  });

  process.on('SIGINT', () => {
    builder.stop();
  });

  return builder.start().wait();
  // .then(() => console.log('wait resolve'), err => console.log('wait rejected', err))
};
