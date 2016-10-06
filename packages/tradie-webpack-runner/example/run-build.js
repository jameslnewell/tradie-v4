const path = require('path');
const build = require('./../lib/build');

const options = {

  // watch: true,

  webpack: {

    vendor: {
      context: __dirname,
      entry: 'react',
      output: {
        path: path.join(__dirname, 'dist')
      }
    },

    client: {
      context: __dirname,
      entry: './src/client.js',
      output: {
        path: path.join(__dirname, 'dist')
      }
    },

    server: {
      context: __dirname,
      entry: './src/server.js',
      output: {
        path: path.join(__dirname, 'dist')
      }
    }

  }

};

build(options)
  .then(

    () => console.log('OK'),

    error => {
      console.log('ERR');
      process.exit(1);
    }

  )
;