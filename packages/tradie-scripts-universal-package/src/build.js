import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';


const config = {
  entry: './src/index.js',
  external: id => {
    console.log('module id':, id);
    //TODO: chekc the module is inside the `src` dir
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
    }),
    babel({}),
    uglify()
    //rollup-plugin-node-resolve //for pkg.browser
    //rollup-plugin-node-builtins //for `process.env`
  ]
}

//TODO: minified version of UMD
//TODO: babel for lib

export default function(options) {
  return Promise.all(config.map(cfg => new Promise((resolve, reject) => {
    mkdirp(path.dirname(cfg.dest), mkdirError => {
      if (mkdirError) return reject(mkdirError);
      rollup.rollup(cfg.options).then(bundle => {
          return bundle.write({
            format: cfg.format, //umd, es
            dest: cfg.dest, //./dist/<package-name>.es.js
            sourceMap: true
          })
      });
    });
  })));
}
