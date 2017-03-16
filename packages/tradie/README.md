# tradie

A CLI for building projects with Webpack.

## Installation

    npm install --save-dev tradie tradie-template-*
    
  > Note: Tradie requires a template to run
    
## Usage

### `tradie clean`

Remove all compiled artifacts and temporary files.

### `tradie serve`

Bundle and serve compiled artifacts with HMR.

### `tradie build`

Bundle source assets into compiled artifacts.

Arguments:
- `--watch` - watch all source files and re-compile when they change
- `--optimize` - create an optimized build

### `tradie test`

Arguments:
- `--watch` - watch all test files and re-compile when they change
- `--coverage` - collect and output test coverage


## Templates

- [tradie-template-react-app](https://www.npmjs.com/package/tradie-template-react-app)

## Debugging

Tradie clears the screen on compilation and attempts to make Webpack errors more readable. In some instances this can 
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

Many of Tradie's dependencies use the [debug](https://www.npmjs.com/package/debug) package. You can vary the value of 
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
