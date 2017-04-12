# <a href="https://github.com/jameslnewell/tradie"><img alt="tradie" src="https://github.com/jameslnewell/tradie-v4/blob/master/logo.png" height="60px" /></a>

[![npm](https://img.shields.io/npm/v/tradie.svg)]()

A CLI for building web apps. Like `create-react-app` but configurable via templates.

> Tradie is still under development and we haven't published all the packages yet. If you're keen to help, take a look at the open the [issues](https://github.com/jameslnewell/tradie-v4/issues), otherwise come back soon!

## Usage

`tradie` requires a template in order to know how to build, serve and test your app. 
Choose a [`template`](https://github.com/jameslnewell/tradie-v4/tree/master/packages/tradie#templates) and follow its documentation to set up up your project.

## Commands

##### `tradie clean` 

Remove all compiled artifacts and temporary files.

##### `tradie build`

Bundle source assets into compiled artifacts.

- `--watch` - watch all source files and re-compile when they change
- `--optimize` - create an optimized build

##### `tradie serve` 

Bundle and serve compiled artifacts with HMR.

##### `tradie test`

Run tests.

- `--watch` - watch all test files and re-compile when they change
- `--coverage` - collect and output test coverage

## Debugging

`tradie` clears the screen on compilation and attempts to make Webpack messages more readable. In some instances this can 
make debugging more difficult. You can turn off this functionality by setting a value for the `DEBUG` environment variable.

> For example:
```
#*nix
export DEBUG=1
tradie serve

#win
set DEBUG=1
tradie serve
```

Many of `tradie`'s dependencies use the [debug](https://www.npmjs.com/package/debug) package. You can vary the value of 
the `DEBUG` environment variable to show 
more or less information. 

> For example:
```
#*nix
export DEBUG="tradie*"
tradie serve

#win
set DEBUG="tradie*"
tradie serve
```

## Templates

Templates tell `tradie` how to build, serve and test your app. They contain configuration for Webpack and Jest.

Choose from one of the existing templates below or [build your own](https://github.com/jameslnewell/tradie-v4/blob/master/docs/templates.md).

- [tradie-template-react-static-site](https://www.npmjs.com/package/tradie-template-react-static-site)
- [tradie-template-react-app](https://www.npmjs.com/package/tradie-template-react-app)

