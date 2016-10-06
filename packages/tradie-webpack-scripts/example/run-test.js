const path = require('path');
const test = require('../test');

const options = {

  // watch: true,
  path: path.join(__dirname, 'dist', 'main.js'),
  webpack: {
    context: __dirname,
    entry: './src/test.js',
    output: {
      path: path.join(__dirname, 'dist')
    }
  },

};

test(options)
  .then(

    () => console.log('OK'),

    error => {
      console.log('ERR');
      process.exit(1);
    }

  )
;