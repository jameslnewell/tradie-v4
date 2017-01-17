# tradie-template-react-static-site

Tradie template for building static sites with React. 

## Installation

```bash
npm install --save-dev tradie tradie-template-react-static-site
```

## Usage

#### Creating the layout

The layout defines the template which each page is rendered into. 

The the layout may exist anywhere within the `./src` directory. You will need to tell `tradie` which directory the layout lives in:

`./src/site.json` 
```json
{
  "layout": "./layout"
}
``` 

The layout directory must contain a `index.jsx` file. It should export two properties:
- `getProps` - Optional. A `function` that returns a `Promise`. Used to fetch any data required by the layout component.
- `default` - Required. A `React.Component`. Used to render the page into, usually including the `<head/>`, `<body/>` 
and any other components common to every page page.


The layout component will receive the following props:
- `root` - A `string`. The path of the root directory. 
- `styles` - An `array` of `strings`. A list of style bundles extracted from the layout module and/or the page module.
- `scripts` - An `array` of `strings`. A list of script bundles used by the layout module and/or the page module.
- `children` - A `node`.
- `...` - Any other props returned by `getProps()`.

###### Styles

Any styles imported by the module (e.g. `import './index.css';`) will be extracted as an external CSS file.

###### Scripts

The layout directory may contain a `script.js` file. This file and its dependencies will be transpiled and bundled for use on the client.
Styles imported in this file will not be extracted and will remain in the JS bundle.

###### Example

`./src/layout/index.jsx`

```js
import React from 'react';

export default ({root, styles, scripts, children}) => (
  <html>
    <head>
      <meta charSet="utf-8"/>
      {styles.map(
        style => <link key={style} rel="stylesheet" href={style}/>
      )}
    </head>
    <body>
      <header>
        <a href={root}>&#127968;</a>
      </header>
      {children}
      {scripts.map(
        script => <script key={script} src={script} defer/>
      )}
    </body>
  </html>
);
````

#### Creating a page

A page defines the content of each page. 

The the page may exist anywhere within the `./src` directory. You will need to tell `tradie` which directory the page lives in and where the rendered page should be output:

`./src/site.json` 
```json
{
  "pages": [
    "./pages/HelloWorld"
  ]
}
``` 

The page directory must contain a `index.jsx` file. It should export three properties: 
- `getProps` - Optional. A `function` that returns a `Promise`. Used to fetch any data required by the page component
 e.g. product information, product prices etc. May return an `array` if the page should be rendered multiple times.
- `getPath` - Required. A `function` that returns a `string`. Used to get the path of the rendered file. Will be 
called multiple times if `getProps()` returns an `array`.
- `default` - Required. A `React.Component`. Used to render the page.


A page component will receive the following props:
- `root` - A `string`. 
- `...` - Any other props returned by `getProps()`.

###### Styles

Any styles imported by the module (e.g. `import './index.css';`) will be extracted as an external CSS file.

###### Scripts

The page directory may contain a `script.js` file. This file and its dependencies will be transpiled and bundled for use on the client.
Styles imported in this file will not be extracted and will remain in the JS bundle.

###### Example

`./src/pages/HelloWorld/index.jsx`

```js

export default () => (
  <div>
    <h1>Hello world!</h1>
  </div>
);
````

#### Commands

`tradie build`

Will lint, transpile, bundle and render your pages into the `./dist` directory.

`tradie build --watch`

Will lint, transpile, bundle and render your pages into the `./dist` directory whenever a source file changes.

`tradie build --optimize`

Will lint, transpile, bundle, minify and render your pages into the `./dist` directory.

`tradie serve`

Will lint, transpile, bundle and render your pages into the `./dist` directory, and serve the directory at `http://localhost:3000`.

`tradie test`

Will lint, transpile, bundle and run your `*.test.{js,jsx}` files.

`tradie test --watch`

Will lint, transpile, bundle and run your `*.test.{js,jsx}` files whenever a source file changes.
