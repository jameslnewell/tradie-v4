# tradie-template-react-app

A `tradie` template for creating apps with React.


## Installation

```bash
npm install --save-dev tradie@4 tradie-template-react-app
```

## Usage

See [`tradie`](https://www.npmjs.com/package/tradie) for a list of commands.


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

