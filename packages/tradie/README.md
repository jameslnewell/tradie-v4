# tradie

A CLI for building projects with Webpack.

## Installation

    npm install --save-dev tradie tradie-template-*
    
  > Note: Tradie requires a template to run
    
## Usage

    tradie clean  # remove the generated artifacts
    tradie build  # build the generated artifacts
    tradie serve  # automatically build, re-build and serve generated artifacts
    tradie test   # build and run tests

## Templates

- [tradie-template-react-static-site](https://www.npmjs.com/package/tradie-template-react-static-site)

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
