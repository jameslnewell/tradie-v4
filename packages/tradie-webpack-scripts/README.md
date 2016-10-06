# tradie-webpack-scripts

Scripts for compiling bundles with `webpack`.
 
## Installation

    npm install --save tradie-webpack-script
    
## API

### serve(options)

> Yet-to-be-implemented.

Start a dev-server, compile vendor, client and server bundles, reporting errors and warnings to the user.

### build(options)

Compile vendor, client and server bundles, reporting errors and warnings to the user.

**Parameters:**
- `options : Object`
    - `watch : boolean`
    - `webpack : Object`
        - `vendor : Object` - `webpack` configuration for the vendor bundle
        - `client : Object` - `webpack` configuration for the client bundle
        - `server : Object` - `webpack` configuration for the server bundle

**Returns:**

A `Promise`. The promise is resolved when the bundle has been successfully compiled. The promise is rejected when the compilation has failed with errors. In watch-mode 
the promise is resolved when an interrupt signal is received.

### test(options)

Compile and run a test bundle, reporting errors and warnings to the user.

> Use a test-runner that has an API to run on NodeJS. e.g. [`mocha`](https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically), [`tape`](https://www.npmjs.com/package/tape) etc.

> Bundle must be created at `${options.root}/tests.js`.

**Parameters:**

- `options : Object`
    - `watch : boolean`
    - `webpack : Object` - `webpack` configuration for the test bundle


**Returns:**

A `Promise`. The promise is resolved when the bundle has been successfully compiled and run. The promise is rejected when the compilation has failed with errors or has failed to run. In watch-mode 
the promise is resolved when an interrupt signal is received.