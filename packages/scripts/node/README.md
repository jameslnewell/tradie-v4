<center>
  <img src="https://github.com/jameslnewell/tradie-v4/blob/master/docs/img/logo.png" height="40"/>
</center>

---

# @tradie/node-scripts

An opinionated set of scripts for creating and maintaining node packages.

Feel like you spend more time setting up and updating the tools to build, test
and maintain your project? `@tradie/node-scripts` lets you focus on
writing code and spend less time setting up and updating the tools to build,
test and maintain your package. It provides you with a way to keep tooling
consistent across multiple packages with minimal effort.

## Usage

Create a new folder for your project:

```
mkdir my-package && cd my-package
```

Create the files for your project:

```
npx --package @tradie/node-scripts node-scripts create
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
