# Scripts

Scripts tell `tradie` how to build, serve and test your files.

Scipts `MUST` be named like:

    tradie-scripts-<name>
    
OR

    @<org>/tradie-scripts-<name>

Scripts `MUST` expose:

- A `./cli.js` module exporting a function. The function will be passed an instance of `yargs` and should configure the necessary commands and arguments.
- A `./scripts` directory cotaining a module for each configured command. Each script module should export a function that returns a promise when the command is complete. The script will be passed a configuration object, configured as desired by a template.

# Templates

Templates allow you to configure

Templates `MUST` be named like:

    tradie-template-<name>
    
OR

    @<org>/tradie-template-<name>

Templates must have `tradie` and a `tradie-scripts-*` package listed in their dependencies.

Templeates `MUST` expose:

- A `./config` directory containing a module for each script.
