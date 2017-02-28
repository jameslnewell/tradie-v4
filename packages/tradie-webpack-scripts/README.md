# tradie-webpack-scripts

Scripts for compiling bundles with Webpack.
 
## Installation

    npm install --save tradie-webpack-script
    
## API

### clean(options)

Remove all temporary and generated files.

**Parameters:**
- `options : Object`
    - `globs : Array<String>` - The file paths to remove.

**Returns:**

A `Promise`. The promise is resolved when the temporary and generated files have been successfully removed. The promise is rejected when the deletion fails to remove files.

### serve(options)

> Yet-to-be-implemented.

Start a dev-server, compile vendor, client, build and server bundles, whilst reporting errors and warnings to the user.

### build(options)

Compile vendor, client, build and server bundles, whilst reporting errors and warnings to the user.

**Parameters:**
- `options : Object`
    - `watch : boolean` - Whether to re-compile the vendor, client and build bundles when the source files change
    - `webpack : Object`
        - `vendor : Object` - Webpack configuration for the vendor bundle
        - `client : Object` - Webpack configuration for the client bundle
        - `build : Object` - Webpack configuration for the build bundle
        - `server : Object` - Webpack configuration for the server bundle

**Returns:**

A `Promise`. The promise is resolved when the bundles have been successfully compiled. The promise is rejected when the compilation has failed with errors. In watch-mode 
the promise is resolved when an interrupt signal is received.

### test(options)

Compile a test bundle in memory, whilst reporting errors and warnings to the user.

**Parameters:**

- `options : Object`
    - `watch : boolean` - Whether to re-compile the test bundle when the source files change
    - `webpack : Object` - Webpack configuration for the test bundle


**Returns:**

A `Promise`. The promise is resolved when the bundle has been successfully compiled and run. The promise is rejected when the compilation has failed with errors or has failed to run. In watch-mode 
the promise is resolved when an interrupt signal is received.
