# Templates

Templates tell `tradie` what and how to build, serve and test your files.

Templates `MUST` be named like:

    tradie-template-<name>
    
OR

    @<org>/tradie-template-<name>

Templates may contain:

- `package.json` - Required.
- `config/clean.js` - Optional. Returns configuration for the [clean command](https://github.com/jameslnewell/tradie-v2/blob/master/packages/tradie-webpack-scripts/README.md#cleanoptions).
- `config/serve.js` - Optional. Returns configuration for the [serve command](https://github.com/jameslnewell/tradie-v2/blob/master/packages/tradie-webpack-scripts/README.md#serveoptions).
- `config/build.js` - Optional. Returns configuration for the [build command](https://github.com/jameslnewell/tradie-v2/blob/master/packages/tradie-webpack-scripts/README.md#buildoptions).
- `config/test.js` - Optional. Returns configuration for the [test command](https://github.com/jameslnewell/tradie-v2/blob/master/packages/tradie-webpack-scripts/README.md#testdoptions).
