# Change Log

All notable changes to this project will be documented in this file.
See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.1"></a>
## [1.1.1](https://github.com/jameslnewell/tradie-v4/compare/tradie-scripts-node-package@1.1.0...tradie-scripts-node-package@1.1.1) (2017-06-14)




<a name="1.1.0"></a>
# [1.1.0](https://github.com/jameslnewell/tradie-v4/compare/tradie-scripts-node-package@1.0.1...tradie-scripts-node-package@1.1.0) (2017-06-14)


### Bug Fixes

* display errors when built ([86ae3cc](https://github.com/jameslnewell/tradie-v4/commit/86ae3cc))
* fix linting and use es imports which breaks a few things ([03c16f8](https://github.com/jameslnewell/tradie-v4/commit/03c16f8))
* removed the builder, split the reporting into tradie-utils-reporter ([45c90b4](https://github.com/jameslnewell/tradie-v4/commit/45c90b4))
* show the full error stack for additional information ([ab6264f](https://github.com/jameslnewell/tradie-v4/commit/ab6264f))


### Features

* added a clean command ([a49733d](https://github.com/jameslnewell/tradie-v4/commit/a49733d))
* added linting to the scripts/template ([34048a1](https://github.com/jameslnewell/tradie-v4/commit/34048a1))




<a name="1.0.1"></a>
## [1.0.1](https://github.com/jameslnewell/tradie-v4/compare/tradie-scripts-node-package@1.0.0...tradie-scripts-node-package@1.0.1) (2017-06-13)


### Bug Fixes

* changed the name of all the unpublished utils packages ([097b032](https://github.com/jameslnewell/tradie-v4/commit/097b032))




<a name="1.0.0"></a>
# 1.0.0 (2017-06-13)


### Bug Fixes

* fix error handling in tradie-scripts-node-package and tradie ([87c253b](https://github.com/jameslnewell/tradie-v4/commit/87c253b))


### Features

* downgrade versions and change structure ([54a0dc8](https://github.com/jameslnewell/tradie-v4/commit/54a0dc8))
* major refactor to support multiple types of scripts ([3ecd07c](https://github.com/jameslnewell/tradie-v4/commit/3ecd07c))


### BREAKING CHANGES

* `tradie-template-*` packages must include a `tradie-scripts-*` package in their dependencies.
