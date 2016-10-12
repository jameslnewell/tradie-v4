const path = require('path');
const serve = require('../lib/serve');

const options = {

  // watch: true,

  webpack: {

    vendor: {
      target: 'web',
      context: __dirname,
      entry: 'react',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'vendor.js'
      }
    },

    client: {
      target: 'web',
      context: __dirname,
      entry: './src/client.js',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'client.js'
      }
    },

    server: {
      target: 'node',
      context: __dirname,
      entry: './src/server.js',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'server.js'
      }
    }

  }

};

serve(options)
  .then(

    () => console.log('OK'),

    error => {
      console.log('ERR');
      process.exit(1);
    }

  )
;