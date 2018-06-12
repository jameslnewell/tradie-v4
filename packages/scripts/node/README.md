# @tradie/node-scripts

An opinionated set of scripts for creating and maintaining node packages.

## Usage

```
npx --package @tradie/node-scripts node-scripts create my-package
```

## Commands

### `node-scripts clean`

Remove generated files and folders.

```
tradie clean
```

### `node-scripts build`

Lints and transpiles the source files and exports their types.

```
tradie build [--watch]
```

### `node-scripts test`

Run the test files.

```
tradie test [--watch] [--coverage]
```

### `node-scripts example`

Runs an example file.

```
tradie example [module]
```
