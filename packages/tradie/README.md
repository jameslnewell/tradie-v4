# <a href="https://github.com/jameslnewell/tradie"><img alt="tradie" src="https://github.com/jameslnewell/tradie-v4/blob/master/logo.png" height="60px" /></a>

[![npm](https://img.shields.io/npm/v/tradie.svg)]()

A CLI for building web apps. Like `create-react-app` but configurable via templates.

## Usage

`tradie` requires a template in order to know how to build, serve and test your app. 
Choose a [`template`](https://github.com/jameslnewell/tradie-v4/tree/master/packages/tradie#templates) and follow its documentation to set up up your project.

## Commands

##### `tradie clean` 
Remove any generated artifacts and/or temporary files.

##### `tradie build`
Build any generated artifacts.

- `--watch`
- `--optimize`

##### `tradie serve` 
Build any generated artifacts.

##### `tradie test`
Run tests.

- `--watch`
- `--coverage`

## Templates

Templates tell `tradie` how to build, serve and test your app. They contain configuration for Webpack and Jest.

Choose from one of the existing templates below or [build your own](https://github.com/jameslnewell/tradie-v4/blob/master/docs/templates.md).

- [tradie-template-react-static-site](https://www.npmjs.com/package/tradie-template-react-static-site)
- [tradie-template-react-app](https://www.npmjs.com/package/tradie-template-react-app)
