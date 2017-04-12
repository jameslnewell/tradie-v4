# Why

We use many different tools and technologies in a project. Setting up a new project from scratch is slow, manual and error prone. 
Getting all the pieces to work together, and in the optimal configuration is difficult and can take weeks to months of 
experimentation and learning.

Creating a new project by copying from an existing project is much faster than setting up a new project from scratch. 
However, when an improvement is made or a bug is fixed in the existing project, manual effort is required to add the 
improvement or bug fix to the new project. Copying the changes to the new project is tedious - you need to know what 
has changed in the existing project and be careful you don't get rid of anything that has intentionally changed in the 
new project.
 
From my experience at nib, these improvements and fixes rarely get replicated across projects because they're tedious and
distracting from work which visibly drives business value. They build up over time until it seems easier to re-create the
project from scratch instead of trying to update all the things.

Tradie aims to solve these two problems by:
- providing pre-configured project templates, with all the pieces working together and in the optimal configuration so 
you don't have to
- encapsulating as much of the project configuration as possible in a npm package, so that integrating improvements and 
fixes are as simple as bumping the package version


## Goals

- make setting up new projects according to "best practice" quicker and easier
- ease the burden of keeping tooling up-to-date in projects
- abstract the tooling so we can switch tools more easily (e.g. Browserify to Webpack)






Templates

Goals for official tradie templates:
- do as much as they can to support a particular project type, minimising the need for custom setup
- have zero or near to zero configuration - configuration makes code more complex and puts more effort on the user - 
we'll try and support common functionality out-of-the box and push users to fork the template or setup the tooling from 
scratch if they have custom requirements that don't fit the needs of the many
