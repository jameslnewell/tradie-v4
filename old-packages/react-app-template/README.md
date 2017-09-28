# @tradie/react-app-template

A `tradie` template for creating apps with React.


## Installation

```bash
npm install --save-dev tradie@4 @tradie/react-app-template
```

## Usage

Create the following files:

- `./src/vendor.js` - Optional. Import all packages you would like in the vendor bundle e.g. `react`, `react-dom`, `react-redux`, `redux`, `react-router` etc. This bundle can be cached forever and saves the user from downloading the bundle again when your app changes. 
- `./src/client.js` - Required. Render your app on the client. Check out [`rechannel`](https://npmjs.com/package/rechannel).
- `./src/server.js` - Required. Use `express` or similar to create a server that serves your app on the server. Check out [`rechannel`](https://npmjs.com/package/rechannel).

Add a scripts section to your `package.json`:
```json
{
  "scripts": {
    "clean": "tradie clean",
    "start": "tradie serve",
    "build": "tradie build --optimize",
    "test": "tradie test --watch"
  }
}
```

Run `npm start`.

## Commands

### `tradie clean`

Remove `./tmp` and `./dist` directories containing temporary and generated files.

### `tradie serve`

Compile vendor, client and server bundles, serve the vendor and client bundles with HMR and run the server bundle.

Transpiled with `babel-preset-env`.... blah blah blah

### `tradie build`

Compile vendor, client and server bundles.

Arguments:

- `--watch` - Watch the source files and re-compile whenever they change
- `--optimize` - 

### `tradie test`

Run all `./src/**/*.test.js` files.

Arguments:

- `--watch` - Watch the test files and re-compile whenever they change
- `--coverage` - Collect coverage information and output reports (see `./tmp/coverage`) 

## Configuration

### `BASE_URL`

## How to...

### Code splitting
`import('./path/to/file').then(module => {/* do something with module */);`

### Short module names

Create files in `./src/node_modules/my-component`

Then import files like `import MyComponent from 'my-component';`

NOTE: don't install public packages in `./src/node_modules` so you can commit this folder.

------


Goals: 
- https://medium.com/google-developers/instant-loading-web-apps-with-an-application-shell-architecture-7c0c2f10c73#.bcwae13h3
- https://medium.com/@addyosmani/progressive-web-apps-with-react-js-part-3-offline-support-and-network-resilience-c84db889162c#.ezj4cdh6i

